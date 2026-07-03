import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { printSection, printOk, printInfo } from "../banner.js";
function goalsDir() {
    const thisFile = fileURLToPath(import.meta.url);
    const cliRoot = join(dirname(thisFile), "../..");
    const repoGoals = join(cliRoot, "../../goals");
    if (existsSync(repoGoals))
        return repoGoals;
    return join(homedir(), ".openclawd", "goals");
}
function loadGoals() {
    const dir = goalsDir();
    if (!existsSync(dir))
        return [];
    return readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => {
        try {
            return JSON.parse(readFileSync(join(dir, f), "utf-8"));
        }
        catch {
            return null;
        }
    })
        .filter((g) => g !== null);
}
function saveGoal(goal) {
    const dir = goalsDir();
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${goal.id}.json`), JSON.stringify(goal, null, 2) + "\n");
}
function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}`;
}
export function runGoalCreate(opts) {
    const symbol = (opts.symbol ?? "SOL").toUpperCase();
    const side = (opts.side ?? "long");
    const notional = opts.notional ? Number(opts.notional) : 100;
    const leverage = opts.leverage ? Number(opts.leverage) : 1;
    const skill = opts.category === "spot" ? "spot" : "perps";
    const priority = (opts.priority ?? "medium");
    const goal = {
        id: makeId(skill),
        active: true,
        priority,
        title: `${side?.toUpperCase()} ${symbol} — $${notional} ${skill}`,
        body: [
            `Signal: ${side} ${symbol} @ $${notional} notional, ${leverage}x leverage`,
            `Skill: ${skill}`,
            `Safety: paper mode until LIVE_TRADING=true + OPERATOR_CONFIRMED=true`,
            `Endpoint: https://x402.wtf/api/perps/v1`,
        ].join("\n"),
        skill,
        symbol,
        side,
        notionalUsd: notional,
        leverage,
        targetPrice: opts.target ? Number(opts.target) : undefined,
        createdAt: new Date().toISOString(),
    };
    saveGoal(goal);
    printOk(`Goal created: ${goal.id}`);
    printInfo(`Title: ${goal.title}`);
    printInfo(`Priority: ${goal.priority}`);
    printInfo(`Stored at: ${join(goalsDir(), `${goal.id}.json`)}`);
    console.error("\n  Execute:");
    console.error(`    clawd-agents ${skill === "spot" ? "spot" : side} ${symbol} --notional ${notional}${leverage > 1 ? ` --leverage ${leverage}` : ""}`);
}
export function runGoalList(opts) {
    const goals = loadGoals().filter((g) => !opts.active || g.active);
    if (opts.json) {
        console.log(JSON.stringify(goals, null, 2));
        return;
    }
    if (goals.length === 0) {
        printInfo("No goals found. Create one: clawd-agents goals create --symbol SOL --side long");
        return;
    }
    printSection(`Goals (${goals.length})`);
    for (const g of goals.sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
        const status = g.active ? "●" : "○";
        const pri = g.priority === "high" ? "▲" : g.priority === "low" ? "▼" : "─";
        console.error(`  ${status} ${pri} [${g.id}] ${g.title}`);
    }
}
export function runGoalStatus(id, opts) {
    const goals = loadGoals();
    const goal = goals.find((g) => g.id === id || g.id.startsWith(id));
    if (!goal) {
        throw new Error(`Goal '${id}' not found. Run: clawd-agents goals list`);
    }
    if (opts.json) {
        console.log(JSON.stringify(goal, null, 2));
        return;
    }
    printSection(`Goal: ${goal.title}`);
    console.error(`\n  ID:       ${goal.id}`);
    console.error(`  Active:   ${goal.active}`);
    console.error(`  Priority: ${goal.priority}`);
    console.error(`  Skill:    ${goal.skill}`);
    if (goal.symbol)
        console.error(`  Symbol:   ${goal.symbol}`);
    if (goal.side)
        console.error(`  Side:     ${goal.side}`);
    if (goal.notionalUsd)
        console.error(`  Notional: $${goal.notionalUsd}`);
    if (goal.leverage && goal.leverage > 1)
        console.error(`  Leverage: ${goal.leverage}x`);
    if (goal.targetPrice)
        console.error(`  Target:   $${goal.targetPrice}`);
    console.error(`  Created:  ${goal.createdAt}`);
    console.error(`\n  Body:\n    ${goal.body.replace(/\n/g, "\n    ")}`);
}
export function runGoalComplete(id) {
    const goals = loadGoals();
    const goal = goals.find((g) => g.id === id || g.id.startsWith(id));
    if (!goal)
        throw new Error(`Goal '${id}' not found.`);
    goal.active = false;
    goal.completedAt = new Date().toISOString();
    saveGoal(goal);
    printOk(`Goal completed: ${goal.id}`);
}
//# sourceMappingURL=goals.js.map