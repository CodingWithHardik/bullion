export type Quote = {
    symbol: string;
    name: string;
    price: number;
    open: number;
    change: number;
    changePct: number;
}

export type QuotesResponse = {
    quotes: Quote[];
    ts: number;
}