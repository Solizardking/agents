export declare function runPerps(sub: string, opts: {
    symbol?: string;
    notional?: string;
    leverage?: string;
    size?: string;
    autoRoute?: boolean;
    json?: boolean;
}): Promise<void>;
export declare function runLong(symbol: string, opts: {
    notional?: string;
    leverage?: string;
    live?: boolean;
    goal?: boolean;
}): void;
export declare function runShort(symbol: string, opts: {
    notional?: string;
    leverage?: string;
    live?: boolean;
    goal?: boolean;
}): void;
export declare function runSpot(side: "buy" | "sell", symbol: string, opts: {
    amount?: string;
    slippage?: string;
    goal?: boolean;
    json?: boolean;
}): Promise<void>;
export declare function runApe(symbol: string, side: "long" | "short", opts: {
    live?: boolean;
    goal?: boolean;
}): void;
