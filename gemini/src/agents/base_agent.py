"""
Base ADK Agent Template for DeFi Agents.

Provides the foundational agent class that all Solana DeFi agents extend.
Integrates with Memory Bank for long-term memory and Sessions for conversation state.
Uses Agent Identity for secure least-privilege access.
"""

from typing import Any, AsyncIterable, Callable, Optional
from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.tools.load_memory_tool import LoadMemoryTool, PreloadMemoryTool
from google.adk.tools import ToolContext, FunctionTool
from google.adk.memory import VertexAiMemoryBankService
from google.adk.sessions import VertexAiSessionService
from google.genai import types
import datetime


def generate_memories_callback(callback_context: CallbackContext) -> Any:
    """
    Callback that triggers Memory Bank generation after each agent turn.
    
    Sends the most recent events to Memory Bank for extraction and consolidation.
    This enables the agent to remember user preferences and conversation details
    across sessions.
    """
    # Send the last 5 events to Memory Bank for incremental memory generation
    return callback_context.add_events_to_memory(
        events=callback_context.session.events[-5:] if callback_context.session.events else []
    )


def create_memory_service(
    project_id: str,
    location: str,
    memory_bank_id: str,
) -> VertexAiMemoryBankService:
    """
    Create a VertexAiMemoryBankService connected to a Memory Bank instance.
    
    Args:
        project_id: Google Cloud project ID
        location: Google Cloud region (e.g., 'us-central1')
        memory_bank_id: Memory Bank resource ID
        
    Returns:
        Configured VertexAiMemoryBankService instance
    """
    return VertexAiMemoryBankService(
        project=project_id,
        location=location,
        agent_engine_id=memory_bank_id,
    )


def create_session_service(
    project_id: str,
    location: str,
    sessions_id: str,
) -> VertexAiSessionService:
    """
    Create a VertexAiSessionService connected to a Sessions instance.
    
    Args:
        project_id: Google Cloud project ID
        location: Google Cloud region
        sessions_id: Sessions resource ID
        
    Returns:
        Configured VertexAiSessionService instance
    """
    return VertexAiSessionService(
        project=project_id,
        location=location,
        agent_engine_id=sessions_id,
    )


def create_search_memory_tool() -> FunctionTool:
    """
    Create a tool that agents can use to search for relevant memories.
    
    Returns:
        FunctionTool configured for memory search
    """
    async def search_memories(query: str, tool_context: ToolContext) -> str:
        """
        Search for relevant memories about the user.
        
        Call this tool when you need to recall user preferences, past
        conversations, or any information the user has shared previously.
        
        Args:
            query: The search query describing what information you need
            
        Returns:
            Relevant memories as a formatted string
        """
        results = await tool_context.search_memory(query)
        if not results:
            return "No relevant memories found."
        
        formatted = "## Relevant User Memories\n"
        for i, memory in enumerate(results, 1):
            formatted += f"{i}. {memory.memory.fact}\n"
        return formatted
    
    return FunctionTool(
        func=search_memories,
        description="Search for user memories. Use when you need to recall user preferences or past information."
    )


def create_save_memory_tool() -> FunctionTool:
    """
    Create a tool that agents can use to explicitly save important information.
    
    Returns:
        FunctionTool configured for explicit memory saving
    """
    async def save_to_memory(fact: str, tool_context: ToolContext) -> str:
        """
        Save an important fact about the user to long-term memory.
        
        Use this tool when the user explicitly asks you to remember something
        or when you learn important user preferences or personal information.
        
        Args:
            fact: The fact or information to remember in first person perspective
                   (e.g., "I prefer using Ledger hardware wallet")
            
        Returns:
            Confirmation message
        """
        await tool_context.add_to_memory(fact)
        return f"✅ Saved to memory: {fact}"
    
    return FunctionTool(
        func=save_to_memory,
        description="Save an important fact about the user to long-term memory."
    )


def get_solana_tools() -> list:
    """
    Get the standard set of Solana blockchain tools available to all agents.
    
    These are the core MCP-connected tools for blockchain interaction.
    
    Returns:
        List of function tool definitions
    """
    import json
    import subprocess
    
    async def get_solana_balance(address: str) -> str:
        """
        Get the SOL balance for a Solana wallet address.
        
        Args:
            address: Solana public key address
            
        Returns:
            Balance in SOL
        """
        try:
            result = subprocess.run(
                ["solana", "balance", address, "--output", "json"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0:
                return result.stdout
            return f"Error: {result.stderr}"
        except Exception as e:
            return f"Error fetching balance: {e}"
    
    async def get_spl_token_balances(address: str) -> str:
        """
        Get all SPL token balances for a Solana wallet address.
        
        Args:
            address: Solana public key address
            
        Returns:
            Token balances
        """
        try:
            result = subprocess.run(
                ["spl-token", "accounts", address, "--output", "json"],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode == 0:
                return result.stdout
            return f"Error: {result.stderr}"
        except Exception as e:
            return f"Error fetching token balances: {e}"
    
    async def get_token_price(mint_address: str) -> str:
        """
        Get the current price of a Solana SPL token using Jupiter API.
        
        Args:
            mint_address: SPL token mint address
            
        Returns:
            Token price information
        """
        import urllib.request
        
        try:
            url = f"https://price.jup.ag/v6/price?ids={mint_address}"
            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read())
                if "data" in data and mint_address in data["data"]:
                    price = data["data"][mint_address]["price"]
                    return f"Current price: ${float(price):.8f} USD"
                return "Price data not available"
        except Exception as e:
            return f"Error fetching price: {e}"
    
    return [
        FunctionTool(func=get_solana_balance),
        FunctionTool(func=get_spl_token_balances),
        FunctionTool(func=get_token_price),
    ]


def create_deployed_agent_config(
    agent: Agent,
    timeout_seconds: int = 120,
    min_instances: int = 1,
    max_instances: int = 3,
    concurrency: int = 9,
    identity_type: str = "AGENT_IDENTITY",
    staging_bucket: str = None,
    requirements: list = None,
    agent_gateway: str = None,
) -> dict:
    """
    Create the deployment configuration for an agent on Agent Runtime.
    
    Args:
        agent: The ADK agent to deploy
        timeout_seconds: Query timeout
        min_instances: Minimum number of runtime instances
        max_instances: Maximum number of runtime instances
        concurrency: Container concurrency
        identity_type: AGENT_IDENTITY for per-agent identity
        staging_bucket: GCS staging bucket for deployment
        requirements: Additional pip requirements
        agent_gateway: Agent Gateway resource name for egress routing
        
    Returns:
        Configuration dict for client.agent_engines.create()
    """
    default_requirements = [
        "google-cloud-aiplatform[agent_engines,adk]>=1.88.0",
        "google-cloud-storage",
        "cloudpickle==3.0",
        "websockets",
    ]
    
    config = {
        "display_name": agent.name,
        "identity_type": identity_type,
        "staging_bucket": staging_bucket,
        "requirements": requirements or default_requirements,
        "min_instances": min_instances,
        "max_instances": max_instances,
        "container_concurrency": concurrency,
    }
    
    if agent_gateway:
        config["agent_gateway_config"] = {
            "agent_to_anywhere_config": {
                "agent_gateway": agent_gateway
            }
        }
    
    return config