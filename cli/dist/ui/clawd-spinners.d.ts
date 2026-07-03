export interface ClawdSpinner {
    frames: string[];
    interval: number;
}
export declare const solanaPulse: ClawdSpinner;
export declare const clawdSpin: ClawdSpinner;
export declare const walletHeartbeat: ClawdSpinner;
export declare const tokenOrbit: ClawdSpinner;
export declare const pumpLoader: ClawdSpinner;
export declare const mevScan: ClawdSpinner;
export declare const degenDice: ClawdSpinner;
export declare const blockFinality: ClawdSpinner;
export declare const CLAWD_SPINNERS: {
    readonly solanaPulse: ClawdSpinner;
    readonly clawdSpin: ClawdSpinner;
    readonly walletHeartbeat: ClawdSpinner;
    readonly tokenOrbit: ClawdSpinner;
    readonly pumpLoader: ClawdSpinner;
    readonly mevScan: ClawdSpinner;
    readonly degenDice: ClawdSpinner;
    readonly blockFinality: ClawdSpinner;
};
export type ClawdSpinnerName = keyof typeof CLAWD_SPINNERS;
export declare function spinnerForProvider(provider: string): ClawdSpinner;
