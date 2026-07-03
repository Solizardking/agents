import { ClawdSpinner } from "./clawd-spinners.js";
export declare function withSpinner<T>(label: string, spinner: ClawdSpinner, fn: () => Promise<T>): Promise<T>;
export declare function spinSync<T>(label: string, spinner: ClawdSpinner, fn: () => T): T;
