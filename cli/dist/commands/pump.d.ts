export declare function runPump(sub?: string, opts?: {
    wallet?: string;
    json?: boolean;
    amount?: string;
    interval?: string;
    autobuy?: boolean;
    vol?: boolean;
    args?: string[];
}): Promise<void>;
