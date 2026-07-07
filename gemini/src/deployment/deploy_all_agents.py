"""
DeFi Agents Deployment Orchestrator for Gemini Enterprise Agent Platform.

Deploys all 66+ Solana DeFi agents to Agent Runtime with:
- Agent Identity for secure per-agent authentication
- Memory Bank for long-term memory across sessions
- Sessions for conversation state management
- Agent Gateway for secure network routing
- Skills for progressive tool disclosure
- Semantic Governance Policies for AI safety

Usage:
    python deploy_all_agents.py \\
        --project=DEFI-AGENTS-PROJECT \\
        --location=us-central1 \\
        --staging-bucket=gs://my-bucket \\
        [--memory-bank-id=MB_ID] \\
        [--sessions-id=SESS_ID] \\
        [--egress-gateway=GATEWAY_NAME]
"""

import argparse
import sys
import time
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(description="Deploy DeFi Agents to Gemini Enterprise Agent Platform")
    parser.add_argument("--project", required=True, help="Google Cloud project ID")
    parser.add_argument("--location", default="us-central1", help="Google Cloud region")
    parser.add_argument("--staging-bucket", required=True, help="GCS staging bucket (gs://...)")
    parser.add_argument("--memory-bank-id", help="Existing Memory Bank instance ID (optional)")
    parser.add_argument("--sessions-id", help="Existing Sessions instance ID (optional)")
    parser.add_argument("--egress-gateway", help="Agent Gateway resource name (optional)")
    parser.add_argument("--skip-memory-bank", action="store_true", help="Skip Memory Bank creation")
    parser.add_argument("--skip-sessions", action="store_true", help="Skip Sessions creation")
    parser.add_argument("--agents", nargs="+", help="Specific agents to deploy (default: all)")
    return parser.parse_args()


def setup_client(project: str, location: str):
    """Initialize the Agent Platform SDK client."""
    try:
        from google import genai
        client = genai.Client(project=project, location=location)
        logger.info(f"Initialized client for project={project} location={location}")
        return client
    except ImportError:
        logger.error("google-cloud-aiplatform not installed. Run: pip install google-cloud-aiplatform[agent_engines,adk]>=1.88.0")
        sys.exit(1)


def create_memory_bank(client, project: str, location: str) -> str:
    """Create Memory Bank instance for long-term memory."""
    logger.info("Creating Memory Bank instance...")
    memory_bank = client.agent_engines.create(
        config={
            "display_name": "DeFi Agents Memory Bank",
            "context_spec": {
                "memory_bank_config": {
                    "generation_config": {
                        "model": f"projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash"
                    },
                    "similarity_search_config": {
                        "embedding_model": f"projects/{project}/locations/{location}/publishers/google/models/text-embedding-005"
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
    memory_bank_id = memory_bank.api_resource.name.split("/")[-1]
    logger.info(f"Memory Bank created: {memory_bank.api_resource.name} (ID: {memory_bank_id})")
    return memory_bank_id


def create_sessions(client) -> str:
    """Create Sessions instance for conversation state."""
    logger.info("Creating Sessions instance...")
    sessions = client.agent_engines.create(config={"display_name": "DeFi Agents Sessions"})
    sessions_id = sessions.api_resource.name.split("/")[-1]
    logger.info(f"Sessions created: {sessions.api_resource.name} (ID: {sessions_id})")
    return sessions_id


def build_agent_definitions() -> dict:
    """Build the complete agent registry from all category modules."""
    import importlib

    agents = {}
    categories = {}

    category_modules = [
        ("trading", "agents.gemini.src.agents.trading", "TRADING_AGENTS"),
        ("defi", "agents.gemini.src.agents.defi", "DEFI_AGENTS"),
        ("security", "agents.gemini.src.agents.security", "SECURITY_AGENTS"),
    ]

    for category_name, module_path, registry_name in category_modules:
        try:
            module = importlib.import_module(module_path)
            registry = getattr(module, registry_name, {})
            agents.update(registry)
            categories[category_name] = list(registry.keys())
            logger.info(f"Loaded {len(registry)} agents from {category_name}: {list(registry.keys())}")
        except ImportError as e:
            logger.warning(f"Could not load {category_name} agents: {e}")

    return agents, categories


def deploy_agent(
    client,
    agent,
    agent_id: str,
    staging_bucket: str,
    gateway_name: Optional[str] = None,
    min_instances: int = 1,
    max_instances: int = 3,
    concurrency: int = 9,
):
    """Deploy a single agent to Agent Runtime with Agent Identity."""
    from agents.gemini.src.agents.base_agent import create_deployed_agent_config

    config = create_deployed_agent_config(
        agent=agent,
        staging_bucket=staging_bucket,
        min_instances=min_instances,
        max_instances=max_instances,
        concurrency=concurrency,
        identity_type="AGENT_IDENTITY",
        agent_gateway=gateway_name,
    )

    logger.info(f"Deploying agent '{agent_id}' with config: min={min_instances}, max={max_instances}, concurrency={concurrency}")

    from vertexai.preview.reasoning_engines import AdkApp
    adk_app = AdkApp(agent=agent)

    resource = client.agent_engines.create(
        agent_engine=adk_app,
        config=config,
    )

    logger.info(f"Agent '{agent_id}' deployed: {resource.api_resource.name}")
    return resource


def deploy_all_agents(args):
    """Main deployment orchestration function."""
    client = setup_client(args.project, args.location)
    gateway_name = args.egress_gateway

    # ── Step 1: Create Memory Bank ────────────────────────────────────
    memory_bank_id = args.memory_bank_id
    if not memory_bank_id and not args.skip_memory_bank:
        memory_bank_id = create_memory_bank(client, args.project, args.location)
    elif memory_bank_id:
        logger.info(f"Using existing Memory Bank: {memory_bank_id}")
    else:
        logger.info("Skipping Memory Bank creation")

    # ── Step 2: Create Sessions ───────────────────────────────────────
    sessions_id = args.sessions_id
    if not sessions_id and not args.skip_sessions:
        sessions_id = create_sessions(client)
    elif sessions_id:
        logger.info(f"Using existing Sessions: {sessions_id}")
    else:
        logger.info("Skipping Sessions creation")

    # ── Step 3: Load agent definitions ────────────────────────────────
    agents, categories = build_agent_definitions()

    if args.agents:
        agents = {k: v for k, v in agents.items() if k in args.agents}
        logger.info(f"Filtered to {len(agents)} agents: {args.agents}")

    logger.info(f"Deploying {len(agents)} agents across categories: {list(categories.keys())}")

    # ── Step 4: Set up Agent Gateway binding ──────────────────────────
    if not gateway_name:
        logger.warning("No egress gateway specified. Agents will use default network routing.")

    # ── Step 5: Deploy each agent ─────────────────────────────────────
    from agents.gemini.src.deployment.config import AGENT_CONFIGS

    deployed = []
    failed = []

    for agent_id, agent in agents.items():
        try:
            agent_config = AGENT_CONFIGS.get(agent_id, {})
            resource = deploy_agent(
                client=client,
                agent=agent,
                agent_id=agent_id,
                staging_bucket=args.staging_bucket,
                gateway_name=gateway_name,
                min_instances=agent_config.get("min_instances", 1),
                max_instances=agent_config.get("max_instances", 3),
                concurrency=agent_config.get("concurrency", 9),
            )
            deployed.append({"id": agent_id, "resource": resource.api_resource.name})
        except Exception as e:
            logger.error(f"Failed to deploy agent '{agent_id}': {e}", exc_info=True)
            failed.append(agent_id)

    # ── Summary ───────────────────────────────────────────────────────
    logger.info(f"\n{'='*60}")
    logger.info(f"DEPLOYMENT SUMMARY")
    logger.info(f"{'='*60}")
    logger.info(f"Total agents attempted: {len(agents)}")
    logger.info(f"Successfully deployed: {len(deployed)}")
    logger.info(f"Failed: {len(failed)}")
    if deployed:
        logger.info(f"\nDeployed agents:")
        for d in deployed:
            logger.info(f"  - {d['id']}: {d['resource']}")
    if failed:
        logger.info(f"\nFailed agents: {failed}")

    # ── Output env vars for CI/CD ─────────────────────────────────────
    if deployed:
        agent_ids = ",".join(d["id"] for d in deployed)
        print(f"\nDEPLOYED_AGENTS={agent_ids}")
        print(f"AGENT_COUNT={len(deployed)}")

    return deployed, failed


if __name__ == "__main__":
    args = parse_args()
    deployed, failed = deploy_all_agents(args)
    sys.exit(1 if failed else 0)