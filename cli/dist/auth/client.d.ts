/**
 * AgentAuthClient factory for Clawd agents.
 *
 * Usage:
 *   import { createClawdAgentClient } from "@solanaclawd/clawd-agents-cli/auth";
 *   const client = createClawdAgentClient();
 *   const token = await client.getToken();
 */
import { AgentAuthClient, type AgentAuthClientOptions } from "@auth/agent";
export type ClawdAgentClientOptions = Omit<AgentAuthClientOptions, "directoryUrl"> & {
    /** Override the x402.wtf base URL (e.g. for local dev). */
    baseUrl?: string;
};
export declare function createClawdAgentClient(options?: ClawdAgentClientOptions): AgentAuthClient;
export { AgentAuthClient } from "@auth/agent";
export { CLAWD_AUTH_BASE, CLAWD_DISCOVERY_URL } from "./capabilities.js";
