export declare function runGoalCreate(opts: {
    category?: string;
    symbol?: string;
    side?: string;
    notional?: string;
    leverage?: string;
    target?: string;
    priority?: string;
}): void;
export declare function runGoalList(opts: {
    active?: boolean;
    json?: boolean;
}): void;
export declare function runGoalStatus(id: string, opts: {
    json?: boolean;
}): void;
export declare function runGoalComplete(id: string): void;
