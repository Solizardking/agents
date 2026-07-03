import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  BrainCircuit,
  Cable,
  CircleDollarSign,
  FileText,
  Flame,
  Gauge,
  Landmark,
  Layers3,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  WalletCards,
  Waves,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type StarterAgent = {
  id: string;
  title: string;
  description: string;
  category: string;
  avatar: string;
  tags: string[];
  featured: boolean;
  oneShot: boolean;
  tokenUsage: number | null;
  capabilities: string[];
  metaplexSkills: string[];
  source: {
    homepage: string;
    author: string;
    createdAt: string;
  };
  recommendation?: {
    runtime: string;
    provider: string;
    model: string;
    confidence: string;
    recommendedDocs?: Array<{ id: string; title: string }>;
  };
  runtimeProfile?: {
    runtime: string;
    adapter: string;
    status: string;
    summary: string;
    missing: string[];
    relatedProjects: string[];
  };
  platformContext?: {
    services: Array<{ name: string; endpoint: string; version?: string }>;
    supportedTrust: string[];
    deployPaths: Array<{ label: string; description?: string }>;
    discovery: string[];
  };
};

type HubDoc = {
  id: string;
  title: string;
  summary: string;
  file: string;
  source?: string;
};

type StarterCatalogResponse = {
  importedAt: string;
  count: number;
  sourceRoot: string;
  manifest?: {
    accessPatterns?: Record<string, string>;
    agents?: Record<string, { count?: number; description?: string }>;
  };
  clawd?: {
    services?: Array<{ name: string; endpoint: string; description?: string }>;
  };
  catalogMeta?: {
    stats?: {
      totalAgents?: number;
      byCategory?: Record<string, number>;
    };
    hub?: {
      api?: string;
      gallery?: string;
      mint?: string;
      registry?: string;
    };
  };
  integration?: {
    manifest?: {
      textFiles?: number;
      rewrittenFiles?: number;
      binaryFiles?: number;
      skippedSecrets?: string[];
      skippedCruft?: string[];
    } | null;
    roots?: Array<{ path: string; present: boolean }>;
  };
  docs?: HubDoc[];
  locales?: Array<{ id: string; localeCount: number; defaultTitle: string; defaultDescription: string }>;
  wellKnown?: Array<{ id: string; scope: string; filename: string; summary: string }>;
  skills?: Array<{ id: string; title: string; summary: string; file: string }>;
  projects?: Array<{ id: string; title: string; kind: string; path: string; summary: string }>;
  repoAssets?: {
    schema?: Array<{ id: string; filename: string; summary: string }>;
    scripts?: Array<{ id: string; filename: string; summary: string }>;
    public?: Array<{ id: string; filename: string; summary: string }>;
    cursor?: Array<{ id: string; filename: string; summary: string }>;
    root?: Array<{ id: string; filename: string; summary: string }>;
  };
  agents: StarterAgent[];
};

const docPriority = [
  "agent-arena-creator-earnings",
  "cheshire-launchpad-mainnet-plan",
  "cheshire-terminal-api",
  "live-agent-arena-trading",
  "live-trading-release",
  "phoenix-perps-integration",
  "redpill-solana-attestation",
  "open-source-release",
  "supabase-clerk-setup",
];

const categoryMeta: Record<string, { icon: typeof Bot; className: string }> = {
  trading: { icon: Gauge, className: "border-rose-500/30 text-rose-200 bg-rose-500/10" },
  security: { icon: ShieldCheck, className: "border-emerald-500/30 text-emerald-200 bg-emerald-500/10" },
  defi: { icon: Waves, className: "border-cyan-500/30 text-cyan-200 bg-cyan-500/10" },
  payments: { icon: CircleDollarSign, className: "border-amber-500/30 text-amber-200 bg-amber-500/10" },
  research: { icon: BrainCircuit, className: "border-violet-500/30 text-violet-200 bg-violet-500/10" },
  infrastructure: { icon: Cable, className: "border-blue-500/30 text-blue-200 bg-blue-500/10" },
  portfolio: { icon: WalletCards, className: "border-teal-500/30 text-teal-200 bg-teal-500/10" },
  education: { icon: FileText, className: "border-lime-500/30 text-lime-200 bg-lime-500/10" },
  "dev-tools": { icon: Wrench, className: "border-orange-500/30 text-orange-200 bg-orange-500/10" },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function docKicker(doc: HubDoc) {
  if (doc.id.includes("arena")) return "Arena";
  if (doc.id.includes("launchpad")) return "Launchpad";
  if (doc.id.includes("api")) return "API";
  if (doc.id.includes("trading") || doc.id.includes("phoenix")) return "Trading";
  if (doc.id.includes("attestation") || doc.id.includes("open-source")) return "Trust";
  if (doc.id.includes("supabase") || doc.id.includes("clerk")) return "Auth";
  return doc.source === "cheshire-terminal-docs" ? "Cheshire" : "Snapshot";
}

export default function AgentsHubPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState<"all" | "featured" | "oneShot" | "ready">("all");

  const { data, isLoading } = useQuery<StarterCatalogResponse>({
    queryKey: ["/api/clawd/browser-agents"],
  });

  const agents = data?.agents ?? [];
  const docs = data?.docs ?? [];
  const projects = data?.projects ?? [];
  const skills = data?.skills ?? [];
  const roots = data?.integration?.roots ?? [];
  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(agents.map((agent) => agent.category))).sort()];
  }, [agents]);

  const runbooks = useMemo(() => {
    const byId = new Map(docs.map((doc) => [doc.id, doc]));
    const ordered = docPriority.map((id) => byId.get(id)).filter(Boolean) as HubDoc[];
    const remaining = docs.filter((doc) => !docPriority.includes(doc.id)).slice(0, 4);
    return [...ordered, ...remaining].slice(0, 10);
  }, [docs]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return agents.filter((agent) => {
      if (category !== "all" && agent.category !== category) return false;
      if (mode === "featured" && !agent.featured) return false;
      if (mode === "oneShot" && !agent.oneShot) return false;
      if (mode === "ready" && agent.runtimeProfile?.status !== "ready") return false;
      if (!term) return true;

      return [
        agent.title,
        agent.description,
        agent.id,
        agent.category,
        agent.recommendation?.runtime ?? "",
        agent.recommendation?.provider ?? "",
        agent.recommendation?.model ?? "",
        ...(agent.tags ?? []),
        ...(agent.capabilities ?? []),
        ...(agent.metaplexSkills ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [agents, category, mode, query]);

  const totalAgents = data?.catalogMeta?.stats?.totalAgents ?? data?.count ?? agents.length;
  const readyCount = agents.filter((agent) => agent.runtimeProfile?.status === "ready").length;
  const featuredCount = agents.filter((agent) => agent.featured).length;
  const presentRootCount = roots.filter((root) => root.present).length;
  const spotlight = filtered.filter((agent) => agent.featured).slice(0, 4);
  const visibleSpotlight = spotlight.length ? spotlight : filtered.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:px-6">
        <section className="border-b border-white/10 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                  <Sparkles className="h-3 w-3" />
                  Cheshire Terminal
                </Badge>
                <Badge variant="outline" className="border-white/15 text-white/65">
                  /agents
                </Badge>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-200/80">
                  {formatNumber(totalAgents)} agents
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
                Agents Hub
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link href="/agents/builder">
                <Button className="w-full bg-cyan-400 text-black hover:bg-cyan-300 sm:w-auto">
                  <Wrench className="h-4 w-4" />
                  Builder
                </Button>
              </Link>
              <Link href="/metaplex-agents">
                <Button variant="outline" className="w-full border-amber-500/30 text-amber-100 hover:bg-amber-500/10 sm:w-auto">
                  <Landmark className="h-4 w-4" />
                  Mint
                </Button>
              </Link>
              <Link href="/agents/runtime">
                <Button variant="outline" className="w-full border-white/10 text-white/75 hover:bg-white/5 sm:w-auto">
                  <Layers3 className="h-4 w-4" />
                  Runtime
                </Button>
              </Link>
              <Link href="/arena">
                <Button variant="outline" className="w-full border-rose-500/30 text-rose-100 hover:bg-rose-500/10 sm:w-auto">
                  <PlayCircle className="h-4 w-4" />
                  Arena
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Imported", value: formatNumber(totalAgents), icon: Bot, tone: "text-cyan-200" },
            { label: "Runtime ready", value: formatNumber(readyCount), icon: BadgeCheck, tone: "text-emerald-200" },
            { label: "Featured", value: formatNumber(featuredCount), icon: Flame, tone: "text-amber-200" },
            { label: "Runbooks", value: formatNumber(runbooks.length), icon: FileText, tone: "text-rose-200" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-normal text-white/45">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.tone}`} />
                </div>
                <div className="mt-2 text-2xl font-black text-white">{stat.value}</div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search agents, capabilities, tags"
                    className="h-10 border-white/10 bg-black/40 pl-9 text-white placeholder:text-white/35"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  {[
                    ["all", "All"],
                    ["featured", "Featured"],
                    ["oneShot", "One-shot"],
                    ["ready", "Ready"],
                  ].map(([value, label]) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setMode(value as typeof mode)}
                      className={
                        mode === value
                          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                          : "border-white/10 text-white/65 hover:bg-white/5"
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {categories.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCategory(value)}
                    className={
                      value === category
                        ? "shrink-0 border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                        : "shrink-0 border-white/10 text-white/65 hover:bg-white/5"
                    }
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>

            {visibleSpotlight.length > 0 && (
              <div className="grid gap-3 lg:grid-cols-2">
                {visibleSpotlight.map((agent) => (
                  <AgentRow key={agent.id} agent={agent} prominent />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Bot className="h-4 w-4 text-cyan-200" />
                Catalog
              </div>
              <div className="text-xs text-white/45">
                {isLoading ? "Loading..." : `${formatNumber(filtered.length)} shown`}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((agent) => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
            </div>

            {!isLoading && filtered.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-white/55">
                No agents match the current filters.
              </div>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
                  <FileText className="h-4 w-4 text-amber-200" />
                  Runbooks
                </div>
                <Badge variant="outline" className="border-white/10 text-white/55">
                  docs/
                </Badge>
              </div>
              <div className="space-y-3">
                {runbooks.map((doc) => (
                  <div key={doc.id} className="rounded-md border border-white/10 bg-black/35 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold leading-snug text-white">{doc.title}</div>
                      <Badge variant="outline" className="shrink-0 border-white/10 text-[10px] text-white/55">
                        {docKicker(doc)}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs leading-5 text-white/58">
                      {doc.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/85">
                <Boxes className="h-4 w-4 text-emerald-200" />
                Snapshot
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Metric label="Files" value={data?.integration?.manifest?.textFiles ?? 0} />
                <Metric label="Rewrites" value={data?.integration?.manifest?.rewrittenFiles ?? 0} />
                <Metric label="Binary" value={data?.integration?.manifest?.binaryFiles ?? 0} />
                <Metric label="Roots" value={`${presentRootCount}/${roots.length}`} />
              </div>
              {data?.integration?.manifest?.skippedSecrets?.length ? (
                <div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-100">
                  {data.integration.manifest.skippedSecrets.length} secret files skipped during import.
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/85">
                <Activity className="h-4 w-4 text-rose-200" />
                Surfaces
              </div>
              <div className="space-y-3">
                {projects.slice(0, 6).map((project) => (
                  <div key={project.id} className="rounded-md border border-white/10 bg-black/35 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white">{project.title}</span>
                      <Badge variant="outline" className="border-white/10 text-[10px] text-white/55">
                        {project.kind}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-white/40">{project.id}</div>
                  </div>
                ))}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.slice(0, 10).map((skill) => (
                      <Badge key={skill.id} variant="outline" className="border-cyan-500/20 text-cyan-100/75">
                        {skill.id}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-3">
      <div className="text-xs text-white/40">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
    </div>
  );
}

function AgentRow({ agent, prominent = false }: { agent: StarterAgent; prominent?: boolean }) {
  const meta = categoryMeta[agent.category] ?? {
    icon: Bot,
    className: "border-white/10 text-white/70 bg-white/5",
  };
  const CategoryIcon = meta.icon;
  const visibleCapabilities = (agent.capabilities ?? []).slice(0, prominent ? 5 : 3);
  const docs = agent.recommendation?.recommendedDocs ?? [];

  return (
    <Card className={`border-white/10 bg-white/[0.035] ${prominent ? "min-h-[18rem]" : "min-h-[19rem]"}`}>
      <CardContent className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/40 text-xl">
              {agent.avatar}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold leading-tight text-white">{agent.title}</h2>
              <div className="mt-1 truncate text-[11px] text-white/40">{agent.id}</div>
            </div>
          </div>
          <Badge className={meta.className}>
            <CategoryIcon className="h-3 w-3" />
            {agent.category}
          </Badge>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-white/66">{agent.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {agent.featured && (
            <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-100">featured</Badge>
          )}
          {agent.oneShot && (
            <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100">one-shot</Badge>
          )}
          {agent.runtimeProfile?.status && (
            <Badge
              variant="outline"
              className={
                agent.runtimeProfile.status === "ready"
                  ? "border-emerald-500/20 text-emerald-100/80"
                  : "border-amber-500/20 text-amber-100/80"
              }
            >
              {agent.runtimeProfile.status}
            </Badge>
          )}
          {agent.recommendation?.runtime && (
            <Badge variant="outline" className="border-cyan-500/20 text-cyan-100/75">
              {agent.recommendation.runtime}
            </Badge>
          )}
        </div>

        <div className="min-h-[2rem]">
          <div className="flex flex-wrap gap-1.5">
            {visibleCapabilities.map((capability) => (
              <Badge key={capability} variant="outline" className="border-white/10 text-white/60">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        {prominent && docs.length > 0 && (
          <div className="rounded-md border border-white/10 bg-black/30 p-3 text-xs text-white/58">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-white/75">
              <FileText className="h-3.5 w-3.5 text-amber-200" />
              {docs.slice(0, 2).map((doc) => doc.title).join(" / ")}
            </div>
            <div>{agent.runtimeProfile?.summary ?? agent.recommendation?.model ?? "Ready for Cheshire deployment."}</div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <Link href={`/agents/${encodeURIComponent(agent.id)}`}>
            <Button size="sm" variant="outline" className="border-white/10 text-white/75 hover:bg-white/5">
              Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/agents/chat?agent=${encodeURIComponent(agent.id)}`}>
            <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10">
              <Terminal className="h-4 w-4" />
              Chat
            </Button>
          </Link>
          <Link href={`/agents/builder?starter=${encodeURIComponent(agent.id)}`}>
            <Button size="sm" className="bg-emerald-400 text-black hover:bg-emerald-300">
              Build
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
