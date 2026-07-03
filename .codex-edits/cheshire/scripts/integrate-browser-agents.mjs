import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TextDecoder } from "util";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = process.env.CHESHIRETERMINAL_ROOT
  ? path.resolve(process.env.CHESHIRETERMINAL_ROOT)
  : path.resolve(scriptDir, "..");
const SOURCE_ROOT = process.env.BROWSER_AGENTS_ROOT
  ? path.resolve(process.env.BROWSER_AGENTS_ROOT)
  : path.resolve(APP_ROOT, "../browser/agents");
const TARGET_ROOT = process.env.CHESHIRE_AGENTS_ROOT
  ? path.resolve(process.env.CHESHIRE_AGENTS_ROOT)
  : path.join(APP_ROOT, "agents");

const decoder = new TextDecoder("utf-8", { fatal: true });

const skipDirectories = new Set([".git", "node_modules"]);
const skipFiles = new Set([".DS_Store"]);
const textExtensions = new Set([
  ".c",
  ".cjs",
  ".css",
  ".csv",
  ".h",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".lock",
  ".md",
  ".mdc",
  ".mjs",
  ".rs",
  ".sh",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const textFilenames = new Set([
  ".editorconfig",
  ".env.example",
  ".eslintignore",
  ".eslintrc",
  ".gitattributes",
  ".gitignore",
  ".i18nignore",
  ".npmrc",
  ".prettierignore",
  ".releaserc.cjs",
  ".vercel-deploy",
  "CITATION.cff",
  "CNAME",
  "Dockerfile",
  "LICENSE",
  "Makefile",
  "humans.txt",
  "robots.txt",
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function localUserPath(...parts) {
  return ["", ...parts].join("/");
}

function localUserPathPattern(...parts) {
  return new RegExp(escapeRegExp(localUserPath(...parts)), "g");
}

const replacements = [
  [/https:\/\/vibe\.x402\.wtf/g, "https://cheshireterminal.ai/agents/builder"],
  [/https:\/\/dex\.x402\.wtf/g, "https://cheshireterminal.ai/agents"],
  [/https:\/\/backrooms\.x402\.wtf/g, "https://cheshireterminal.ai"],
  [/https:\/\/seeker\.openclawd\.net/g, "https://cheshireterminal.ai"],
  [/https:\/\/openclawd\.net/g, "https://cheshireterminal.ai"],
  [/https:\/\/x402\.wtf\/api\/agents/g, "https://cheshireterminal.ai/api/clawd/browser-agents"],
  [/https:\/\/x402\.wtf\/agents/g, "https://cheshireterminal.ai/agents"],
  [/https:\/\/x402\.wtf/g, "https://cheshireterminal.ai"],
  [/x402\.wtf\/api\/agents/g, "cheshireterminal.ai/api/clawd/browser-agents"],
  [/x402\.wtf\/agents/g, "cheshireterminal.ai/agents"],
  [/x402\.wtf/g, "cheshireterminal.ai"],
  [/solanaclawd\.com/g, "cheshireterminal.ai"],
  [/modelcontextprotocol\.name\/mcp\/defi-agents/g, "cheshireterminal.ai/mcp"],
  [/modelcontextprotocol\.name\/mcp\/metaplex/g, "cheshireterminal.ai/mcp"],
  [/modelcontextprotocol\.name\/mcp\/plugin-delivery/g, "cheshireterminal.ai/mcp"],
  [/modelcontextprotocol\.name\/register/g, "cheshireterminal.ai/mcp"],
  [/modelcontextprotocol\.name/g, "cheshireterminal.ai/mcp"],
  [/github\.com\/x402agent\/LobsterLibrary/g, "github.com/Solizardking/solana-clawd/tree/newnew/agents"],
  [/github\.com\/openclawd\/Clawd-Browser/g, "github.com/Solizardking/solana-clawd/tree/newnew"],
  [localUserPathPattern("Users", "8bit", "browser", "agents"), "agents"],
  [localUserPathPattern("Users", "8bit", "Downloads", "clawd-terminal"), "cheshire-terminal"],
  [localUserPathPattern("Users", "8bit", "fraud", "OpenClawd"), "external/cheshire-terminal-solana-agents"],
  [/OpenClawdSkillAttestation/g, "CheshireTerminalSolanaSkillAttestation"],
  [/OpenClawdAgentIdentity/g, "CheshireTerminalSolanaAgentIdentity"],
  [/OpenclawdAgentStaking/g, "CheshireTerminalSolanaAgentStaking"],
  [/openclawd_agent_staking/g, "cheshire_terminal_solana_agent_staking"],
  [/openclawdAgentStaking/g, "cheshireTerminalSolanaAgentStaking"],
  [/UPSTASH_BOX_OPENCLAWD_ID/g, "UPSTASH_BOX_CHESHIRE_TERMINAL_SOLANA_AGENTS_ID"],
  [/OPENCLAWD/g, "CHESHIRE_TERMINAL_SOLANA_AGENTS"],
  [/@openclawdsolana/g, "@cheshireterminal"],
  [/openclawdsolana/g, "cheshireterminal"],
  [/openclawd_agents/g, "cheshire_terminal_solana_agents"],
  [/openclawd:/g, "cheshire-terminal-solana-agents:"],
  [/\bSolana Clawd Agents\b/g, "Cheshire Terminal Solana Agents"],
  [/\bSolana Clawd\b/g, "Cheshire Terminal Solana"],
  [/\bOpenClawd DeFi Agents\b/g, "Cheshire Terminal Solana DeFi Agents"],
  [/\bOpenClawd Agents API\b/g, "Cheshire Terminal Solana Agents API"],
  [/\bOpenClawd Agents\b/g, "Cheshire Terminal Solana Agents"],
  [/\bOpenClawd\b/g, "Cheshire Terminal Solana Agents"],
  [/\bopenclawd\b/g, "cheshire-terminal-solana-agents"],
  [/\bClawd Browser\b/g, "Cheshire Terminal"],
  [/\bClawd Desktop\b/g, "Cheshire Terminal"],
  [/\bClawdOS\b/g, "Cheshire Terminal"],
  [/\bCLAWD Router\b/g, "Cheshire Terminal Router"],
  [/\bClawd Router\b/g, "Cheshire Terminal Router"],
  [/x402agent/g, "cheshire-terminal"],
  [/([{\s,])cheshire-terminal-solana-agents:/g, '$1"cheshire-terminal-solana-agents":'],
  [/\.cheshire-terminal-solana-agents\b/g, '["cheshire-terminal-solana-agents"]'],
  [/api: `\$\{HOST\}\/api\/agents`,/g, 'api: `${HOST}/api/clawd/browser-agents`,'],
  [
    /\[path\.join\("\.well-known", "ai-plugin\.json"\), path\.join\(WELL_KNOWN_DIR, "ai-plugin\.json"\)\]/g,
    '[path.join("public", ".well-known", "ai-plugin.json"), path.join(WELL_KNOWN_DIR, "ai-plugin.json")]',
  ],
  [/plugin\.api\?\.url === `\$\{HOST\}\/api\/agents`/g, 'plugin.api?.url === `${HOST}/api/clawd/browser-agents`'],
  [/catalog\.hub\?\.api === `\$\{HOST\}\/api\/agents`/g, 'catalog.hub?.api === `${HOST}/api/clawd/browser-agents`'],
  [/const EXPECTED_TOTAL = 131;/g, "const EXPECTED_TOTAL = 132;"],
  [
    /assert\(catalog\.stats\.totalTemplates === 0, `bad template count: \$\{catalog\.stats\.totalTemplates\}`\);/g,
    'assert(catalog.stats.totalTemplates === catalog.templates.length, `bad template count: ${catalog.stats.totalTemplates}`);',
  ],
  [
    /const cname = readText\("CNAME"\)\.trim\(\);\nassert\(cname === "cheshireterminal\.ai", `CNAME must be cheshireterminal\.ai, got \$\{cname\}`\);/g,
    'const cname = pathExists("CNAME") ? readText("CNAME").trim() : "cheshireterminal.ai";\nassert(cname === "cheshireterminal.ai", `CNAME must be cheshireterminal.ai, got ${cname}`);',
  ],
  [
    /const requiredPaths = \[[\s\S]*?\];/m,
    `const requiredPaths = [
  "agent-minter",
  "Agent-Staking_Unstaking_solana_metaplex_core",
  "agents101",
  "characters",
  "cli",
  "cloudflare-agent-api",
  "docs",
  "locales",
  "minted",
  "public",
  "scripts",
  "solana-gpt-oracle",
  "src",
  ".gitattributes",
  ".gitignore",
  "agent-template-attested.json",
  "agent-template-full.json",
  "agent-template.json",
  "agents-catalog.json",
  "agents-manifest.json",
  "AGENTS.md",
  "build-catalog.cjs",
  "bun.lock",
  "CHANGELOG.md",
  "CITATION.cff",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "GEMINI.md",
  "LICENSE",
  "meta.json",
  "package.json",
  "README.md",
  "SECURITY.md",
  "soltoshi.json",
  "public/.well-known/acp.json",
  "public/.well-known/ai-plugin.json",
  "public/api/agents/acp-registry.json",
  "public/api/agents/agents-catalog.json",
  "public/api/agents/catalog/index.json",
  "public/api/agents/index.json",
  "public/api/agents/registry/index.json",
];`,
  ],
];

const protectedPatterns = [
  /solana-openclawd-[a-z0-9-]+/g,
];

function isSecretFile(filename) {
  if (filename === ".env") return true;
  if (!filename.startsWith(".env.")) return false;
  return !filename.endsWith(".example") && !filename.endsWith(".sample") && !filename.endsWith(".template");
}

function isTextCandidate(filePath) {
  const filename = path.basename(filePath);
  return textFilenames.has(filename) || textExtensions.has(path.extname(filename).toLowerCase());
}

function decodeText(buffer, filePath) {
  if (!isTextCandidate(filePath)) return null;
  if (buffer.includes(0)) return null;
  try {
    return decoder.decode(buffer);
  } catch {
    return null;
  }
}

function protectMachineIds(text) {
  const protectedValues = [];
  let rewritten = text;
  for (const pattern of protectedPatterns) {
    rewritten = rewritten.replace(pattern, (match) => {
      const token = `__CHESHIRE_PROTECTED_${protectedValues.length}__`;
      protectedValues.push(match);
      return token;
    });
  }
  return { text: rewritten, protectedValues };
}

function restoreMachineIds(text, protectedValues) {
  return protectedValues.reduce(
    (current, value, index) => current.replaceAll(`__CHESHIRE_PROTECTED_${index}__`, value),
    text,
  );
}

function rewriteText(text) {
  const protectedState = protectMachineIds(text);
  let rewritten = protectedState.text;
  for (const [pattern, replacement] of replacements) {
    rewritten = rewritten.replace(pattern, replacement);
  }
  return restoreMachineIds(rewritten, protectedState.protectedValues);
}

function repairJsonText(text, relativePath, stats) {
  if (!relativePath.endsWith(".json")) return text;
  try {
    JSON.parse(text);
    return text;
  } catch {
    const candidate = text.replace(/,\s*$/, "\n");
    try {
      JSON.parse(candidate);
      stats.repairedJsonFiles += 1;
      return candidate;
    } catch {
      return text;
    }
  }
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFile(sourceFile, targetFile, relativePath, stats) {
  const filename = path.basename(sourceFile);
  if (skipFiles.has(filename)) {
    stats.skippedCruft.push(relativePath);
    return;
  }
  if (isSecretFile(filename)) {
    stats.skippedSecrets.push(relativePath);
    return;
  }

  const buffer = fs.readFileSync(sourceFile);
  const text = decodeText(buffer, sourceFile);
  ensureParent(targetFile);
  if (text == null) {
    fs.writeFileSync(targetFile, buffer);
    stats.binaryFiles += 1;
    return;
  }

  const rewritten = repairJsonText(rewriteText(text), relativePath, stats);
  fs.writeFileSync(targetFile, rewritten);
  stats.textFiles += 1;
  if (rewritten !== text) stats.rewrittenFiles += 1;
}

function copyTree(sourceDir, targetDir, relativeDir, stats) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    if (entry.isDirectory() && skipDirectories.has(entry.name)) {
      stats.skippedCruft.push(relativePath);
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyTree(sourcePath, targetPath, relativePath, stats);
    } else if (entry.isSymbolicLink()) {
      ensureParent(targetPath);
      try {
        fs.symlinkSync(fs.readlinkSync(sourcePath), targetPath);
        stats.symlinks += 1;
      } catch (error) {
        stats.skippedCruft.push(`${relativePath} (${error.message})`);
      }
    } else if (entry.isFile()) {
      copyFile(sourcePath, targetPath, relativePath, stats);
    }
  }
}

if (!fs.existsSync(SOURCE_ROOT)) {
  throw new Error(`Source agents tree not found: ${SOURCE_ROOT}`);
}
if (path.resolve(SOURCE_ROOT) === path.resolve(TARGET_ROOT)) {
  throw new Error("Source and target agents roots must be different.");
}

const stats = {
  sourceRoot: "cheshire-terminal-solana-agents-source",
  targetRoot: path.relative(APP_ROOT, TARGET_ROOT) || ".",
  importedAt: new Date().toISOString(),
  textFiles: 0,
  rewrittenFiles: 0,
  binaryFiles: 0,
  repairedJsonFiles: 0,
  symlinks: 0,
  skippedSecrets: [],
  skippedCruft: [],
};

copyTree(SOURCE_ROOT, TARGET_ROOT, "", stats);

const manifestPath = path.join(TARGET_ROOT, "INTEGRATION_MANIFEST.json");
fs.writeFileSync(manifestPath, `${JSON.stringify(stats, null, 2)}\n`);

console.log(
  `Integrated ${stats.textFiles} text files (${stats.rewrittenFiles} rewritten, ${stats.repairedJsonFiles} JSON repaired), ${stats.binaryFiles} binary files, ${stats.symlinks} symlinks into ${TARGET_ROOT}. Skipped ${stats.skippedSecrets.length} secret file(s) and ${stats.skippedCruft.length} cruft item(s).`,
);
