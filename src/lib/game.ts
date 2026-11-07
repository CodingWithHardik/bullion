export const game = {
    startingCash: 10000,
    roundSeconds: 180,
    feeRate: 0.001,
    historyLength: 90,
    staleAfterMs: 5000,
} as const 

export type position = { shares: number, costBasis: number };
export type portfolio = { cash: number; posiitons: Record<string, position> };
export type trade = {
    id: number;
    at: number;
    side: "BUY" | "SELL";
    symbol: string;
    shares: number;
    price: number;
    total: number;
    fee: number;
}

export type ScoreEntry = {
    name: string;
    netWorth: number;
    returnPct: number;
    trades: number;
    at: number;
}

export const newPortfolio = (): portfolio => ({
    cash: game.startingCash, posiitons: {}
});

export const netWorth = (portfolio: portfolio, price: Record<string, number>) => 
    Object.entries(portfolio.posiitons).reduce((sum, [symbol, pos]) => sum + pos.shares * (price[symbol] ?? 0), portfolio.cash);

const round2 = (n: number) => Math.round(n * 100) / 100;

export function buy(portfolio: portfolio, symbol: string, price: number, dollars: number) {
    if (!(price > 0)) return null;
    const spend = Math.min(dollars, portfolio.cash);
    if (spend < 0.01) return null;
    const fee = spend * game.feeRate;
    const shares = (spend - fee) / price;
    const prev = portfolio.posiitons[symbol] ?? { shares: 0, costBasis: 0 };
    return {
        portfolio: {
            cash: round2(portfolio.cash - spend),
            posiitons: {
                ...portfolio.posiitons,
                [symbol]: {
                    shares: prev.shares + shares,
                    costBasis: prev.costBasis + spend,
                }
            }
        },
        shares,
        fee,
        total: spend,
    }
}

export function sell(portfolio: portfolio, symbol: string, price: number, fraction: number) {
    const pos = portfolio.posiitons[symbol];
    if (!pos || pos.shares <= 0 || !(price > 0)) return null;
    const f = Math.min(1, Math.max(0, fraction));
    const shares = pos.shares * f;
    const gross = shares * price;
    const fee = gross * game.feeRate;
    const position = {
        ...portfolio.posiitons,
    }
    if (f >= 1) delete position[symbol];
        else position[symbol] = {
            shares: pos.shares - shares,
            costBasis: pos.costBasis * (1 - f),
        }
    return {
        portfolio: {
            cash: round2(portfolio.cash + gross - fee),
            posiitons: position,
        },
        shares,
        fee,
        total: gross - fee
    }
}

const ranks: [number, string, string][] = [
    [25, "Rich Kid", "Time to buy a fast car"],
    [10, "Rocket Trader", "Your money keeps going up and up"],
    [3, "Lucky Duck", "Was it skill or luck? Who cares!"],
    [0, "Sleepy Player", "No win, no loss, Just a nap"],
    [-10, "Scared Seller", "You ran away the worst time"],
    [-Infinity, "Noodle Live", "All gone Noodles for dinner?"]
]

export function rankFor(returnPct: number) {
    const [, title, blurb] = ranks.find(([min]) => returnPct >= min) ?? ranks[ranks.length - 1];
    return { title, blurb };
}

export const fmt = {
    money(n: number) {
        const abs = Math.abs(n)
        return (
            (n < 0 ? "-$" : "$") +
            abs.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: abs > 0 && abs < 1 ? 4 : 2
            })
        )
    },
    pct: (n: number) => (n > 0 ? "+" : "") + n.toFixed(2) + "%",
    shares(n: number) {
        if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
        if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 3 });
        return n.toPrecision(3)
    },
    clock: (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`,
}