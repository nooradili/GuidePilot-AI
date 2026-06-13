# GuidePilot AI Agent Registry Framework
# Encourages modular scalability for future agents (e.g., Smart City, Public Transport)

from typing import Dict, List, Any, Type
from backend.agents.base import BaseAgent

class AgentRegistry:
    """Central registry and dependency injector for all GuidePilot AI Agents."""
    _instances: Dict[str, BaseAgent] = {}
    _classes: Dict[str, Type[BaseAgent]] = {}

    @classmethod
    def register_class(cls, agent_type: str, agent_class: Type[BaseAgent]):
        """Registers an agent class for lazy instantiations."""
        cls._classes[agent_type] = agent_class
        print(f"[AgentRegistry] Registered agent class: {agent_type} -> {agent_class.__name__}")

    @classmethod
    def register_instance(cls, name: str, agent_instance: BaseAgent):
        """Registers a concrete instantiated agent instance directly."""
        cls._instances[name] = agent_instance
        print(f"[AgentRegistry] Registered active instance: {name}")

    @classmethod
    def get_agent(cls, name: str) -> BaseAgent:
        """Retrieves or lazily instantiates the requested agent by name."""
        if name in cls._instances:
            return cls._instances[name]
        
        if name in cls._classes:
            agent_class = cls._classes[name]
            instance = agent_class()
            cls._instances[name] = instance
            return instance
            
        raise ValueError(f"Agent '{name}' is not registered in the framework registry.")

    @classmethod
    def list_registered_agents(cls) -> List[str]:
        """Lists names of all registered agent configurations."""
        return list(set(list(cls._instances.keys()) + list(cls._classes.keys())))

    @classmethod
    def clear_registry(cls):
        """Clears registry caches (primarily used for unit testing)."""
        cls._instances.clear()
        cls._classes.clear()
