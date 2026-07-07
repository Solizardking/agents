"""
Agent Gateway Setup for DeFi Agents on Gemini Enterprise Agent Platform.

Configures secure network routing for all agent traffic through
Agent Gateway, supporting both egress (agent-to-anywhere) and ingress
(client-to-agent) modes.
"""

import subprocess
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def create_egress_gateway(
    project: str,
    location: str,
    gateway_name: str = "defi-agents-egress-gateway",
) -> str:
    """
    Create an Agent Gateway in egress (agent-to-anywhere) mode.
    
    Args:
        project: Google Cloud project ID
        location: Google Cloud region
        gateway_name: Gateway resource name
        
    Returns:
        Full gateway resource name
    """
    cmd = [
        "gcloud", "ai", "agent-gateways", "create", gateway_name,
        "--project", project,
        "--location", location,
        "--mode", "agent-to-anywhere",
        "--format", "json",
    ]
    
    logger.info(f"Creating egress gateway: {gateway_name}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode != 0:
        if "already exists" in result.stderr:
            logger.info(f"Gateway '{gateway_name}' already exists")
            gateway_resource = (
                f"projects/{project}/locations/{location}/agentGateways/{gateway_name}"
            )
        else:
            logger.error(f"Failed to create egress gateway: {result.stderr}")
            raise RuntimeError(f"Gateway creation failed: {result.stderr}")
    else:
        data = json.loads(result.stdout)
        gateway_resource = data.get("name", data if isinstance(data, str) else 
            f"projects/{project}/locations/{location}/agentGateways/{gateway_name}")
        logger.info(f"Egress gateway created: {gateway_resource}")
    
    return gateway_resource


def create_ingress_gateway(
    project: str,
    location: str,
    gateway_name: str = "defi-agents-ingress-gateway",
) -> str:
    """
    Create an Agent Gateway in ingress (client-to-agent) mode.
    
    Args:
        project: Google Cloud project ID
        location: Google Cloud region
        gateway_name: Gateway resource name
        
    Returns:
        Full gateway resource name
    """
    cmd = [
        "gcloud", "ai", "agent-gateways", "create", gateway_name,
        "--project", project,
        "--location", location,
        "--mode", "client-to-agent",
        "--format", "json",
    ]
    
    logger.info(f"Creating ingress gateway: {gateway_name}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode != 0:
        if "already exists" in result.stderr:
            logger.info(f"Gateway '{gateway_name}' already exists")
            gateway_resource = (
                f"projects/{project}/locations/{location}/agentGateways/{gateway_name}"
            )
        else:
            logger.error(f"Failed to create ingress gateway: {result.stderr}")
            raise RuntimeError(f"Gateway creation failed: {result.stderr}")
    else:
        logger.info(f"Ingress gateway created: {gateway_name}")
        gateway_resource = (
            f"projects/{project}/locations/{location}/agentGateways/{gateway_name}"
        )
    
    return gateway_resource


def register_agent_endpoint(
    project: str,
    location: str,
    service_name: str,
    display_name: str,
) -> str:
    """
    Register an agent endpoint with the Agent Registry.
    
    Args:
        project: Google Cloud project ID
        location: Google Cloud region
        service_name: Registry service name
        display_name: Human-readable display name
        
    Returns:
        Registry resource name
    """
    cmd = [
        "gcloud", "agent-registry", "services", "create", service_name,
        "--project", project,
        "--location", location,
        f"--display-name={display_name}",
        "--endpoint-spec-type=no-spec",
        "--interfaces",
        json.dumps([{
            "url": f"https://{location}-aiplatform.mtls.googleapis.com",
            "protocolBinding": "jsonrpc",
        }]),
        "--format=value(registryResource)",
    ]
    
    logger.info(f"Registering agent endpoint: {service_name}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    
    if result.returncode != 0:
        if "already exists" in result.stderr:
            logger.info(f"Endpoint '{service_name}' already exists")
        else:
            logger.error(f"Failed to register endpoint: {result.stderr}")
            raise RuntimeError(f"Endpoint registration failed: {result.stderr}")
    
    return result.stdout.strip()


def create_agent_to_registry_iam_binding(
    project: str,
    location: str,
    endpoint_id: str,
    agent_identity: str,
) -> None:
    """
    Create IAM policy binding between agent and registry.
    
    Args:
        project: Google Cloud project ID
        location: Google Cloud region
        endpoint_id: Registered endpoint ID
        agent_identity: Agent identity principal
    """
    cmd = [
        "gcloud", "iap", "web", "add-iam-policy-binding",
        "--resource-type=agent-registry",
        f"--endpoint={endpoint_id}",
        f"--region={location}",
        f"--project={project}",
        f"--member={agent_identity}",
        "--role=roles/iap.egressor",
    ]
    
    logger.info(f"Creating IAM binding for {agent_identity} -> {endpoint_id}")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    
    if result.returncode != 0:
        logger.warning(f"IAM binding may have failed: {result.stderr}")


def verify_gateway_binding(
    project: str,
    location: str,
    resource_id: str,
) -> Optional[dict]:
    """
    Verify that an agent is properly bound to the gateway.
    
    Args:
        project: Google Cloud project ID
        location: Google Cloud region
        resource_id: Agent ReasonEngine resource ID
        
    Returns:
        Gateway config dict, or None if not bound
    """
    cmd = [
        "curl", "-s",
        "-H", f"Authorization: Bearer $(gcloud auth print-access-token)",
        f"https://{location}-aiplatform.googleapis.com/v1beta1/projects/{project}/locations/{location}/reasoningEngines/{resource_id}",
    ]
    
    result = subprocess.run(
        ["bash", "-c", " && ".join(cmd)],
        capture_output=True, text=True, timeout=30
    )
    
    if result.returncode == 0:
        data = json.loads(result.stdout)
        gateway_config = (
            data.get("spec", {})
            .get("deploymentSpec", {})
            .get("agentGatewayConfig")
        )
        if gateway_config:
            logger.info(f"Gateway binding verified for {resource_id}")
            return gateway_config
        else:
            logger.warning(f"No gateway binding found for {resource_id}")
            return None
    
    logger.error(f"Failed to verify gateway binding: {result.stderr}")
    return None