/**
 * agents/cli/src/commands/sign.ts
 *
 * Sign a base64-encoded Solana transaction using the Pay account
 * and submit it to the network.
 *
 * Usage:
 *   clawd-agents sign <BASE64_TX> [--network devnet] [--account my-account] [--json]
 *
 * Bridges to pay.sh signing core via the Pay MCP sign_transaction tool.
 */
export declare function runSign(base64Tx: string, opts: {
    network?: string;
    account?: string;
    json?: boolean;
}): Promise<void>;
