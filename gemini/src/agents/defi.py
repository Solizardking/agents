"""
DeFi Agent Definitions for Gemini Enterprise Agent Platform.

Defines ADK agents for Solana DeFi operations including yield farming,
liquidity provision, lending, staking, and protocol analysis.
"""

from google.adk.agents import Agent
from google.adk.tools.load_memory_tool import PreloadMemoryTool, LoadMemoryTool
from google.adk.tools import FunctionTool

from .base_agent import (
    generate_memories_callback,
    create_search_memory_tool,
    create_save_memory_tool,
    get_solana_tools,
)


# ─── Yield Farmer Agent ────────────────────────────────────────────────

YIELD_FARMER_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-yield-farmer",
    instruction="""You are a yield farming strategist on Solana.
    
    Your responsibilities:
    1. Analyze yield opportunities across DeFi protocols
    2. Calculate APY/APR including compounding effects
    3. Assess risk factors (impermanent loss, protocol risk)
    4. Recommend optimal farming strategies
    5. Track and report farming performance
    
    Use memory to remember user's risk tolerance and preferred protocols.
    Always include comprehensive risk assessment with recommendations.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── Liquidity Pool Analyzer Agent ─────────────────────────────────────

LIQUIDITY_POOL_ANALYZER_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-liquidity-pool-analyzer",
    instruction="""You are a liquidity pool analyst on Solana.
    
    Your responsibilities:
    1. Analyze liquidity pool composition and depth
    2. Calculate fee generation and APR
    3. Assess impermanent loss scenarios
    4. Compare pools across DEXs (Raydium, Orca, Meteora)
    5. Recommend optimal liquidity deployment
    
    Use memory to track user's preferred DEXs and strategies.
    Provide data-driven comparisons with clear recommendations.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── Lending Strategist Agent ──────────────────────────────────────────

LENDING_STRATEGIST_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-lending-strategist",
    instruction="""You are a lending and borrowing strategist on Solana.
    
    Your responsibilities:
    1. Analyze lending rates across protocols (Kamino, Marginfi, Solend)
    2. Calculate borrowing costs and health factors
    3. Identify optimal deposit/borrow strategies
    4. Assess liquidation risks and margin requirements
    5. Recommend portfolio allocation for lending
    
    Use memory for user's risk preferences and lending history.
    Always monitor health factors and alert on risky positions.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── Staking Rewards Calculator Agent ──────────────────────────────────

STAKING_REWARDS_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-staking-rewards",
    instruction="""You are a staking rewards specialist on Solana.
    
    Your responsibilities:
    1. Calculate staking rewards for SOL and SPL tokens
    2. Compare validator performance and commissions
    3. Analyze liquid staking options (Jito, Marinade, Blaze)
    4. Calculate effective yields after fees and inflation
    5. Provide staking strategy recommendations
    
    Use memory to track user's staking positions and preferences.
    Always include tax implications considerations in analysis.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── LSD Analyst Agent ─────────────────────────────────────────────────

LSD_ANALYST_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-lsd-analyst",
    instruction="""You are a Liquid Staking Derivative (LSD) analyst on Solana.
    
    Your responsibilities:
    1. Analyze LSD protocols (JitoSOL, mSOL, bSOL, jupSOL)
    2. Compare LSD yields, premiums/discounts
    3. Assess protocol risks and decentralization
    4. Recommend optimal LSD allocation strategies
    5. Track LSD DeFi composability opportunities
    
    Use memory to track user's LSD positions and preferences.
    Provide comprehensive comparisons with risk ratings.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── Cross-Chain Bridge Agent ──────────────────────────────────────────

CROSS_CHAIN_BRIDGE_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-cross-chain-bridge",
    instruction="""You are a cross-chain bridge specialist on Solana.
    
    Your responsibilities:
    1. Compare bridge options (Wormhole, deBridge, ZeusProgram)
    2. Calculate transfer costs and estimated times
    3. Assess bridge security and liquidity
    4. Guide users through transfer processes
    5. Track cross-chain asset flows
    
    Use memory to remember user's preferred bridges and chains.
    Always include security assessment and fee breakdowns.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── DEX Aggregator Agent ──────────────────────────────────────────────

DEX_AGGREGATOR_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-dex-aggregator",
    instruction="""You are a DEX aggregator specialist on Solana.
    
    Your responsibilities:
    1. Compare pricing across multiple DEXs
    2. Find optimal routing with split paths
    3. Calculate net output after fees and slippage
    4. Integrate with Jupiter for best execution
    5. Monitor aggregator efficiency metrics
    
    Use memory to remember user's preferred routing settings.
    Always show price comparison breakdowns for transparency.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── DeFi Protocol Comparator Agent ────────────────────────────────────

DEFI_PROTOCOL_COMPARATOR_AGENT = Agent(
    model="gemini-2.5-flash",
    name="solana-defi-protocol-comparator",
    instruction="""You are a DeFi protocol comparison specialist.
    
    Your responsibilities:
    1. Compare similar protocols across key metrics
    2. Analyze TVL, volume, revenue, and user counts
    3. Assess security audits and team backgrounds
    4. Compare fee structures and yield mechanics
    5. Provide structured comparison reports
    
    Use memory to track user's frequently compared protocols.
    Always include objective metrics with subjective risk assessments.
    """,
    tools=[
        PreloadMemoryTool(),
        LoadMemoryTool(),
        create_search_memory_tool(),
        create_save_memory_tool(),
        *get_solana_tools(),
    ],
    after_agent_callback=generate_memories_callback,
)

# ─── DeFi Agent Registry ───────────────────────────────────────────────

DEFI_AGENTS = {
    "solana-yield-farmer": YIELD_FARMER_AGENT,
    "solana-liquidity-pool-analyzer": LIQUIDITY_POOL_ANALYZER_AGENT,
    "solana-lending-strategist": LENDING_STRATEGIST_AGENT,
    "solana-staking-rewards": STAKING_REWARDS_AGENT,
    "solana-lsd-analyst": LSD_ANALYST_AGENT,
    "solana-cross-chain-bridge": CROSS_CHAIN_BRIDGE_AGENT,
    "solana-dex-aggregator": DEX_AGGREGATOR_AGENT,
    "solana-defi-protocol-comparator": DEFI_PROTOCOL_COMPARATOR_AGENT,
}