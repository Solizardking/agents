#!/usr/bin/env bash
#
# setup.sh - One-shot setup for DeFi Agents on Gemini Enterprise Agent Platform
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh --project=DEFI-AGENTS-PROJECT [--location=us-central1]
#
# This script:
#   1. Creates/verifies a GCP project with required APIs enabled
#   2. Creates Memory Bank instance for long-term memory
#   3. Creates Sessions instance for conversation state
#   4. Creates Agent Gateway for secure routing
#   5. Installs Python dependencies
#   6. Validates the setup
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - pip installed
#

set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
info()  { echo -e "${BLUE}[i]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ─── Parse arguments ──────────────────────────────────────────────────
PROJECT=""
LOCATION="us-central1"
STAGING_BUCKET=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --project=*) PROJECT="${1#*=}"; shift;;
        --location=*) LOCATION="${1#*=}"; shift;;
        --staging-bucket=*) STAGING_BUCKET="${1#*=}"; shift;;
        --help|-h)
            echo "Usage: $0 --project=PROJECT_ID [--location=us-central1] [--staging-bucket=gs://...]"
            exit 0
            ;;
        *) error "Unknown argument: $1";;
    esac
done

[[ -z "$PROJECT" ]] && error "Required: --project=PROJECT_ID"

echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│  DeFi Agents - Gemini Enterprise Agent Platform Setup         │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
info "Project:  $PROJECT"
info "Location: $LOCATION"
echo ""

# ─── Step 1: GCP Project Setup ───────────────────────────────────────
info "Step 1/6: Verifying GCP project and enabling APIs..."

if gcloud projects describe "$PROJECT" >/dev/null 2>&1; then
    log "Project '$PROJECT' exists"
else
    info "Creating project '$PROJECT'..."
    gcloud projects create "$PROJECT" --name="DeFi Agents"
    log "Project created"
fi

gcloud config set project "$PROJECT" >/dev/null 2>&1

# Enable required APIs
APIS=(
    "aiplatform.googleapis.com"
    "aiplatform-agent-engines.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "iam.googleapis.com"
    "cloudkms.googleapis.com"
    "storage.googleapis.com"
    "logging.googleapis.com"
    "monitoring.googleapis.com"
)

for api in "${APIS[@]}"; do
    info "Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT" --quiet || warn "Failed to enable $api (may already be enabled)"
done

log "APIs enabled"

# ─── Step 2: Create Staging Bucket ────────────────────────────────────
info "Step 2/6: Setting up Cloud Storage..."

if [[ -z "$STAGING_BUCKET" ]]; then
    STAGING_BUCKET="gs://${PROJECT}-agent-staging"
fi

BUCKET_NAME="${STAGING_BUCKET#gs://}"

if gsutil ls "$STAGING_BUCKET" >/dev/null 2>&1; then
    log "Bucket '$STAGING_BUCKET' already exists"
else
    info "Creating bucket '$STAGING_BUCKET'..."
    gsutil mb -p "$PROJECT" -l "${LOCATION%-*}" "$STAGING_BUCKET"
    gsutil uniformbucketlevelaccess set on "$STAGING_BUCKET"
    log "Bucket created"
fi

# ─── Step 3: Create Memory Bank ───────────────────────────────────────
info "Step 3/6: Creating Memory Bank instance..."

MEMORY_BANK_OUTPUT=$(python3 -c "
from google import genai
client = genai.Client(project='$PROJECT', location='$LOCATION')
mb = client.agent_engines.create(config={
    'display_name': 'DeFi Agents Memory Bank',
    'context_spec': {
        'memory_bank_config': {
            'generation_config': {
                'model': 'projects/$PROJECT/locations/$LOCATION/publishers/google/models/gemini-2.5-flash'
            },
            'similarity_search_config': {
                'embedding_model': 'projects/$PROJECT/locations/$LOCATION/publishers/google/models/text-embedding-005'
            },
            'customization_configs': [{
                'memory_topics': [
                    {'managed_memory_topic': {'managed_topic_enum': 'USER_PERSONAL_INFO'}},
                    {'managed_memory_topic': {'managed_topic_enum': 'USER_PREFERENCES'}},
                    {'managed_memory_topic': {'managed_topic_enum': 'KEY_CONVERSATION_DETAILS'}},
                    {'managed_memory_topic': {'managed_topic_enum': 'EXPLICIT_INSTRUCTIONS'}}
                ],
                'enable_third_person_memories': False
            }],
            'disable_memory_revisions': False
        }
    }
})
print(mb.api_resource.name)
")

MEMORY_BANK_NAME="$MEMORY_BANK_OUTPUT"
MEMORY_BANK_ID=$(echo "$MEMORY_BANK_NAME" | awk -F'/' '{print $NF}')
log "Memory Bank created: $MEMORY_BANK_NAME (ID: $MEMORY_BANK_ID)"

# ─── Step 4: Create Sessions ──────────────────────────────────────────
info "Step 4/6: Creating Sessions instance..."

SESSIONS_OUTPUT=$(python3 -c "
from google import genai
client = genai.Client(project='$PROJECT', location='$LOCATION')
s = client.agent_engines.create(config={'display_name': 'DeFi Agents Sessions'})
print(s.api_resource.name)
")

SESSIONS_NAME="$SESSIONS_OUTPUT"
SESSIONS_ID=$(echo "$SESSIONS_NAME" | awk -F'/' '{print $NF}')
log "Sessions created: $SESSIONS_NAME (ID: $SESSIONS_ID)"

# ─── Step 5: Create Agent Gateway ─────────────────────────────────────
info "Step 5/6: Creating Agent Gateway..."

EGRESS_GATEWAY_NAME="defi-agents-egress-gateway"
if gcloud ai agent-gateways describe "$EGRESS_GATEWAY_NAME" --project="$PROJECT" --location="$LOCATION" >/dev/null 2>&1; then
    log "Egress gateway '$EGRESS_GATEWAY_NAME' already exists"
else
    gcloud ai agent-gateways create "$EGRESS_GATEWAY_NAME" \
        --project="$PROJECT" \
        --location="$LOCATION" \
        --mode=agent-to-anywhere \
        --quiet
    log "Egress gateway created: $EGRESS_GATEWAY_NAME"
fi

INGRESS_GATEWAY_NAME="defi-agents-ingress-gateway"
if gcloud ai agent-gateways describe "$INGRESS_GATEWAY_NAME" --project="$PROJECT" --location="$LOCATION" >/dev/null 2>&1; then
    log "Ingress gateway '$INGRESS_GATEWAY_NAME' already exists"
else
    gcloud ai agent-gateways create "$INGRESS_GATEWAY_NAME" \
        --project="$PROJECT" \
        --location="$LOCATION" \
        --mode=client-to-agent \
        --quiet
    log "Ingress gateway created: $INGRESS_GATEWAY_NAME"
fi

# ─── Step 6: Install Python Dependencies ──────────────────────────────
info "Step 6/6: Installing Python dependencies..."

pip install "google-cloud-aiplatform[agent_engines,adk]>=1.111.0" --quiet \
    || error "Failed to install AI Platform SDK"

log "Python dependencies installed"

# ─── Summary ──────────────────────────────────────────────────────────
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│  SETUP COMPLETE                                                │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "  Export these environment variables:"
echo ""
echo "  export GOOGLE_CLOUD_PROJECT=$PROJECT"
echo "  export GOOGLE_CLOUD_LOCATION=$LOCATION"
echo "  export GOOGLE_CLOUD_STAGING_BUCKET=$STAGING_BUCKET"
echo "  export GOOGLE_GENAI_USE_ENTERPRISE=TRUE"
echo "  export MEMORY_BANK_ID=$MEMORY_BANK_ID"
echo "  export SESSIONS_ID=$SESSIONS_ID"
echo "  export EGRESS_GATEWAY_NAME=projects/$PROJECT/locations/$LOCATION/agentGateways/$EGRESS_GATEWAY_NAME"
echo ""
echo "  Deploy agents:"
echo "  python3 agents/gemini/src/deployment/deploy_all_agents.py \\"
echo "      --project=$PROJECT \\"
echo "      --location=$LOCATION \\"
echo "      --staging-bucket=$STAGING_BUCKET \\"
echo "      --egress-gateway=projects/$PROJECT/locations/$LOCATION/agentGateways/$EGRESS_GATEWAY_NAME"
echo ""