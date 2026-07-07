# DeFi Agents on Gemini Enterprise Agent Platform

> Production deployment of 66+ Solana DeFi agents on Google Cloud's Gemini Enterprise Agent Platform.

This directory provides the complete infrastructure to deploy, govern, and scale the solana-clawd agent ecosystem on Google Cloud using:

- **[Agent Development Kit (ADK)](https://adk.dev)** — build and deploy agents
- **[Agent Runtime](https://cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/deploy-an-agent)** — managed runtime for deployed agents
- **[Memory Bank](https://cloud.google.com/gemini-enterprise-agent-platform/scale/memory-bank)** — long-term memory across sessions
- **[Sessions](https://cloud.google.com/gemini-enterprise-agent-platform/scale/sessions)** — conversation state management
- **[Agent Identity](https://cloud.google.com/gemini-enterprise-agent-platform/scale/runtime/agent-identity)** — per-agent secure identity
- **[Agent Gateway](https://cloud.google.com/gemini-enterprise-agent-platform/govern/gateways/agent-gateway-overview)** — secure network routing
- **[Semantic Governance Policy](https://cloud.google.com/gemini-enterprise-agent-platform/govern/policies)** — natural language policy enforcement
- **[Agent Skills](https://agentskills.io/)** — progressive tool disclosure

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Gemini Enterprise Agent Platform              │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐   ┌───────────────┐   │
│  │  Agent Gateway    │◄──►│  Agent Runtime    │◄──►│  Memory Bank  │   │
│  │  (Ingress/Egress) │    │  (66+ ADK Agents) │   │  (Long-term)  │   │
│  └──────────────────┘    └──────────────────┘   └───────────────┘   │
│                                   │                                   │
│                          ┌────────▼────────┐                         │
│                          │  Agent Sessions  │                         │
│                          │  (State Mgmt)    │                         │
│                          └─────────────────┘                         │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐   ┌───────────────┐   │
│  │  Agent Skills     │    │  MCP Servers     │   │  Governance   │   │
│  │  (Tool Discovery) │    │  (Tool Runtime)  │   │  Policies     │   │
│  └──────────────────┘    └──────────────────┘   └───────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

```bash
# 1. Set up Google Cloud project
gcloud projects create DEFI-AGENTS-PROJECT --name="DeFi Agents"
gcloud config set project DEFI-AGENTS-PROJECT
gcloud services enable aiplatform.googleapis.com agentplatform.googleapis.com

# 2. Install Agent Platform SDK
pip install google-cloud-aiplatform[agent_engines,adk]>=1.111.0
```

### 1. Create Memory Bank Instance

```python
from google.genai import types
from google import genai

client = genai.Client(project="DEFI-AGENTS-PROJECT", location="us-central1", vertexai=True)

# Create Memory Bank for long-term memory across sessions
memory_bank = client.agent_engines.create(
    config={
        "display_name": "DeFi Agents Memory Bank",
        "context_spec": {
            "memory_bank_config": {
                "generation_config": {
                    "model": "projects/DEFI-AGENTS-PROJECT/locations/us-central1/publishers/google/models/gemini-2.5-flash"
                },
                "similarity_search_config": {
                    "embedding_model": "projects/DEFI-AGENTS-PROJECT/locations/us-central1/publishers/google/models/text-embedding-005"
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
        }
    }
)
print(f"Memory Bank: {memory_bank.api_resource.name}")
```

### 2. Create Sessions Instance

```python
# Create Sessions for conversation state management
sessions = client.agent_engines.create(
    config={"display_name": "DeFi Agents Sessions"}
)
print(f"Sessions: {sessions.api_resource.name}")
```

### 3. Configure Agent Gateway

```bash
# Create egress gateway for agent-to-anywhere communication
gcloud ai agent-gateways create defi-agents-egress-gateway \
    --project=DEFI-AGENTS-PROJECT \
    --location=us-central1 \
    --mode=agent-to-anywhere

# Create ingress gateway for client-to-agent communication
gcloud ai agent-gateways create defi-agents-ingress-gateway \
    --project=DEFI-AGENTS-PROJECT \
    --location=us-central1 \
    --mode=client-to-agent
```

### 4. Deploy Agents

Deploy all 66+ agents using the deployment orchestrator:

```python
python src/deployment/deploy_all_agents.py \
    --project=DEFI-AGENTS-PROJECT \
    --location=us-central1 \
    --memory-bank-id=MEMORY_BANK_ID \
    --sessions-id=SESSIONS_ID \
    --egress-gateway=DEFI-AGENTS-EGRESS-GATEWAY
```

## Agent Categories

| Category | Count | Description |
|----------|-------|-------------|
| **Trading** | 12 | Swap bots, DCA, arbitrage, market makers |
| **DeFi** | 61 | Yield farming, lending, liquidity, bridges |
| **Security** | 9 | Auditors, risk monitors, wallet guardians |
| **Analytics** | 11 | Portfolio trackers, revenue analysts |
| **Payments** | 25 | x402 payments, wallet management |
| **Infrastructure** | 3 | Router, gateway, operator runtimes |
| **Dev Tools** | 3 | Anchor development, data pipelines |
| **NFT** | 3 | NFT liquidity, compressed NFTs |
| **Education** | 3 | Onboarding guides, governance |
| **Governance** | 2 | Proposal analysis, voting |
| **Research** | 1 | Cross-chain research |
| **Total** | **131** | Full agent ecosystem |

## Agent Runtime Configuration

Each agent is deployed with:
- **Agent Identity** for secure least-privilege access
- **50-180s timeout** depending on category
- **Concurrency** settings per agent type
- **Env vars** for Solana RPC, API keys, and wallet config
- **Agent Gateway** binding for secure routing

## Skills System

Agent Skills enable progressive tool disclosure using the ADK skill system:

- `list_skills` — discover available skill packages
- `load_skill` — dynamically import skill tools
- `load_skill_resource` — retrieve skill assets
- `run_skill_script` — execute skill logic

Skills are organized by domain (trading, defi, security, analytics, payments) and are governed by Semantic Governance Policies.

## Semantic Governance Policies

Natural Language Constraints (NLCs) govern:
- Which skills can be loaded in which contexts
- Tool execution permissions per user tier
- Session-scoped access controls
- Payment and wallet operation guardrails
- Supply chain security for skill installations

## Directory Structure

```
gemini/
├── README.md                           # This file
├── package.json                        # Python project config
├── setup.sh                            # One-shot setup script
├── src/
│   ├── agents/                         # ADK agent definitions
│   │   ├── __init__.py
│   │   ├── base_agent.py               # Base ADK agent template
│   │   ├── trading/                    # Trading agents
│   │   ├── defi/                       # DeFi agents
│   │   └── security/                   # Security agents
│   ├── skills/                         # Agent Skills definitions
│   │   ├── trading-skills.json
│   │   ├── defi-skills.json
│   │   ├── security-skills.json
│   │   └── payment-skills.json
│   ├── policies/                       # Governance policies
│   │   ├── skill-lifecycle-policy.json
│   │   ├── payment-policy.json
│   │   └── access-control-policy.json
│   ├── deployment/                     # Deployment orchestration
│   │   ├── deploy_all_agents.py
│   │   └── config.py
│   ├── memory/                         # Memory Bank integration
│   │   └── memory_service.py
│   ├── sessions/                       # Sessions management
│   │   └── session_manager.py
│   ├── gateway/                        # Gateway configuration
│   │   └── gateway_setup.py
│   └── mcp/                            # MCP server definitions
│       └── mcp_servers.json
```

## Security

- **Agent Identity**: Every agent has a unique SPIFFE-based identity with certificate-bound tokens
- **Context-Aware Access**: Default mTLS binding prevents credential replay
- **VPC-SC Compatible**: Follow the gateway egress patterns for VPC Service Controls
- **IAM Least Privilege**: Each agent gets only the permissions it needs

## License

MIT — see root [`LICENSE`](../../LICENSE) for details.