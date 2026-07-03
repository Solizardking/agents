/**
 * AgentAuthClient factory for Clawd agents.
 *
 * Usage:
 *   import { createClawdAgentClient } from "@solanaclawd/clawd-agents-cli/auth";
 *   const client = createClawdAgentClient();
 *   const token = await client.getToken();
 */
import { AgentAuthClient } from "@auth/agent";
import { CLAWD_DISCOVERY_URL } from "./capabilities.js";
export function createClawdAgentClient(options) {
    const { baseUrl, ...rest } = options ?? {};
    return new AgentAuthClient({
        directoryUrl: baseUrl
            ? `${baseUrl.replace(/\/$/, "")}/.well-known/agent-auth.json`
            : CLAWD_DISCOVERY_URL,
        hostName: "clawd-agent",
        ...rest,
        allowDirectDiscovery: true,
    });
}
export { AgentAuthClient } from "@auth/agent";
export { CLAWD_AUTH_BASE, CLAWD_DISCOVERY_URL } from "./capabilities.js";
//# sourceMappingURL=client.js.map