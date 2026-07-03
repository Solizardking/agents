type DeployTarget = "vercel" | "vertex-ai" | "fly" | "railway";
export declare function runDeploy(target: DeployTarget, opts: {
    prod?: boolean;
    dryRun?: boolean;
}): void;
export {};
