import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Activity,
  Zap,
  Lock,
  Globe,
  ChevronRight,
  Command,
  Play,
} from "lucide-react";
import heroOrb from "@/assets/hero-orb.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const LOGS = [
  { t: "14:22:01", tag: "ORCHESTRATOR", msg: "Deploying 12 agent clusters", tone: "primary" },
  { t: "14:22:04", tag: "SCANNER_α", msg: "Mapping /api/v1/auth surface", tone: "muted" },
  { t: "14:22:09", tag: "THREAT", msg: "SQL injection vector @/users/find", tone: "danger" },
  { t: "14:22:14", tag: "REMEDIATOR", msg: "Patch synthesized — parameterized query", tone: "success" },
  { t: "14:22:19", tag: "REPORTER", msg: "Executive summary draft ready", tone: "primary" },
];

function Index() {
  const [logIdx, setLogIdx] = useState(2);
  useEffect(() => {
    const id = setInterval(() => setLogIdx((i) => (i + 1) % LOGS.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <a href="#" className="flex items-center gap-2">
              <div className="relative grid size-8 place-items-center rounded-xl bg-[var(--ink)] text-[var(--ink-foreground)]">
                <ShieldCheck className="size-4" />
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--success)] ring-2 ring-background" />
              </div>
              <span className="font-display text-[17px] font-bold tracking-tight">Sentinel<span className="text-muted-foreground font-medium">.ai</span></span>
            </a>
            <nav className="hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
              <a href="#platform" className="transition-colors hover:text-foreground">Platform</a>
              <a href="#agents" className="transition-colors hover:text-foreground">Agents</a>
              <a href="#dashboard" className="transition-colors hover:text-foreground">Dashboard</a>
              <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block">Sign in</button>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--ink-foreground)] shadow-soft transition-transform hover:scale-[1.02]">
              Launch console <ArrowUpRight className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6">
        {/* HERO */}
        <section className="grid grid-cols-12 gap-4 pt-10 pb-6">
          {/* Eyebrow + Title spans full */}
          <div className="col-span-12 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[var(--success)]" />
                <span className="relative size-1.5 rounded-full bg-[var(--success)]" />
              </span>
              Autonomous agent network online · 48 clusters
            </div>
            <h1 className="font-display mt-6 max-w-4xl text-balance text-[44px] font-bold leading-[1.02] tracking-[-0.03em] md:text-[68px]">
              Security that thinks,<br />
              <span className="italic font-medium text-muted-foreground">defends, and</span>{" "}
              <span className="relative inline-block">
                <span className="relative z-10">heals itself.</span>
                <span className="absolute inset-x-1 bottom-1 -z-0 h-3 rounded-md bg-[var(--lilac)]" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
              Sentinel deploys a swarm of AI agents that audit your stack, detect vulnerabilities, and ship remediation in real time — without a SOC team.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.52_0.22_280/0.5)] transition-transform hover:scale-[1.02]">
                <Sparkles className="size-4" /> Start a deep scan
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-secondary">
                <Play className="size-3.5 fill-current" /> Watch 90s demo
              </button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <Lock className="size-3" /> SOC 2 · ISO 27001 · GDPR · HIPAA
            </div>
          </div>
        </section>

        {/* BENTO DASHBOARD */}
        <section id="dashboard" className="grid grid-cols-12 gap-4 pb-12">
          {/* Hero visual card with orb */}
          <div className="col-span-12 md:col-span-7 relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[var(--lilac)] via-card to-card p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Overview</p>
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">SENTINEL CORE</h2>
              </div>
              <div className="flex -space-x-2">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="size-8 rounded-full border-2 border-card bg-gradient-to-br from-primary/40 to-[var(--peach)]" />
                ))}
              </div>
            </div>
            <div className="relative mt-4 grid place-items-center">
              <img
                src={heroOrb}
                alt="Sentinel AI core agent visualization"
                width={1280}
                height={960}
                className="h-[280px] w-auto animate-float-slow object-contain md:h-[340px]"
              />
              {/* Floating callouts */}
              <div className="pointer-events-none absolute left-4 top-8 hidden rounded-xl border border-border bg-card/90 px-3 py-2 text-xs shadow-soft backdrop-blur md:block">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Threats deflected</div>
                <div className="font-display text-lg font-bold">1,284</div>
              </div>
              <div className="pointer-events-none absolute right-4 bottom-8 hidden rounded-xl border border-border bg-card/90 px-3 py-2 text-xs shadow-soft backdrop-blur md:block">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Risk index</div>
                <div className="font-display text-lg font-bold text-[var(--success)]">0.12 ↓</div>
              </div>
            </div>
          </div>

          {/* Dark "Cleaning Service ACTIVE" style hero stat */}
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 group relative overflow-hidden rounded-3xl bg-[var(--ink)] p-6 text-[var(--ink-foreground)] shadow-card">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/30 blur-3xl" />
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium opacity-70">Live Sweep</span>
                <ArrowUpRight className="size-5 opacity-70 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div className="mt-12 flex items-end justify-between">
                <div>
                  <div className="font-display text-3xl font-bold tracking-tight">ACTIVE</div>
                  <div className="mt-1 text-xs opacity-60">Next agent dispatch · 00:02</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest">
                  <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" /> sweeping
                </div>
              </div>
            </div>

            {/* Agents */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="size-3.5" /> Agents
              </div>
              <div className="mt-4 font-display text-3xl font-bold">48<span className="text-base text-muted-foreground"> / 60</span></div>
              <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-4/5 rounded-full bg-primary" />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">4 regions · self-balancing</div>
            </div>

            {/* Coverage */}
            <div className="rounded-3xl border border-border bg-[var(--mint)]/40 p-5 shadow-soft">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="size-3.5" /> Coverage
              </div>
              <div className="mt-4 font-display text-3xl font-bold">99.97%</div>
              <div className="mt-1 text-[11px] text-muted-foreground">148 endpoints monitored</div>
            </div>
          </div>

          {/* Live Agent Pipeline (full row) */}
          <div className="col-span-12 lg:col-span-8 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="size-2 rounded-full bg-[var(--danger)]/40" />
                  <span className="size-2 rounded-full bg-[var(--warning)]/50" />
                  <span className="size-2 rounded-full bg-[var(--success)]/60" />
                </div>
                <span className="ml-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">live_pipeline.exec</span>
              </div>
              <span className="font-mono text-[10px] text-[var(--success)]">● STREAMING · 224 tps</span>
            </div>
            <div className="grid grid-cols-12 gap-0">
              {/* Agent graph */}
              <div className="relative col-span-12 min-h-[280px] border-b border-border bg-[radial-gradient(circle_at_1px_1px,oklch(0.85_0.02_280)_1px,transparent_0)] [background-size:22px_22px] p-6 md:col-span-7 md:border-b-0 md:border-r">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <div className="grid h-full grid-cols-5 items-center">
                  {(["Input", "Orchestrator", "Scanner", "Remediator", "Report"] as const).map((label, i) => (
                    <div key={label} className="relative flex flex-col items-center gap-2">
                      <div className={`relative grid size-12 place-items-center rounded-2xl border ${i === 2 ? "border-primary/40 bg-primary/10" : "border-border bg-card"} shadow-soft`}>
                        {i === 0 && <Globe className="size-5" />}
                        {i === 1 && <Command className="size-5" />}
                        {i === 2 && <Zap className="size-5 text-primary" />}
                        {i === 3 && <Sparkles className="size-5" />}
                        {i === 4 && <Activity className="size-5" />}
                        {i === 2 && <span className="absolute inset-0 animate-pulse-ring rounded-2xl border-2 border-primary/60" />}
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
                      {i < 4 && (
                        <div className="absolute top-6 left-[calc(50%+28px)] right-[calc(-50%+28px)] hidden h-px bg-gradient-to-r from-border via-primary/40 to-border md:block" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-border bg-card/80 px-3 py-2 backdrop-blur">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="font-mono">scanning</span>
                    <span className="text-muted-foreground">production-api-01</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">ETA 14m 22s</span>
                </div>
              </div>
              {/* Logs */}
              <div className="col-span-12 flex flex-col p-5 md:col-span-5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">System log</div>
                <div className="mt-3 flex-1 space-y-2.5 font-mono text-[11px]">
                  {LOGS.map((l, i) => {
                    const visible = i <= logIdx;
                    const toneClass =
                      l.tone === "danger" ? "text-[var(--danger)]"
                      : l.tone === "success" ? "text-[var(--success)]"
                      : l.tone === "primary" ? "text-primary"
                      : "text-muted-foreground";
                    return (
                      <div key={i} className={`flex gap-2 transition-opacity ${visible ? "opacity-100" : "opacity-20"}`} style={{ animation: visible ? "ticker .35s ease-out both" : undefined }}>
                        <span className="text-muted-foreground/60">{l.t}</span>
                        <span className={toneClass + " font-semibold"}>{l.tag}</span>
                        <span className="text-foreground/80">{l.msg}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Remediation card */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-[var(--lilac)] to-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
                <Sparkles className="size-3.5" /> AI Remediation
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                Agent <span className="font-mono font-semibold text-primary">ALPHA-4</span> drafted a parameterized query patch for <code className="rounded bg-card px-1 py-0.5 text-[11px]">/api/users/find</code>.
              </p>
              <pre className="mt-3 overflow-hidden rounded-xl border border-border bg-card p-3 font-mono text-[10px] leading-relaxed">
<span className="text-[var(--danger)]">- db.exec(`SELECT * FROM users WHERE id=${'${id}'}`)</span>{"\n"}
<span className="text-[var(--success)]">+ db.exec("SELECT * FROM users WHERE id=?", [id])</span>
              </pre>
              <button className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01]">
                Deploy patch <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="rounded-3xl border border-border bg-[var(--peach)]/40 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Detected vulns</div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { sev: "Critical", label: "SQL injection · /users/find", tone: "danger" },
                  { sev: "High", label: "Broken auth · /checkout", tone: "warning" },
                  { sev: "Medium", label: "Exposed .env · /static", tone: "muted" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center justify-between rounded-xl bg-card/80 px-3 py-2 text-xs backdrop-blur">
                    <span className="truncate">{v.label}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        v.tone === "danger" ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                        : v.tone === "warning" ? "bg-[var(--warning)]/20 text-[oklch(0.45_0.14_70)]"
                        : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {v.sev}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AGENTS SECTION */}
        <section id="agents" className="py-20">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">The Swarm</p>
              <h2 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Five autonomous agents.<br />
                <span className="italic font-medium text-muted-foreground">One mission.</span>
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Each agent owns a slice of the security loop. The orchestrator routes work, agents collaborate, results stream into your dashboard in real time.
              </p>
            </div>
            <div className="col-span-12 grid grid-cols-1 gap-3 md:col-span-7 sm:grid-cols-2">
              {[
                { icon: Command, name: "Orchestrator", desc: "Routes tasks across the swarm with token-aware scheduling.", color: "var(--lilac)" },
                { icon: Zap, name: "Scanner α", desc: "Probes endpoints, headers, dependencies, and auth flows.", color: "var(--mint)" },
                { icon: Activity, name: "Risk Analyst", desc: "Scores severity, exploitability, and business impact.", color: "var(--peach)" },
                { icon: Sparkles, name: "Remediator", desc: "Synthesizes code patches and config fixes you can ship.", color: "var(--lilac)" },
              ].map((a) => (
                <div key={a.name} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                  <div className="grid size-10 place-items-center rounded-xl" style={{ backgroundColor: a.color }}>
                    <a.icon className="size-5 text-foreground" />
                  </div>
                  <div className="mt-4 font-display text-lg font-bold tracking-tight">{a.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-12">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card md:p-12">
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[var(--lilac)] blur-3xl opacity-60" />
            <div className="relative grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-6">
                <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Fair pricing.<br /> Pay per endpoint.
                </h2>
                <p className="mt-4 max-w-md text-muted-foreground">Scan unlimited times. Only pay for the surface you actually monitor.</p>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="rounded-2xl border border-border bg-background p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Starter</div>
                      <div className="font-display text-4xl font-bold">$9<span className="text-base font-medium text-muted-foreground"> / endpoint / mo</span></div>
                    </div>
                    <div className="rounded-full bg-[var(--mint)]/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">14-day trial</div>
                  </div>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--success)]" /> All 5 autonomous agents</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--success)]" /> Realtime remediation patches</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--success)]" /> SOC 2 audit reports</li>
                  </ul>
                  <button className="mt-6 w-full rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-[var(--ink-foreground)] shadow-soft transition-transform hover:scale-[1.01]">
                    Start free trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-12 max-w-7xl border-t border-border px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-[var(--ink)] text-[var(--ink-foreground)]">
              <ShieldCheck className="size-3" />
            </div>
            <span className="font-display font-bold text-foreground">Sentinel.ai</span>
            <span className="opacity-50">— autonomous security intelligence</span>
          </div>
          <div className="flex gap-6 text-xs font-mono uppercase tracking-widest">
            <a href="#" className="hover:text-foreground">Security</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
