export function printBanner() {
    console.error(`
 ██████╗██╗      █████╗ ██╗    ██╗██████╗
██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
██║     ██║     ███████║██║ █╗ ██║██║  ██║
██║     ██║     ██╔══██║██║███╗██║██║  ██║
╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
  █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗
 ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝
 ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗
 ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
 ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║
 ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝

  Solana Agents CLI — build, deploy, and publish on-chain agents
`);
}
export function printSection(title) {
    const width = 50;
    const line = "─".repeat(width);
    console.error(`\n ${title}`);
    console.error(` ${line}`);
}
export function printOk(msg) {
    console.error(`  ✓ ${msg}`);
}
export function printInfo(msg) {
    console.error(`  ▸ ${msg}`);
}
export function printWarn(msg) {
    console.error(`  ⚠ ${msg}`);
}
export function printDone(msg) {
    console.error(`\n  Done. ${msg}\n`);
}
//# sourceMappingURL=banner.js.map