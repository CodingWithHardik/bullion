export type Brand = {
    symbol: string;
    name: string;
    price: number;
    vol: number;
}

export type Quote = {
    symbol: string;
    name: string;
    price: number;
    open: number;
    change: number;
    changePct: number;
}

export const BRANDS: Brand[] = [
    { symbol: "NIKE", name: "Nike", price: 12.33, vol: 0.23 },
    { symbol: "APPL", name: "Apple", price: 231.92, vol: 0.63 },
    { symbol: "KO", name: "Coca-Cola", price: 64.53, vol: 0.2 },
    { symbol: "TSLA", name: "Tesla", price: 283.47, vol: 0.7 },
    { symbol: "SBUX", name: "Starbucks", price: 97.2, vol: 0.9 },
    { symbol: "ADS", name: "Adidas", price: 220.5, vol: 0.4 },
    { symbol: "MCD", name: "McDonal's", price: 296.1, vol: 0.5 },
    { symbol: "NFLX", name: "Netflix", price: 393.3, vol: 0.6 },
    { symbol: "AMZN", name: "Amazon", price: 943.6, vol: 0.8 },
    { symbol: "DIS", name: "Disney", price: 145.5, vol: 0.6 },
    { symbol: "PEP", name: "PepsiCo", price: 123.54, vol: 0.6 },
    { symbol: "SONY", name: "Sony", price: 483.74, vol: 0.9 },
    { symbol: "UBER", name: "Uber", price: 120.36, vol: 0.6 },
]

export function initialQuotes(): Record<string, Quote> {
    return Object.fromEntries(
        BRANDS.map((brand) => [
            brand.symbol,
            {
                symbol: brand.symbol,
                name: brand.name,
                price: brand.price,
                open: brand.price,
                change: 0,
                changePct: 0,
            }
        ])

    )
}