interface PackOptions {
    skills: string[];
    xml?: boolean;
    outFile?: string;
    list?: boolean;
    json?: boolean;
}
export declare function runPack(opts: PackOptions): Promise<void>;
export {};
