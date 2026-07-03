export declare function runScaffoldCreate(name: string, opts: {
    agent?: string;
    prototype?: boolean;
    auth?: boolean;
    payments?: boolean;
}): void;
export declare function runScaffoldEnhance(dir: string, opts: {
    auth?: boolean;
    payments?: boolean;
    telegram?: boolean;
    registry?: boolean;
}): void;
export declare function runScaffoldUpgrade(dir: string, opts: {
    dryRun?: boolean;
    autoApprove?: boolean;
}): void;
