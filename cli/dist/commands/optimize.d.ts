export type TaskType = "perps" | "research" | "code" | "ops" | "full" | "auto";
export type ProviderName = "claude" | "openai" | "grok" | "gemini" | "ollama";
export type StrategyName = "twap" | "grid" | "ta" | "scan";
export declare function generateTaConfig(preset: string, symbol: string): string;
export declare const TA_CONFIG_PRESETS: string[];
export declare function buildStarterPack(xml?: boolean): string;
export declare function runOptimize(opts: {
    task?: string;
    provider?: string;
    strategy?: string;
    symbol?: string;
    printContext?: boolean;
    xml?: boolean;
    starter?: boolean;
    taConfig?: string;
    write?: boolean;
    json?: boolean;
}): Promise<void>;
