"use client";

import Footer from "@/blocks/Footer";
import Navbars from "@/blocks/Navbar";
import { Btn } from "@/components/elements/game/Btn";
import { Leaderboard } from "@/components/elements/game/Leaderboard";
import { Overlay } from "@/components/elements/game/Overlay";
import { Panel } from "@/components/elements/game/Panel";
import { Sparkline } from "@/components/elements/game/Sparkline";
import { Star } from "@/components/elements/game/Star";
import { tone } from "@/components/elements/game/tone";
import { buy, fmt, game, netWorth, newPortfolio, portfolio, rankFor, ScoreEntry, sell, trade } from "@/lib/game";
import { Quote, QuotesResponse } from "@/lib/types";
import { cn } from "cn";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type final = { worth: number; returnPct: number; trades: number; seconds: number; best?: string; };
type market = {
    quotes: Quote[];
    history: Record<string, number[]>;
    ticks: Record<string, "up" | "down" | null>;
    feed: { status: "connecting" | "live" | "down"; error?: string; lastOk: number }
}
type run = {
    phase: "lobby" | "playing" | "over";
    portfolio: portfolio;
    trades: trade[];
    worthHistory: number[];
    endsAt: number;
    final: final | null;
    saved: boolean;
}
const keys = { scores: "bullion:scores", name: "bullion:name" };
const store = {
    get<T>(key: string, fallback: T): T {
        try {
            return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
        } catch {
            return fallback;
        }
    },
    set(key: string, value: unknown) {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch {}
    }
}
const freshRun = (phase: run["phase"] = "lobby"): run => ({
    phase,
    portfolio: newPortfolio(),
    trades: [],
    worthHistory: [game.startingCash],
    endsAt: phase === "playing" ? Date.now() + game.roundSeconds * 1000 : 0,
    final: null,
    saved: false,
})

export default function Game() {
    const [market, setMarket] = useState<market>({
        quotes: [],
        history: {},
        ticks: {},
        feed: {
            status: "connecting",
            lastOk: 0
        }
    })
    const [run, setRun] = useState<run>(() => freshRun())
    const [ui, setUi] = useState({
        selected: null as string | null,
        toast: null as { text: string; kind: "good" | "bad" | "info"; id: number } | null,
        scores: [] as ScoreEntry[],
        name: "",
        now: 0,
    })
    const patchUi = (p: Partial<typeof ui>) => setUi((u) => ({ ...u, ...p }));
    const prices = useMemo(() => Object.fromEntries(market.quotes.map((q) => [q.symbol, q.price])), [market.quotes]);
    const live = useRef({ run, prices });
    live.current = { run, prices };

    const { phase, portfolio } = run;
    const feedStale = market.feed.status !== "live" || ui.now - market.feed.lastOk > game.staleAfterMs;
    const secondLeft = phase === "playing" ? Math.max(0, Math.ceil((run.endsAt - ui.now) / 1000)) : game.roundSeconds;
    const tradable = phase === "playing" && !feedStale;

    useEffect(() =>
        patchUi({ 
            scores: store.get(keys.scores, []),
            name: store.get(keys.name, "")
        }),
    [])

    useEffect(() => {
        let cancelled = false;
        let inFlight = false;

        async function poll() {
            if (inFlight) return;
            inFlight = true;
            try {
                const res = await fetch("/api/quotes", { cache: "no-store" });
                const data = (await res.json()) as QuotesResponse & { error?: string };
                if (!res.ok || !Array.isArray(data.quotes)) throw new Error(data.error ?? `HTTP ${res.status}`);
                if (cancelled) return;

                const prev = live.current.prices;
                setMarket((m) => ({
                    quotes: data.quotes,
                    feed: {
                        status: "live",
                        lastOk: Date.now(),
                    },
                    ticks: Object.fromEntries(
                        data.quotes.map(
                           (q) => 
                            [
                                q.symbol, prev[q.symbol] === undefined ||
                                prev[q.symbol] === q.price ? null : q.price > prev[q.symbol] ? "up" : "down"
                            ]
                        ),
                    ),
                    history: Object.fromEntries(
                        data.quotes.map((q) => 
                            [
                                q.symbol, 
                                [...(m.history[q.symbol] ?? []), q.price].slice(-game.historyLength)
                            ]
                        ),
                    ),
                }))
                setUi((u) => ({
                    ...u,
                    selected: u.selected ?? data.quotes[0]?.symbol ?? null
                }));
                
                if (live.current.run.phase === "playing") {
                    const priceMap = Object.fromEntries(data.quotes.map((q) => [q.symbol, q.price]));
                    setRun((r) => ({
                        ...r,
                        worthHistory: [
                            ...r.worthHistory,
                            netWorth(r.portfolio, priceMap)
                        ].slice(-game.roundSeconds * 2)
                    }));
                }
            } catch (err) {
                if (!cancelled)
                    setMarket((m) => 
                        ({ 
                            ...m, 
                            feed: { 
                                ...m.feed, 
                                status: "down", 
                                error: err instanceof Error ? err.message : String(err) 
                            }
                        })
                    );
            } finally {
                inFlight = false;
            }
        }
        
        poll();
        const ids = [
            setInterval(poll, 1000),
            setInterval(() => setUi((u) => ({
                ...u,
                now: Date.now()
            })), 250)
        ];
        return () => {
            cancelled = true;
            ids.forEach(clearInterval);
        }
    }, [])

    useEffect(() => {
        if (!ui.toast) return;
        const id = setTimeout(() => patchUi({ toast: null }), 2200);
        return () => clearTimeout(id);
    }, [ui.toast]);

    const flash = (text: string, kind: "good" | "bad" | "info" = "info") => patchUi({ toast: { text, kind, id: Date.now() }});

    const startGame = useCallback(() => setRun(freshRun("playing")), []);

    const endgame = useCallback(() => {
        const { run: r, prices: px } = live.current;
        if (r.phase !== "playing") return;

        let p = r.portfolio;
        for (const sym of Object.keys(p.posiitons))
            p = sell(p, sym, px[sym] ?? 0, 1)?.portfolio ?? p;

        const pnl: Record<string, number> = {};
        for (const t of r.trades) 
            pnl[t.symbol] = (pnl[t.symbol] ?? 0) + (t.side === "SELL" ? t.total : -t.total);

        for (const [sym, pos] of Object.entries(r.portfolio.posiitons))
            pnl[sym] = (pnl[sym] ?? 0) + pos.shares * (px[sym] ?? 0);

        const [best, bestPnl] = Object.entries(pnl).sort((a, b) => b[1] - a[1])[0] ?? [];

        setRun({
            ...r,
            phase: "over",
            portfolio: p,
            final: {
                worth: p.cash,
                returnPct: ((p.cash - game.startingCash) / game.startingCash) * 100,
                trades: r.trades.length,
                seconds: Math.min(game.roundSeconds, game.roundSeconds - Math.ceil((r.endsAt - Date.now()) / 1000)),
                best: bestPnl > 0 ? best : undefined,
            }
        })
    }, [])

    useEffect(() => {
        if (phase === "playing" && ui.now >= run.endsAt)
            endgame();
    }, [phase, ui.now, run.endsAt, endgame]);

    const trade = useCallback(
        (side: "BUY" | "SELL", symbol: string, amount: number) => {
            const { run: r, prices: px } = live.current;
            if (r.phase !== "playing") return;
            if (feedStale) return flash("server is down :/", "bad");
            const price = px[symbol];
            const res = side === "BUY" ? buy(r.portfolio, symbol, price, amount) : sell(r.portfolio, symbol, price, amount);
            if (!res) return flash(side === "SELL" ? `You don't own any ${symbol}` : price > 0 ? "Not enough cash" : `${symbol} has no tradeable price`, "bad");
            setRun((cur) => ({
                ...cur,
                portfolio: res.portfolio,
                trades: [
                    {
                        id: Date.now() + Math.random(),
                        at: Date.now(),
                        side,
                        symbol,
                        shares: res.shares,
                        price,
                        total: res.total,
                        fee: res.fee
                    },
                    ...cur.trades
                ],
            }));
            flash(
                side === "BUY"
                    ? `Bought ${fmt.shares(res.shares)} ${symbol} @ ${fmt.money(price)}`
                    : `Sold ${fmt.shares(res.shares)} ${symbol} for ${fmt.money(res.total)}`,
                    side === "BUY" ? "good" : "info",
            );
        },
        [feedStale]
    )

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement) return;
            const { run: r } = live.current;
            if (r.phase !== "playing") {
                if (e.key === "Enter" && r.phase === "lobby" && !feedStale) startGame();
                return;
            }
            const syms = market.quotes.map((q) => q.symbol);
            const idx = ui.selected ? syms.indexOf(ui.selected) : -1;
            if (e.key.toLowerCase() === "arrowdown" || e.key.toLowerCase() === "j") {
                e.preventDefault();
                patchUi({
                    selected: syms[Math.min(syms.length - 1, idx + 1)]
                })
            } else if (e.key.toLowerCase() === "arrowup" || e.key.toLowerCase() === "k") {
                e.preventDefault();
                patchUi({
                    selected: syms[Math.max(0, idx - 1)]
                })
            } else if (ui.selected && e.key.toLowerCase() === "b") {
                trade("BUY", ui.selected, 1000);
            } else if (ui.selected && e.key.toLowerCase() === "h") {
                trade("BUY", ui.selected, r.portfolio.cash / 2);
            } else if (ui.selected && e.key.toLowerCase() === "s") {
                trade("SELL", ui.selected, 1)
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [market.quotes, ui.selected, trade, startGame, feedStale])

    function submitScore() {
        if (!run.final || run.saved) return;
        const name = ui.name.trim() || "Anonymous";
        const scores = [
            ...ui.scores,
            {
                name, 
                netWorth: run.final.worth,
                returnPct: run.final.returnPct,
                trades: run.final.trades,
                at: Date.now()
            }
        ].sort((a, b) => b.netWorth - a.netWorth).slice(0, 10)
        store.set(keys.name, name)
        store.set(keys.scores, scores);
        patchUi({ scores })
        setRun((r) => 
            ({ 
                ...r, 
                saved: true 
            })
        )
    }
    const worth = netWorth(portfolio, prices);
    const pnl = worth - game.startingCash;
    const sel = market.quotes.find((q) => q.symbol === ui.selected);
    const selPos = sel && portfolio.posiitons[sel.symbol];
    const urgent = phase === "playing" && secondLeft <= 15;

    return (
        <>
            <Navbars/>
            <main className="text-white">
                <div className="bg-background/80 border-white/10 border-y z-30 sticky top-20 backdrop-blur-md">
                    <div className="mx-auto flex flex-wrap items-center max-w-7xl gap-x-6 gap-y-2 px-4 py-3 2xl:max-w-[1800px] 2xl:py-5">
                        <div className="grid flex-1 gap-4 grid-cols-3 sm:flex sm:gap-8">
                            <Star label="Net Worth" value={fmt.money(worth)} />
                            <Star label="P&L" value={fmt.money(pnl)} sub={fmt.pct((pnl / game.startingCash) * 100)} className={tone(pnl)} />
                            <Star label="Cash" value={fmt.money(portfolio.cash)} />
                        </div>
                        <div className="flex items-center sm:w-auto gap-3 w-full">
                            <div className="flex-1 sm:w-36">
                                <div className={cn("flex justify-between items-baseline text-xs uppercase tracking-wider 2xl:text-sm", urgent ? "text-rose-400" : "text-muted-foreground")}>
                                    Time
                                    <span className={cn("text-lg tabular-nums font-bold text-white 2xl:text-3xl", urgent && "animate-pulse text-rose-400")}>
                                        {fmt.clock(secondLeft)}
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-white/10 mt-1">
                                    <div
                                        className={cn("h-full transition-[width] rounded-full duration-300", urgent ? "bg-rose-500" : "bg-linear-30 from-red-800 via-red-400 to-red-600")}
                                        style={{ width: `${(secondLeft / game.roundSeconds) * 100}%` }}
                                    />
                                </div>
                            </div>
                            {phase === "playing" && <Btn onClick={endgame} variant="red">Cash out</Btn>}
                        </div>
                    </div>
                </div>
                <div className="grid mx-auto gap-4 px-4 py-6 max-w-7xl md:grid-cols[minmax(0, 1fr)_280px] lg:grid-cols-[300px_minmax(0,1fr)_300px] 2xl:max-w-[1800px] 2xl:grid-cols-[400px_minmax(0,1fr)_400px] 2xl:gap-6">
                    <Panel title="Market" meta={`${market.quotes.length} tickers`} className="lg:col-span-1 md:col-span-2 lg:overflow-y-auto lg:max-h-[calc(100dvh-14rem)]">
                        <ul className="flex mx-1 snap-x overflow-x-auto gap-2 px-1 pb-1 lg:flex-col lg:overflow-visible">
                            {market.quotes.map((q) => (
                                <li key={q.symbol} className="shrink-0 w-44 snap-start lg:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => patchUi({ selected: q.symbol })}
                                        className={cn(
                                            "relative grid w-full items-center gap-x-3 grid-cols-[1fr_auto] gap-y1 rounded-xl p-3 text-left transition",
                                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/70",
                                            ui.selected === q.symbol ? "border-red-400/60 bg-red-400/10" : "border-white/5 bg-white/2 hover:bg-white/5"
                                        )}
                                    >
                                        <span className="min-w-0">
                                            <b className="2xl:text-lg block">{q.symbol}</b>
                                            <small className="truncate block text-xs text-muted-foreground 2xl:text-sm">{q.name}</small>
                                        </span>
                                        <span className="tabular-nums text-right">
                                            <span
                                                key={q.price}
                                                className={cn(
                                                    "font-semibold block text-sm 2xl:text-lg",
                                                    market.ticks[q.symbol] === "up" && "animate-in fade-in text-emerald-300",
                                                    market.ticks[q.symbol] === "down" && "animate-in fade-in text-rose-300"
                                                )}
                                            >
                                                {fmt.money(q.price)}
                                            </span>
                                            <small className={cn("text-xs 2xl:text-sm", tone(q.changePct))}>{fmt.pct(q.changePct)}</small>
                                        </span>
                                        <Sparkline data={market.history[q.symbol] ?? []} width={200} height={24} className="col-span-2 h-6"/>
                                        {portfolio.posiitons[q.symbol] && (
                                            <span title="You own this" className="right-2 top-2 size-1.5 rounded-full bg-red-400 absolute" />
                                        )}
                                    </button>
                                </li>
                            ))}
                            {market.quotes.length === 0 && <li className="py-6 text-sm text-muted-foreground">Waiting for the first quotes</li>}
                        </ul>
                    </Panel>

                    <Panel className="flex-col flex gap-5">
                        {sel ? (
                            <>
                                <div className="flex-wrap flex items-center justify-center gap-3">
                                    <div>
                                        <div className="2xl:text-5xl tracking-tight font-bold text-3xl">{sel.symbol}</div>
                                        <div className="2xl:text-lg text-muted-foreground text-sm">{sel.name}</div>
                                    </div>
                                    <div className="tabular-nums text-right">
                                        <div className="2xl:text-5xl text-3xl font-bold">{fmt.money(sel.price)}</div>
                                        <div className={cn("text-sm 2xl:text-lg", tone(sel.change))}>
                                            {fmt.money(sel.change)} ({fmt.pct(sel.changePct)}) today
                                        </div>
                                    </div>
                                </div>
                                <Sparkline data={market.history[sel.symbol] ?? []} width={640} height={200} detailed className="sm:h-52 2xl:h-80 h-40" />
                                <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/3 p-3 sm:grid-cols-4">
                                {
                                    selPos ? (
                                        <>
                                            <Star label="You own" value={`${fmt.shares(selPos.shares)} sh`} />
                                            <Star label="Value" value={fmt.money(selPos.shares * sel.price)} />
                                            <Star label="Avg cost" value={fmt.money(selPos.costBasis / selPos.shares)} />
                                            <Star label="Unrealized" value={fmt.money(selPos.shares * sel.price - selPos.costBasis)} className={tone(selPos.shares * sel.price - selPos.costBasis)} />
                                        </>
                                    ) : (
                                        <span className="col-span-full text-sm text-muted-foreground">You don't hold any {sel.symbol} yet.</span>
                                    )
                                }
                                </div>
                                <div className="gap-3 sm:grid-cols-2 grid">
                                    <div className="grid gird-cols-4 gap-2">
                                        <span className="col-span-4 text-xs font-semibold tracking-wider uppercase text-emerald-300/80">Buy</span>
                                        {[100, 1000, 5000] .map((d) => (
                                            <Btn
                                                key={d}
                                                variant="buy"
                                                disabled={!tradable || portfolio.cash < 0.01}
                                                onClick={(() => trade("BUY", sel.symbol, d))}
                                            >
                                                ${d >= 1000 ? `${d / 1000}k` : d}
                                            </Btn>
                                        ))}
                                        <Btn className="bg-emerald-500 text-neutral-950 hover:bg-emerald-400" variant="buy" disabled={!tradable || portfolio.cash < 0.01} onClick={() => trade("BUY", sel.symbol, portfolio.cash)}>All in</Btn>
                                    </div>
                                    <div className="grid-cols-3 gap-2 grid">
                                        <span className="text-xs col-span-3 font-semibold uppercase tracking-wider text-rose-300/80">Sell</span>
                                        {[0.25, 0.5].map((f) => (
                                            <Btn
                                                key={f}
                                                variant="sell"
                                                disabled={!tradable || !selPos}
                                                onClick={() => trade("SELL", sel.symbol, f)}
                                            >
                                                {f * 100}%
                                            </Btn>
                                        ))}
                                        <Btn
                                            variant="sell"
                                            className="bg-rose-500 text-white hover:bg-rose-400"
                                            disabled={!tradable || !selPos}
                                            onClick={() => trade("SELL", sel.symbol, 1)}
                                        >
                                            Sell All
                                        </Btn>
                                    </div>
                                </div>
                                <p className="hidden text-sx text-muted-foreground md:block 2xl:text-sm">
                                    Keys: <kbd>ꜛ</kbd> <kbd>ꜜ</kbd> pick · <kbd>B</kbd> buy $1k · <kbd>H</kbd> halft your cash · <kbd>S</kbd> sell all ·{" "}
                                </p>
                            </>
                        ) : (
                            <div className="grid min-h-60 place-items-center text-muted-foreground">Pick a stock to trade</div>
                        )}
                    </Panel>

                    <Panel title="Your run" className="flex flex-col gap-4">
                        <Sparkline data={run.worthHistory} width={300} height={70} baseline={game.startingCash} className="h-16 2xl:h-24" />
                        <div>
                            <h3 className="mb-2 font-semibold text-xs uppercase trackignwider text-muted-foreground">Holdings</h3>
                            <ul className="space-y-1">
                                {Object.entries(portfolio.posiitons).map(([sym, pos]) => {
                                    const gain = pos.shares * (prices[sym] ?? 0) - pos.costBasis;
                                    return (
                                        <li key={sym}>
                                            <button
                                                type="button"
                                                onClick={() => patchUi({ selected: sym })}
                                                className="rounded-lg gap-3 grid-cols-[1fr_auto_auto] grid px-2 py-2 text-left tabular-nums text-sm hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 2xl:text-base"
                                            >
                                                <b>{sym}</b>
                                                <span>{fmt.money(pos.costBasis + gain)}</span>
                                                <span className={cn("w-16 text-right")}>{fmt.pct((gain / pos.costBasis) * 100)}</span>
                                            </button>
                                        </li>
                                    )
                                })}
                                {Object.keys(portfolio.posiitons).length === 0 && <li className="px-2 text-sm text-muted-foreground">All cash ? Make a move</li>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trades</h3>
                            <ul className="space-y-1.5">
                                {run.trades.slice(0, 12).map((t) => (
                                    <li key={t.id} className="flex items-center gap-2 text-sm tabular-nums 2xl:text-base">
                                        <span
                                            className={cn(
                                                "px-1.5 rounded py-0.5 text-[10px] font-bold 2xl:text-xs",
                                                t.side === "BUY" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                                            )}
                                        >
                                            {t.side}
                                        </span>
                                        <span className="truncate">
                                            {fmt.shares(t.shares)} {t.symbol}
                                        </span>
                                        <span className="ml-auto text-muted-foreground">@ {fmt.money(t.price)}</span>
                                    </li>
                                ))}
                                {run.trades.length === 0 && <li className="text-sm text-muted-foreground">No trades yet</li>}
                            </ul>
                        </div>
                    </Panel>
                </div>
                {ui.toast && (
                    <div
                        key={ui.toast.id}
                        role="status"
                        className={cn(
                            "fixed inset-x-4 x-50 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 max-w-sm mx-auto rounded-xl text-center px-4 py-3 text-sm font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-4 2xl:max-w-lg 2xl:text-lg",
                            { good: "bg-emerald-500 text-shadow-neutral-950", bad: "bg-rose-500 text-white", info: "bg-neutral-800 text-white"}[ui.toast.kind]
                        )}
                    >
                        {ui.toast.text}
                    </div>
                )}

                {phase === "lobby" && (
                    <Overlay label="Start a round">
                        <div>
                            <p className="uppercase tracking-[.2em] text-red-600 2xl:text-sm text-sx font-semibold">
                            Bullion - Trading Round
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl 2xl:text-6xl">Ready to start trade?</h1>
                        <p className="mt-4 text-muted-foreground 2xl:text-xl">
                            You get <b className="text-white">{fmt.money(game.startingCash)}</b> and{" "} second on the live feed. Buy low, sell high, finish with the biggest balance
                        </p>
                        <ul className="mt-5 space-x-2 text-left text-sm text-white/80 2xl:text-lg">
                            <li className="flex gap-2">
                                <span className="text-red-400">·</span>
                                Bet in dollars, not shares. Slices are allowed
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-400">·</span>
                                The house takes ${game.feeRate * 100}% every trade. Twitchy figures go broke.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-red-400">·</span>
                                Clock hits zero? Everything dumped at the final price No mercy                                
                            </li>
                        </ul>
                        <div className="mt-6">
                            <Btn
                                variant="red"
                                autoFocus
                                className="mt-6 w-full text-base"
                                disabled={feedStale}
                                onClick={startGame}
                            >
                                {feedStale ? "Waiting for the market feed" : "Open the market"}
                            </Btn>
                        </div>
                        {market.feed.status === "down" && <p className="mt-3 text-sm text-rose-400">Cant reach the feed: {market.feed.error}</p>}
                        <Leaderboard scores={ui.scores} />
                        </div>
                    </Overlay>
                )}
                {phase === "over" && run.final && (
                    <Overlay label="Round Result">
                        <p className="text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground 2xl:text-sm">Market closed</p>
                        <h1 className={cn("mt-2 text-4xl font-bold tabular-nums sm:text-5xl 2xl:text-7xl", tone(run.final.returnPct))}>{fmt.money(run.final.worth)}</h1>
                        <p className="mt-2 text-muted-foreground 2xl:text-xl">
                            {fmt.pct(run.final.returnPct)} in {fmt.clock(run.final.seconds)} · {run.final.trades} trades
                            {run.final.best && (
                                <>
                                    {" "}· best pick <b className="text-white">{run.final.best}</b>
                                </>
                            )}
                        </p>
                        <div className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4">
                            <div className="text-xl font-bold text-red-300 2xl:text-3xl">
                                {rankFor(run.final.returnPct).title}
                            </div>
                            <div className="text-sm text-muted-foreground 2xl:text-lg">
                                {rankFor(run.final.returnPct).blurb}
                            </div>
                        </div>
                        {run.saved ? (
                            <p className="mt-4 text-sm text-muted-foreground">Score saved</p>
                        ) : (
                            <form
                                className="mt-4 flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitScore();
                                }}
                              >
                                <input 
                                    value={ui.name}
                                    onChange={(e) => patchUi({ name: e.target.value })}
                                    placeholder="Your Name"
                                    maxLength={20}
                                    className="min-h-11 min-w-0 flex-1 rounded-lg broder border-white/15 bg-white/5 px-3 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/70 2xl:min-h-14 2xl:text-lg"
                                />
                                <Btn type="submit">Save Score</Btn>
                            </form>
                        )}
                        <Leaderboard scores={ui.scores} />
                        <div className="pt-4">
                            <Btn variant="red" autoFocus className="mt-6 w-full text-base" disabled={feedStale} onClick={startGame}>Play Again</Btn>
                        </div>
                    </Overlay>
                )}
            </main>
            <Footer/>
        </>
    )
}