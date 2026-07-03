/**
 * agents/cli/src/commands/identity.ts
 *
 * Clawd Agent On-Chain Identity — the professional identity attestation command
 * modeled after Google ADK's agent identity workflow.
 *
 * Commands:
 *   clawd-agents identity create       — Create a new on-chain agent identity
 *   clawd-agents identity attest       — Attest an existing identity via SAS
 *   clawd-agents identity verify       — Verify on-chain attestation status
 *   clawd-agents identity spiffe       — Show Google SPIFFE principal mapping
 *   clawd-agents identity bridge-google — Bridge identity to Google Agent Registry
 */
export declare function runIdentityCreate(opts: {
    agentId?: string;
    googleProject?: string;
    googleLocation?: string;
    vault?: boolean;
    dryRun?: boolean;
}): Promise<void>;
export declare function runIdentityAttest(opts: {
    dryRun?: boolean;
}): Promise<void>;
export declare function runIdentityVerify(): Promise<void>;
export declare function runIdentitySpiffe(opts: {
    organizationId?: string;
    projectNumber?: string;
    location?: string;
    engineId?: string;
}): void;
export declare function runIdentityBridgeGoogle(opts: {
    projectId?: string;
    location?: string;
    agentId?: string;
    dryRun?: boolean;
}): Promise<void>;
