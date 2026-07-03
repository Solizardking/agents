import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface BrowserAgent {
  id: string;
  title: string;
  description: string;
  category: string;
  avatar: string;
  tags: string[];
  featured: boolean;
  oneShot: boolean;
  tokenUsage: number | null;
  openingMessage: string;
  openingQuestions: string[];
  persona: string;
  capabilities: string[];
  metaplexSkills: string[];
  vulcanSkills: string[];
  skillPaths: string[];
  localeCoverage: {
    localeCount: number;
    locales: string[];
    defaultTitle: string;
    defaultDescription: string;
  } | null;
  source: {
    repoRoot: string;
    file: string;
    homepage: string;
    author: string;
    createdAt: string;
    deploy: Record<string, unknown> | null;
  };
}

export interface BrowserAgentTemplate {
  id: string;
  filename: string;
  description: string;
  raw: Record<string, unknown>;
}

export interface BrowserAgentCharacter {
  id: string;
  name: string;
  bio: string[];
  lore: string[];
  adjectives: string[];
  topics: string[];
  style: Record<string, unknown>;
}

export interface BrowserAgentSkill {
  id: string;
  title: string;
  summary: string;
  file: string;
}

export interface BrowserAgentProject {
  id: string;
  title: string;
  kind: string;
  path: string;
  packageName: string | null;
  homepage: string;
  summary: string;
}

export interface BrowserAgentDoc {
  id: string;
  filename: string;
  title: string;
  summary: string;
  file: string;
  source?: string;
}

export interface BrowserAgentLocale {
  id: string;
  localeCount: number;
  locales: string[];
  defaultTitle: string;
  defaultDescription: string;
  openingMessage: string;
  openingQuestions: string[];
  fileCount: number;
  baseFile: string;
}

export interface BrowserAgentWellKnown {
  id: string;
  scope: string;
  filename: string;
  summary: string;
  raw: Record<string, unknown> | null;
}

export interface BrowserAgentRepoAsset {
  id: string;
  scope: string;
  filename: string;
  file: string;
  summary: string;
}

export interface BrowserAgentsIntegration {
  manifest: {
    sourceRoot?: string;
    targetRoot?: string;
    importedAt?: string;
    textFiles?: number;
    rewrittenFiles?: number;
    binaryFiles?: number;
    symlinks?: number;
    skippedSecrets?: string[];
    skippedCruft?: string[];
  } | null;
  roots: Array<{ path: string; present: boolean }>;
}

interface BrowserAgentsPayload {
  importedAt: string;
  sourceRoot: string;
  integration: BrowserAgentsIntegration;
  catalogMeta: {
    apiVersion: string;
    generatedAt: string;
    stats: Record<string, unknown>;
    categories: Array<Record<string, unknown>>;
    deployPaths: Array<Record<string, unknown>>;
    hub: Record<string, unknown>;
    metaplexSkill: Record<string, unknown>;
  };
  manifest: Record<string, unknown>;
  meta: Record<string, unknown>;
  clawd: Record<string, unknown>;
  starters: {
    ids: string[];
    count: number;
    agents: BrowserAgent[];
  };
  templates: BrowserAgentTemplate[];
  browserTemplates: BrowserAgentTemplate[];
  characters: BrowserAgentCharacter[];
  skills: BrowserAgentSkill[];
  docs: BrowserAgentDoc[];
  locales: BrowserAgentLocale[];
  wellKnown: BrowserAgentWellKnown[];
  repoAssets: {
    schema: BrowserAgentRepoAsset[];
    scripts: BrowserAgentRepoAsset[];
    public: BrowserAgentRepoAsset[];
    cursor: BrowserAgentRepoAsset[];
    root: BrowserAgentRepoAsset[];
  };
  projects: BrowserAgentProject[];
  agents: BrowserAgent[];
}

let cache: BrowserAgentsPayload | null = null;

const NON_LIVE_SURFACE_PATTERN = /\b(paper|dry[\s_-]?run|simulate|simulation|demo|testnet|devnet)\b/i;

function liveOnlyTextItems(items: string[]) {
  return Array.isArray(items) ? items.filter((item) => !NON_LIVE_SURFACE_PATTERN.test(item)) : [];
}

function liveOnlyAgentProse(text: string) {
  return text
    .replace(
      "Prefer observe, paper, and dry_run before live modes.",
      "Use live execution only after preflight, margin, position, market-data, and account-health checks pass.",
    )
    .replace(
      "Maintain explicit mode state: observe, paper, dry_run, confirm_each, or auto_execute.",
      "Maintain explicit live execution state: live_review, confirm_each, or auto_execute.",
    )
    .replace(/\bin paper mode\b/gi, "with live preflight controls")
    .replace(/\bvulcan-paper-trading\b/gi, "vulcan-live-preflight")
    .replace(/\bvulcan-dry-run\b/gi, "vulcan-live-review");
}

function sanitizeAgentForLiveSurface(agent: BrowserAgent): BrowserAgent {
  return {
    ...agent,
    persona: liveOnlyAgentProse(agent.persona),
    tags: liveOnlyTextItems(agent.tags),
    openingQuestions: liveOnlyTextItems(agent.openingQuestions),
    capabilities: liveOnlyTextItems(agent.capabilities),
    vulcanSkills: liveOnlyTextItems(agent.vulcanSkills),
  };
}

function sanitizePayloadForLiveSurfaces(payload: BrowserAgentsPayload): BrowserAgentsPayload {
  const agents = payload.agents.map(sanitizeAgentForLiveSurface);
  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const starterAgents = payload.starters.agents.map(
    (agent) => agentsById.get(agent.id) ?? sanitizeAgentForLiveSurface(agent),
  );
  return {
    ...payload,
    agents,
    starters: {
      ...payload.starters,
      agents: starterAgents,
      count: starterAgents.length,
    },
    locales: payload.locales.map((locale) => ({
      ...locale,
      openingQuestions: liveOnlyTextItems(locale.openingQuestions),
    })),
  };
}

export function loadBrowserAgents(): BrowserAgentsPayload {
  if (cache) return cache;
  const file = path.join(__dirname, "browser-agents.generated.json");
  if (!fs.existsSync(file)) {
    cache = {
      importedAt: "",
      sourceRoot: "",
      integration: {
        manifest: null,
        roots: [],
      },
      catalogMeta: {
        generatedAt: "",
        apiVersion: "",
        stats: {},
        categories: [],
        deployPaths: [],
        hub: {},
        metaplexSkill: {},
      },
      manifest: {},
      meta: {},
      clawd: {},
      starters: {
        ids: [],
        count: 0,
        agents: [],
      },
      templates: [],
      browserTemplates: [],
      characters: [],
      skills: [],
      docs: [],
      locales: [],
      wellKnown: [],
      repoAssets: {
        schema: [],
        scripts: [],
        public: [],
        cursor: [],
        root: [],
      },
      projects: [],
      agents: [],
    };
    return cache;
  }
  cache = sanitizePayloadForLiveSurfaces(JSON.parse(fs.readFileSync(file, "utf8")) as BrowserAgentsPayload);
  return cache;
}

export function getBrowserAgent(id: string): BrowserAgent | null {
  return loadBrowserAgents().agents.find((agent) => agent.id === id) ?? null;
}

export function getBrowserAgentTemplate(id: string): BrowserAgentTemplate | null {
  return loadBrowserAgents().templates.find((template) => template.id === id) ?? null;
}

export function getBrowserCharacter(id: string): BrowserAgentCharacter | null {
  return loadBrowserAgents().characters.find((character) => character.id === id) ?? null;
}

export function getBrowserTemplate(id: string): BrowserAgentTemplate | null {
  return loadBrowserAgents().browserTemplates.find((template) => template.id === id) ?? null;
}

export function getBrowserLocale(id: string): BrowserAgentLocale | null {
  return loadBrowserAgents().locales.find((locale) => locale.id === id) ?? null;
}
