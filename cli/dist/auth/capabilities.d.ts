/** Clawd Agent Auth Protocol — CAAP/1.0 capability constants.
 *
 * These names must stay in sync with the `capabilities` array in ClawdBrowser's
 * `@better-auth/agent-auth` plugin configuration (src/lib/auth.ts).
 */
export declare const CLAWD_PROVIDER = "Clawd";
export declare const CAAP_VERSION = "1.0";
export declare const CAAP_PROTOCOL = "CAAP/1.0";
export declare const CLAWD_AUTH_BASE = "https://x402.wtf/api/auth";
export declare const CLAWD_DISCOVERY_URL = "https://x402.wtf/.well-known/agent-auth.json";
export declare const CAPABILITIES: {
    readonly ATTEST_AGENT: "attest_agent";
    readonly GET_PEER_CARD: "get_peer_card";
    readonly LIST_AGENTS: "list_agents";
    readonly AGENT_CHAT: "agent_chat";
};
export type ClawdCapability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];
export interface CapabilityRequest {
    name: ClawdCapability;
    constraints?: Record<string, unknown>;
}
export declare const CAPABILITY_LOCATIONS: Record<ClawdCapability, string>;
