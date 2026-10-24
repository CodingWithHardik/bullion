import { BRANDS, type Quote } from "./brands";

const CONFIG = {
    stepMs: 1000,
    sessionSteps: 390,
    marketWeight: 0.5,
    trendPersistence: 0.98,
    trendNoise: 0.00004,
    newsProb: 0.002,
    newsSize: 0.02,
    maxCatchup: 600,
}

type Stock = { price: number; open: number; trend: number; sigma: number; }
const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())

const round2 = (n: number) => Math.round(n * 100) / 100;

const market = ((globalThis as { __market?: {
    stocks: Map<string, Stock>;
    lastStep: number;
    stepInSession: number;
}}).__market ??= {
    stocks: new Map(
        BRANDS.map((b) => [
            b.symbol,
            { price: b.price, open: b.price, trend: 0, sigma: b.vol / Math.sqrt(252 * 390)}
        ])
    ),
    lastStep: Date.now(),
    stepInSession: 0,
})

function step() {
    const marketShock = randn();

    for(const s of market.stocks.values()) {
        s.trend = s.trend * CONFIG.trendPersistence + CONFIG.trendNoise * randn();
        const shock = CONFIG.marketWeight * marketShock + Math.sqrt(1 - CONFIG.marketWeight ** 2) * randn()
        const news = Math.random() < CONFIG.newsProb ? randn() * CONFIG.newsSize : 0;
        s.price = Math.max(0.01, s.price * Math.exp(s.trend + s.sigma * shock - s.sigma ** 2 / 2 + news))
    }

    market.stepInSession = (market.stepInSession + 1) % CONFIG.sessionSteps;
    if (market.stepInSession === 0) market.stocks.forEach((s) => (s.open = s.price))
}

export function getQuotes(now = Date.now()): Quote[] {
    const steps = Math.floor((now = market.lastStep) / CONFIG.stepMs)
    for (let i = 0; i < Math.min(steps, CONFIG.maxCatchup); i++) step();
    market.lastStep += steps * CONFIG.stepMs

    return BRANDS.map(({ symbol, name }) => {
        const s = market.stocks.get(symbol)!
        const price = round2(s.price)
        const open = round2(s.open)
        return {
            symbol, 
            name,
            price,
            open,
            change: round2(price - open),
            changePct: round2(((price - open) / open) * 100)
        }
    })
}