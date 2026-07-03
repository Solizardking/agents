export const solanaPulse = {
    frames: ["⣀", "⣄", "⣆", "⣇", "⣧", "⣷", "⣿", "⣷", "⣧", "⣇", "⣆", "⣄"],
    interval: 100,
};
export const clawdSpin = {
    frames: ["🦞", "🦐", "🦞", "🦀", "🦞", "🦐"],
    interval: 220,
};
export const walletHeartbeat = {
    frames: ["·", "•", "●", "◉", "●", "•", "·", " "],
    interval: 110,
};
export const tokenOrbit = {
    frames: ["◐", "◓", "◑", "◒"],
    interval: 120,
};
export const pumpLoader = {
    frames: [
        "▱▱▱▱▱",
        "▰▱▱▱▱",
        "▰▰▱▱▱",
        "▰▰▰▱▱",
        "▰▰▰▰▱",
        "▰▰▰▰▰",
        "▱▰▰▰▰",
        "▱▱▰▰▰",
        "▱▱▱▰▰",
        "▱▱▱▱▰",
    ],
    interval: 90,
};
export const mevScan = {
    frames: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
    interval: 80,
};
export const degenDice = {
    frames: ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"],
    interval: 110,
};
export const blockFinality = {
    frames: ["░", "▒", "▓", "█", "▓", "▒", "░"],
    interval: 95,
};
export const CLAWD_SPINNERS = {
    solanaPulse,
    clawdSpin,
    walletHeartbeat,
    tokenOrbit,
    pumpLoader,
    mevScan,
    degenDice,
    blockFinality,
};
export function spinnerForProvider(provider) {
    switch (provider) {
        case "ollama": return blockFinality;
        case "openrouter": return tokenOrbit;
        case "openai": return pumpLoader;
        case "custom": return mevScan;
        case "grok":
        default: return clawdSpin;
    }
}
//# sourceMappingURL=clawd-spinners.js.map