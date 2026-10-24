"use client"

import { ScrollVelocityContainer, ScrollVelocityRow } from "@/components/ui/scroll-based-velocity";
import { BRANDS, initialQuotes, Quote } from "@/lib/brands";
import { cn } from "@/lib/utils";
import { number } from "motion";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const CONFIG = { pollMs: 1000, regroupMs: 10000 }
type Rows = { order: string[] }

function interleave(gainers: string[], losers: string[]) {
    const out: string[] = []
    const max = Math.max(gainers.length, losers.length)
    for (let i = 0; i < max; i++) {
        if (gainers[i]) out.push(gainers[i])
        if (losers[i]) out.push(losers[i])
    }
    return out
}

const half = Math.ceil(BRANDS.length / 2)

const store = {
    quotes: initialQuotes(),
    rows: {
       order: interleave(
        BRANDS.slice(0, half).map((b) => b.symbol),
        BRANDS.slice(half).map((b) => b.symbol),
       )
    } as Rows,
    lastRegroup: 0,
    inFlight: false, 
    timer: null as ReturnType<typeof setInterval> | null,
    listeners: new Set<() => void>(),
}

function regroup(list: Quote[]) {
    const symbols = [...list].sort((a, b) => b.changePct - a.changePct).map((q) => q.symbol)
    const mid = Math.ceil(symbols.length / 2)
    const next: Rows = {
        order: interleave(symbols.slice(0, mid), symbols.slice(mid).reverse()),
    }
    if (next.order.join() !== store.rows.order.join()) {
        store.rows = next
    }
}

async function poll() {
    if (store.inFlight) return;
    store.inFlight = true;
    try {
        const res = await fetch("/api/quotes", { cache: "no-store" })
        if (!res.ok) return

        const { quotes }: { quotes: Quote[] } = await res.json();

        store.quotes = Object.fromEntries(
            quotes.map((q) => {
                const old = store.quotes[q.symbol]
                return [q.symbol, old?.price === q.price && old?.open === q.open ? old : q]
            })
        )

        if (Date.now() - store.lastRegroup >= CONFIG.regroupMs) {
            regroup(quotes)
            store.lastRegroup = Date.now()
        }
        store.listeners.forEach((l) => l())
    } catch {

    } finally {
        store.inFlight = false
    }
}

function subscribe(listener: () => void) {
    store.listeners.add(listener)
    if (!store.timer) {
        poll()
        store.timer = setInterval(poll, CONFIG.pollMs)
    }
    return () => {
        store.listeners.delete(listener)
        if (store.listeners.size === 0 && store.timer) {
            clearInterval(store.timer)
            store.timer = null;
        }
    }
}

function useQuote(symbol: string) {
    return useSyncExternalStore(subscribe, () => store.quotes[symbol], () => store.quotes[symbol])
}

function useRows() {
    return useSyncExternalStore(subscribe, () => store.rows, () => store.rows)
}

function formatPrice(n: number) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TickSeconds({
    value,
    dir, 
    className,
    children
}: {
    value: string | number;
    dir: "up" | "down";
    className?: string
    children: ReactNode
}) {
    const ref = useRef<HTMLSpanElement>(null)
    const mounted = useRef(false)

    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
            return
        }
        if (!ref.current) return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const from = dir === "up" ? "35%" : "-35%"
        ref.current.animate(
            [
                {
                    transform: `translateY(${from})`,
                    opacity: 0,
                    filter: "blur(2px)"
                },
                {
                    transform: `translateY(0)`,
                    opacity: 1,
                    filter: "blur(0)"
                }
            ],
            { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)"}
        )
    }, [value, dir])

    return (
        <span ref={ref} className={cn("inline-block will-change-transform", className)}>
            {children}
        </span>
    )
}

function StockItem({ symbol }: { symbol: string }) {
    const { price, change, changePct } = useQuote(symbol)
    const up = change >= 0;

    const prev = useRef(price)
    const [flash, setFlash] = useState<"up" | "down" | null>(null)
    const [tickDir, setTickDir] = useState<"up" | "down">("up")
    useEffect(() => {
        if (price === prev.current) return
        setFlash(price > prev.current ? "up" : "down")
        setTickDir(price > prev.current ? "up" : "down")
        prev.current = price;
        const t = setTimeout(() => setFlash(null), 600)
        return () => clearTimeout(t)
    }, [price])

    return (
        <span className="mx-6 inline-flex items-baseline gap-3 font-mono tabular-nums md:mx-10">
            <span className="text-foreground/80 font-semibold">{symbol}</span>
            <span
                className={cn(
                    "inline-block min-w-[9ch] overflow-hidden rounded px-1.5 text-right",
                    "transition-[color,background-color] duration-500 ease-out",
                    up ? "text-emerald-400" : "text-red-400",
                    flash === "up" && "bg-emerald-500/25",
                    flash === "down" && "bg-red-500/25"
                )}
            >
                <TickSeconds value={price} dir={tickDir}>
                    {formatPrice(price)}
                </TickSeconds>
            </span>
            <span className={cn("text-[0.7em] inline-block min-w-[16ch] overflow-hidden transition-colors duration-500 ease-out", up ? "text-emerald-500" : "text-red-500")}>
                {up ? "↑ +" : "↓ "}
                {formatPrice(change)} ({up ? "+" : ""}
                {changePct.toFixed(2)})
            </span>
            <span className="text-foreground/20 ml-6 md:ml-10">·</span>
        </span>
    )
}

export function StockVelocity () {
    const { order } = useRows()
    return (
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-4">
              <ScrollVelocityContainer className="text-m font-bold tracking-tight md:text-xl">
                <ScrollVelocityRow
                  baseVelocity={6}
                  direction={1}
                  className="border-y border-foreground/10 bg-foreground/3 py-3"
                >
                  {order.map((s) => (
                    <StockItem key={s} symbol={s}/>
                  ))}
                </ScrollVelocityRow>
              </ScrollVelocityContainer>
              <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"/>
              <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"/>
            </div>
    )
}