export interface RegisterOptions {
    /** Agent display name */
    name: string;
    /** System role / prompt */
    systemRole?: string;
    /** Short description */
    description?: string;
    /** Comma-separated tags */
    tags?: string;
    /** Emoji or URL avatar */
    avatar?: string;
    /** Category: trading | defi | research | infrastructure | agentic */
    category?: string;
    /** Comma-separated skill names */
    skills?: string;
    /** Author name */
    author?: string;
    /** Homepage URL */
    homepage?: string;
    /** Only write locally — skip the x402.wtf API call */
    local?: boolean;
    /** Bearer token for x402.wtf/api (reads X402_API_KEY env if not provided) */
    apiKey?: string;
    /** Preview without writing anything */
    dryRun?: boolean;
}
export declare function runRegister(opts: RegisterOptions): Promise<void>;
