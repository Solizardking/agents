"""
Agent Platform Sessions Manager.

Provides high-level operations for managing conversational sessions
across all deployed DeFi agents on the Gemini Enterprise Agent Platform.
"""

from typing import Any, Dict, List, Optional, AsyncIterator


class SessionManager:
    """
    Manages conversational sessions for all deployed agents.
    
    Sessions provide stateful conversation management, including event tracking,
    user identification, time-to-live configuration, and cleanup.
    """

    def __init__(self, client, project: str, location: str, sessions_id: str):
        self.client = client
        self.project = project
        self.location = location
        self.sessions_name = (
            f"projects/{project}/locations/{location}/reasoningEngines/{sessions_id}"
        )

    def create_session(
        self,
        user_id: str,
        session_id: Optional[str] = None,
        ttl_days: int = 365,
        session_state: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Create a new conversation session.
        
        Args:
            user_id: Opaque user identifier (max 128 chars)
            session_id: Optional custom session ID
            ttl_days: Session time-to-live in days (default: 365)
            session_state: Optional initial session state dict
            
        Returns:
            Created Session object
        """
        config = {
            "ttl": f"{ttl_days * 24 * 60 * 60}s",
        }

        if session_state:
            config["session_state"] = session_state

        kwargs = {
            "name": self.sessions_name,
            "user_id": user_id,
            "config": config,
        }
        if session_id:
            kwargs["session_id"] = session_id

        return self.client.agent_engines.sessions.create(**kwargs)

    def get_session(self, session_id: str, user_id: str) -> Any:
        """
        Get a specific session by ID.
        
        Args:
            session_id: Session resource ID
            user_id: User ID associated with the session
            
        Returns:
            Session object
        """
        return self.client.agent_engines.sessions.get(
            name=f"{self.sessions_name}/sessions/{session_id}",
            user_id=user_id,
        )

    def list_sessions(self, user_id: Optional[str] = None) -> List[Any]:
        """
        List sessions, optionally filtered by user ID.
        
        Args:
            user_id: Optional user ID filter
            
        Returns:
            List of Session objects
        """
        config = {}
        if user_id:
            config["filter"] = f"user_id={user_id}"

        return list(
            self.client.agent_engines.sessions.list(
                name=self.sessions_name,
                config=config,
            )
        )

    def delete_session(self, session_id: str) -> None:
        """
        Delete a session and its associated events.
        
        Args:
            session_id: Session resource ID to delete
        """
        self.client.agent_engines.sessions.delete(
            name=f"{self.sessions_name}/sessions/{session_id}"
        )

    def append_event(
        self,
        session_id: str,
        author: str,
        content: Dict[str, Any],
        invocation_id: str = "1",
    ) -> Any:
        """
        Append an event to a session.
        
        Args:
            session_id: Session resource ID
            author: Event author (user, model, tool, system)
            content: Event content dict with role and parts
            invocation_id: Invocation identifier (default: "1")
            
        Returns:
            Created Event object
        """
        return self.client.agent_engines.sessions.events.append(
            name=f"{self.sessions_name}/sessions/{session_id}",
            author=author,
            invocation_id=invocation_id,
            timestamp=__import__("datetime").datetime.now(
                __import__("datetime").timezone.utc
            ),
            config={"content": content},
        )

    def append_user_event(self, session_id: str, text: str) -> Any:
        """
        Convenience: Append a user text message event.
        
        Args:
            session_id: Session resource ID
            text: User message text
            
        Returns:
            Created Event object
        """
        return self.append_event(
            session_id=session_id,
            author="user",
            content={"role": "user", "parts": [{"text": text}]},
        )

    def append_model_event(self, session_id: str, text: str) -> Any:
        """
        Convenience: Append a model response event.
        
        Args:
            session_id: Session resource ID
            text: Model response text
            
        Returns:
            Created Event object
        """
        return self.append_event(
            session_id=session_id,
            author="model",
            content={"role": "model", "parts": [{"text": text}]},
        )

    def list_session_events(self, session_id: str) -> List[Any]:
        """
        List all events in a session.
        
        Args:
            session_id: Session resource ID
            
        Returns:
            List of Event objects
        """
        return list(
            self.client.agent_engines.list_session_events(
                name=f"{self.sessions_name}/sessions/{session_id}",
            )
        )

    def call_agent(
        self,
        agent_engine_name: str,
        session_id: str,
        user_id: str,
        message: str,
    ) -> Any:
        """
        Call a deployed agent with a session context.
        
        Args:
            agent_engine_name: Full agent engine resource name
            session_id: Session resource ID for context
            user_id: User ID for memory scoping
            message: User message text
            
        Returns:
            Agent response
        """
        return self.client.agent_engines.query(
            name=agent_engine_name,
            session_id=session_id,
            user_id=user_id,
            message=message,
        )

    def stream_agent(
        self,
        agent_engine_name: str,
        session_id: str,
        user_id: str,
        message: str,
    ) -> AsyncIterator[Any]:
        """
        Stream a response from a deployed agent.
        
        Args:
            agent_engine_name: Full agent engine resource name
            session_id: Session resource ID for context
            user_id: User ID for memory scoping
            message: User message text
            
        Yields:
            Streamed response chunks
        """
        return self.client.agent_engines.stream_query(
            name=agent_engine_name,
            session_id=session_id,
            user_id=user_id,
            message=message,
        )