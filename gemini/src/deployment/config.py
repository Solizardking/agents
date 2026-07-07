"""
Deployment configuration for DeFi Agents on Gemini Enterprise Agent Platform.

All agent definitions, resource names, and deployment parameters are
centralized here for consistent deployment across environments.
"""

import os
from typing import Optional

# ─── Google Cloud Project Configuration ───────────────────────────────

PROJECT_ID: str = os.environ.get("GOOGLE_CLOUD_PROJECT", "defi-agents-project")
LOCATION: str = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
STAGING_BUCKET: str = os.environ.get("GOOGLE_CLOUD_STAGING_BUCKET", f"gs://{PROJECT_ID}-staging")

# ─── Resource Identifiers ─────────────────────────────────────────────

MEMORY_BANK_ID: Optional[str] = os.environ.get("MEMORY_BANK_ID")
SESSIONS_ID: Optional[str] = os.environ.get("SESSIONS_ID")
EGRESS_GATEWAY_NAME: Optional[str] = os.environ.get("EGRESS_GATEWAY_NAME")

# ─── Agent Runtime Deployment Defaults ────────────────────────────────

DEFAULT_MIN_INSTANCES: int = 1
DEFAULT_MAX_INSTANCES: int = 3
DEFAULT_CONCURRENCY: int = 9

TIER_1_TIMEOUT: int = 60   # Simple Q&A agents
TIER_2_TIMEOUT: int = 120  # Analysis agents
TIER_3_TIMEOUT: int = 180  # Transaction-executing agents

# ─── Agent Deployment Configurations ──────────────────────────────────

AGENT_CONFIGS = {
    # Trading Agents
    "solana-jupiter-swap": {"timeout": TIER_3_TIMEOUT, "min_instances": 2, "concurrency": 18},
    "solana-dca-bot": {"timeout": TIER_3_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-arbitrage-scanner": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-market-maker": {"timeout": TIER_3_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-trading-signal": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    # DeFi Agents
    "solana-yield-farmer": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-liquidity-pool-analyzer": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-lending-strategist": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-staking-rewards": {"timeout": TIER_1_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-lsd-analyst": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-cross-chain-bridge": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-dex-aggregator": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-defi-protocol-comparator": {"timeout": TIER_1_TIMEOUT, "min_instances": 1, "concurrency": 9},
    # Security Agents
    "solana-smart-contract-auditor": {"timeout": TIER_3_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-wallet-security-advisor": {"timeout": TIER_1_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-mev-protection-advisor": {"timeout": TIER_1_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-risk-monitor": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
    "solana-bridge-security-analyst": {"timeout": TIER_2_TIMEOUT, "min_instances": 1, "concurrency": 9},
}

# ─── Requirements ─────────────────────────────────────────────────────

REQUIREMENTS = [
    "google-cloud-aiplatform[agent_engines,adk]>=1.88.0",
    "google-cloud-storage",
    "cloudpickle==3.0",
    "websockets",
]

# ─── Agent Identity ───────────────────────────────────────────────────

IDENTITY_TYPE = "AGENT_IDENTITY"

# ─── Memory Bank Configuration ────────────────────────────────────────

MEMORY_BANK_DISPLAY_NAME = "DeFi Agents Memory Bank"

MEMORY_BANK_CONFIG = {
    "generation_config": {
        "model": f"projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/gemini-2.5-flash"
    },
    "similarity_search_config": {
        "embedding_model": f"projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/text-embedding-005"
    },
    "customization_configs": [{
        "memory_topics": [
            {"managed_memory_topic": {"managed_topic_enum": "USER_PERSONAL_INFO"}},
            {"managed_memory_topic": {"managed_topic_enum": "USER_PREFERENCES"}},
            {"managed_memory_topic": {"managed_topic_enum": "KEY_CONVERSATION_DETAILS"}},
            {"managed_memory_topic": {"managed_topic_enum": "EXPLICIT_INSTRUCTIONS"}}
        ],
        "enable_third_person_memories": False
    }],
    "disable_memory_revisions": False
}