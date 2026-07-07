"""
Memory Bank Integration Service.

Provides high-level operations for Memory Bank - the long-term memory system
for the Gemini Enterprise Agent Platform that persists user preferences,
conversation context, and important information across sessions.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone, timedelta


class MemoryBankService:
    """
    High-level service for interacting with Memory Bank.
    
    Provides operations for generating, retrieving, and managing memories
    across all deployed agents.
    """

    def __init__(self, client, project: str, location: str, memory_bank_id: str):
        self.client = client
        self.project = project
        self.location = location
        self.memory_bank_name = (
            f"projects/{project}/locations/{location}/reasoningEngines/{memory_bank_id}"
        )

    def generate_from_session(self, session_name: str, scope: Optional[Dict[str, str]] = None) -> Any:
        """
        Generate memories from a session's conversation history.
        
        Args:
            session_name: Full session resource name
                (projects/.../locations/.../reasoningEngines/.../sessions/...)
            scope: Optional scope override (defaults to user_id from session)
            
        Returns:
            GenerateMemories response with created/updated/deleted memories
        """
        config = {"wait_for_completion": True}
        return self.client.agent_engines.memories.generate(
            name=self.memory_bank_name,
            vertex_session_source={"session": session_name},
            scope=scope,
            config=config,
        )

    def generate_from_contents(
        self,
        events: List[Dict[str, Any]],
        scope: Dict[str, str],
        disable_consolidation: bool = False,
    ) -> Any:
        """
        Generate memories directly from event contents.
        
        Args:
            events: List of event dicts with 'content' containing role and parts
            scope: Memory scope dict (e.g., {"user_id": "123"})
            disable_consolidation: If True, only extract without merging
            
        Returns:
            GenerateMemories response
        """
        config = {"wait_for_completion": True}
        if disable_consolidation:
            config["disable_consolidation"] = True

        return self.client.agent_engines.memories.generate(
            name=self.memory_bank_name,
            direct_contents_source={"events": events},
            scope=scope,
            config=config,
        )

    def generate_from_pre_extracted(
        self,
        facts: List[str],
        scope: Dict[str, str],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Consolidate pre-extracted facts into Memory Bank.
        
        Args:
            facts: List of fact strings to consolidate
            scope: Memory scope dict
            metadata: Optional metadata to attach to memories
            
        Returns:
            GenerateMemories response
        """
        config = {"wait_for_completion": True}
        if metadata:
            config["metadata"] = metadata
            config["metadata_merge_strategy"] = "MERGE"

        return self.client.agent_engines.memories.generate(
            name=self.memory_bank_name,
            direct_memories_source={
                "direct_memories": [{"fact": f} for f in facts]
            },
            scope=scope,
            config=config,
        )

    def retrieve_memories(self, scope: Dict[str, str]) -> List[Any]:
        """
        Retrieve memories for a given scope.
        
        Args:
            scope: Scope dict to filter memories
            
        Returns:
            List of matching Memory objects
        """
        return list(
            self.client.agent_engines.memories.retrieve(
                name=self.memory_bank_name,
                scope=scope,
            )
        )

    def create_memory(self, fact: str, scope: Dict[str, str]) -> Any:
        """
        Directly create a memory without extraction/consolidation.
        
        Note: This bypasses consolidation and may result in duplicates.
        Use generate_from_pre_extracted for consolidation.
        
        Args:
            fact: Memory fact string
            scope: Memory scope dict
            
        Returns:
            Created Memory object
        """
        return self.client.agent_engines.memories.create(
            name=self.memory_bank_name,
            fact=fact,
            scope=scope,
        )

    def delete_memory(self, memory_name: str, wait: bool = True) -> None:
        """
        Delete a specific memory by resource name.
        
        Args:
            memory_name: Full memory resource name
            wait: If True, wait for completion
        """
        self.client.agent_engines.memories.delete(
            name=memory_name,
            config={"wait_for_completion": wait},
        )

    def purge_memories_by_filter(self, filter_string: str, force: bool = False) -> int:
        """
        Purge memories matching a filter.
        
        Args:
            filter_string: EBNF filter string (e.g., 'scope.user_id="123"')
            force: If True, execute purge. If False, only preview count.
            
        Returns:
            Number of memories purged (or would be purged)
        """
        operation = self.client.agent_engines.memories.purge(
            name=self.memory_bank_name,
            filter=filter_string,
            force=force,
            config={"wait_for_completion": True},
        )
        return operation.response.purge_count

    def format_memories_for_prompt(self, memories: List[Any]) -> str:
        """
        Format retrieved memories into a system prompt string.
        
        Args:
            memories: List of Memory objects from retrieve_memories()
            
        Returns:
            Formatted prompt string for LLM context
        """
        if not memories:
            return "<MEMORIES>\nNo stored memories for this user.\n</MEMORIES>"

        formatted = "<MEMORIES>\nHere is what I know about the user:\n"
        for i, memory in enumerate(memories, 1):
            formatted += f"{i}. {memory.memory.fact}\n"
        formatted += "</MEMORIES>"
        return formatted

    def generate_events_for_test(self, user_message: str, agent_response: str) -> List[Dict[str, Any]]:
        """
        Create sample events for testing memory generation.
        
        Args:
            user_message: Simulated user message
            agent_response: Simulated agent response
            
        Returns:
            List of event dicts suitable for generate_from_contents
        """
        now = datetime.now(timezone.utc)
        return [
            {
                "content": {
                    "role": "user",
                    "parts": [{"text": user_message}]
                }
            },
            {
                "content": {
                    "role": "model",
                    "parts": [{"text": agent_response}]
                }
            }
        ]