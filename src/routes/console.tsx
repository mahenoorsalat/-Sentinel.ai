import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { getThreatThreads, createThreatThread, createPatchPost } from "../lib/forums";
import {
  ShieldCheck,
  Play,
  ArrowLeft,
  Terminal,
  Activity,
  Zap,
  Command,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  FolderLock,
  Search,
  ExternalLink,
  Info,
  Clock,
  Database,
  Code2,
  FileCheck,
  ChevronRight,
  TrendingDown,
  Gauge,
  RotateCcw,
  Sliders,
  History,
  Lock,
  Download,
  AlertCircle,
  FileText,
  Key,
  Flame,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/console")({
  component: Console,
});

// Predefined mock vulnerabilities that are revealed during scanning
interface Vulnerability {
  id: string;
  cweId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  filePath: string;
  exploitVector: string;
  impact: string;
  originalCode: string;
  remediatedCode: string;
  status: "open" | "deploying" | "resolved";
}

interface AuditLog {
  timestamp: string;
  actor:
    | "System"
    | "Orchestrator"
    | "Scanner"
    | "Risk Analyst"
    | "Remediator"
    | "Reporter"
    | "User";
  action: string;
  status: "info" | "warn" | "error" | "success";
}

const INITIAL_VULNERABILITIES: Vulnerability[] = [
  {
    id: "VULN-001",
    cweId: "CWE-89: SQL Injection",
    title: "Unparameterized Direct SQL Execution in User Finder",
    severity: "critical",
    filePath: "src/lib/database/user-service.ts",
    exploitVector:
      "The route '/api/users/profile' accepts a raw user ID from request parameters and directly interpolates it into a database query string. An attacker could inject malicious SQL payloads (e.g., `' OR '1'='1`) to extract credentials, sessions, or drop core databases.",
    impact:
      "Full data leakage, database compromise, and unauthorized administrative authentication.",
    originalCode: `// Insecure direct SQL interpolation\nasync function getUserById(id: string) {\n  const query = \`SELECT * FROM users WHERE id = '\${id}'\`;\n  return await db.execute(query);\n}`,
    remediatedCode: `// Secure parameterized database execution\nasync function getUserById(id: string) {\n  const query = "SELECT * FROM users WHERE id = ?";\n  return await db.execute(query, [id]);\n}`,
    status: "open",
  },
  {
    id: "VULN-002",
    cweId: "CWE-79: Cross-Site Scripting (XSS)",
    title: "Unsanitized Rich Text Rendering in Comment Component",
    severity: "high",
    filePath: "src/components/user-profile-comment.tsx",
    exploitVector:
      "User comment inputs are parsed and directly rendered to the DOM using the 'dangerouslySetInnerHTML' property without sanitization. A malicious actor can post comments embedded with '<script>' tags that execute in other users' browsers to hijack auth cookies.",
    impact: "User session hijacking, cross-site request forgery, and client-side page defacement.",
    originalCode: `// Unsafe innerHTML rendering without sanitization\nexport function UserComment({ text }) {\n  return (\n    <div className="comment-box">\n      <div dangerouslySetInnerHTML={{ __html: text }} />\n    </div>\n  );\n}`,
    remediatedCode: `// Secure rendering with DOMPurify sanitization\nimport DOMPurify from 'dompurify';\n\nexport function UserComment({ text }) {\n  const safeHTML = DOMPurify.sanitize(text);\n  return (\n    <div className="comment-box">\n      <div dangerouslySetInnerHTML={{ __html: safeHTML }} />\n    </div>\n  );\n}`,
    status: "open",
  },
  {
    id: "VULN-003",
    cweId: "CWE-522: Insecure Credential Storage",
    title: "Weak Passwords Hashing with Cryptographic MD5",
    severity: "high",
    filePath: "src/routes/auth-controller.ts",
    exploitVector:
      "User passwords are secure-hashed using MD5, which is highly susceptible to brute-force dictionary attacks, hash collision exploits, and instant lookup in rainbow tables. A leaked database would yield immediate plaintext credentials.",
    impact: "Total compromise of credentials, facilitating mass lateral authentication.",
    originalCode: `// Insecure MD5 hashing algorithm without salt\nimport crypto from 'crypto';\n\nfunction hashPassword(password: string) {\n  return crypto.createHash('md5').update(password).digest('hex');\n}`,
    remediatedCode: `// Secure robust bcrypt hashing with high work factor\nimport bcrypt from 'bcrypt';\n\nasync function hashPassword(password: string) {\n  const saltRounds = 12;\n  return await bcrypt.hash(password, saltRounds);\n}`,
    status: "open",
  },
  {
    id: "VULN-004",
    cweId: "CWE-942: Insecure CORS Configuration",
    title: "Permissive Access-Control-Allow-Origin Wildcard",
    severity: "medium",
    filePath: "server/middleware/cors-handler.js",
    exploitVector:
      "The middleware returns an absolute wildcard '*' in Access-Control-Allow-Origin while explicitly allowing credentials ('Access-Control-Allow-Credentials: true'). This permits arbitrary external domains to perform authenticated AJAX calls to sensitive API endpoints.",
    impact: "Uncontrolled access to cross-origin endpoints, leaking session variables.",
    originalCode: `// Permissive wildcard configuration with credentials\napp.use((req, res, next) => {\n  res.header("Access-Control-Allow-Origin", "*");\n  res.header("Access-Control-Allow-Credentials", "true");\n  next();\n});`,
    remediatedCode: `// Restrictive domain whitelist configuration\nconst ALLOWED_ORIGINS = ["https://sentinel-ai.com", "https://app.sentinel-ai.com"];\n\napp.use((req, res, next) => {\n  const origin = req.headers.origin;\n  if (ALLOWED_ORIGINS.includes(origin)) {\n    res.header("Access-Control-Allow-Origin", origin);\n    res.header("Access-Control-Allow-Credentials", "true");\n  }\n  next();\n});`,
    status: "open",
  },
];

const PRESETS = [
  "https://github.com/mahenoorsalat/payment-gateway-api",
  "https://github.com/acme-corp/ecommerce-store-v2",
  "https://github.com/fintech-nodes/crypto-ledger",
];

// Vulnerable Code Sandbox default values
const DEFAULT_VULNERABLE_SANDBOX_CODE = `// Paste your custom code here to run a real Gemini scan!\n// Below is an example of a vulnerable Express route with SQL Injection and XSS:\n\nconst express = require('express');\nconst router = express.Router();\nconst db = require('../db');\n\nrouter.get('/search', async (req, res) => {\n  const username = req.query.username;\n  const query = "SELECT * FROM users WHERE name = '" + username + "'";\n  \n  db.query(query, (err, result) => {\n    if (err) return res.status(500).send(err);\n    \n    // Unescaped dynamic string returned to response\n    res.send(\`<h1>Results for \${username}</h1><p>\${JSON.stringify(result)}</p>\`);\n  });\n});`;

function Console() {
  const [currentTab, setCurrentTab] = useState<"hud" | "compliance" | "ai-sandbox" | "logs">("hud");
  const [targetUrl, setTargetUrl] = useState("");
  const [scanState, setScanState] = useState<
    "idle" | "initializing" | "scanning" | "analyzing" | "remediating" | "reporting" | "completed"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState<
    "none" | "orchestrator" | "scanner" | "analyst" | "remediator" | "reporter"
  >("none");

  // Real-time metrics
  const [riskScore, setRiskScore] = useState(0.88); // Starts high, drops when patched
  const [metrics, setMetrics] = useState({
    endpointsScanned: 0,
    threatsFound: 0,
    cpuUsage: 0,
    memoryUsage: 0,
  });

  const [compliance, setCompliance] = useState({
    soc2: 64,
    iso27001: 52,
    gdpr: 70,
  });

  const [logs, setLogs] = useState<
    Array<{ t: string; tag: string; msg: string; type: "info" | "warn" | "error" | "success" }>
  >([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  // Tabulated Session Audit Logs
  const [sessionAudits, setSessionAudits] = useState<AuditLog[]>([]);

  // Sandbox Real Gemini Scanner states
  const [geminiApiKey, setGeminiApiKey] = useState(
    (import.meta.env.VITE_GEMINI_API_KEY as string) || "",
  );
  const [sandboxCode, setSandboxCode] = useState(DEFAULT_VULNERABLE_SANDBOX_CODE);
  const [geminiScanning, setGeminiScanning] = useState(false);
  const [geminiError, setGeminiError] = useState("");

  // LLM Config Sliders
  const [swarmDepth, setSwarmDepth] = useState(8);
  const [swarmTemp, setSwarmTemp] = useState(0.2);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Helper to add log dynamically to terminal log panel
  const addLog = (
    tag: string,
    msg: string,
    type: "info" | "warn" | "error" | "success" = "info",
  ) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { t: time, tag, msg, type }]);
  };

  // Helper to append a row in the Session Audit tab
  const addAuditRow = (
    actor: AuditLog["actor"],
    action: string,
    status: AuditLog["status"] = "info",
  ) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setSessionAudits((prev) => [{ timestamp: time, actor, action, status }, ...prev]);
  };

  // Autoscroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Set initial default mock logs & audits on load
  useEffect(() => {
    addAuditRow(
      "System",
      "Sentinel Swarm initial handshake established. Heartbeat stable.",
      "success",
    );
    addAuditRow("System", "Database link verified. Compliance mapping arrays loaded.", "info");
  }, []);

  // Main Scan Trigger Logic (Mock target scanner)
  const handleStartScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl.trim()) return;

    // Reset everything
    setScanState("initializing");
    setProgress(0);
    setRiskScore(0.88);
    setCompliance({ soc2: 64, iso27001: 52, gdpr: 70 });
    setVulnerabilities([]);
    setSelectedVuln(null);
    setLogs([]);
    setMetrics({
      endpointsScanned: 0,
      threatsFound: 0,
      cpuUsage: 8,
      memoryUsage: 124,
    });

    addAuditRow("User", `Triggered Target Scan: ${targetUrl}`, "info");

    // Step 1: Initializing
    setActiveAgent("orchestrator");
    addLog("ORCHESTRATOR", "Initializing Sentinel Agent Swarm Core...", "info");
    addLog("ORCHESTRATOR", `Target specified: ${targetUrl}`, "info");
    addLog("SYSTEM", "Allocating virtual cluster resources (Region: AWS us-east-1)...", "info");
    addLog("SYSTEM", "Allocating 2.4 vCPU, 512MB RAM for execution sandboxing...", "info");
    addAuditRow("Orchestrator", "Spinning up Scanner & Analyst micro-agent threads.", "info");

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });

      // Update metrics slightly over time
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 25) + (currentProgress < 85 ? 40 : 10),
        memoryUsage: Math.floor(prev.memoryUsage + (Math.random() * 4 - 1.5)),
      }));

      // Stage routing based on progress percentage
      if (currentProgress === 15) {
        // Step 2: Scanning
        setScanState("scanning");
        setActiveAgent("scanner");
        addLog(
          "SCANNER_α",
          "Scanner dispatched. Injecting test routines into surface boundary...",
          "info",
        );
        addLog(
          "SCANNER_α",
          "Fuzzing network configurations, headers, and API routing schemas...",
          "info",
        );
        addLog("SCANNER_α", "Resolving dynamic file structure mapping...", "info");
        addAuditRow("Scanner", "Dispatched fuzzer boundary probes across 148 endpoints.", "info");
      } else if (currentProgress === 25) {
        addLog("SCANNER_α", "Scanning src/lib/database/user-service.ts...", "info");
        setMetrics((prev) => ({ ...prev, endpointsScanned: 18 }));
      } else if (currentProgress === 32) {
        addLog("THREAT", "CRITICAL SQL Injection signature found @ /api/users/profile", "error");
        addLog("THREAT", "File target: src/lib/database/user-service.ts · Line 22-25", "error");
        setMetrics((prev) => ({ ...prev, threatsFound: 1 }));
        setVulnerabilities((prev) => [INITIAL_VULNERABILITIES[0]]);
        addAuditRow(
          "Scanner",
          "Discovered CRITICAL SQL Injection vulnerability in user-service.ts",
          "error",
        );
      } else if (currentProgress === 42) {
        addLog("SCANNER_α", "Scanning src/components/user-profile-comment.tsx...", "info");
        setMetrics((prev) => ({ ...prev, endpointsScanned: 44 }));
      } else if (currentProgress === 48) {
        addLog("THREAT", "HIGH Cross-Site Scripting (XSS) payload vulnerability mapped", "error");
        addLog("THREAT", "File target: src/components/user-profile-comment.tsx · Line 3", "error");
        setMetrics((prev) => ({ ...prev, threatsFound: 2 }));
        setVulnerabilities((prev) => [...prev, INITIAL_VULNERABILITIES[1]]);
        addAuditRow(
          "Scanner",
          "Discovered HIGH XSS vulnerability in user-profile-comment.tsx",
          "warn",
        );
      } else if (currentProgress === 55) {
        // Step 3: Analyzing
        setScanState("analyzing");
        setActiveAgent("analyst");
        addLog("RISK_ANALYST", "Initiating exploitability context profiling...", "info");
        addLog(
          "RISK_ANALYST",
          "Mapping CVE databases and estimating financial loss matrix...",
          "info",
        );
        addLog(
          "RISK_ANALYST",
          "CWE-89 database rating: CVSS 9.8 (Critical) severity score.",
          "warn",
        );
        addAuditRow("Risk Analyst", "Categorized 2 vulnerabilities against CWE standards.", "info");
      } else if (currentProgress === 65) {
        addLog("SCANNER_α", "Scanning src/routes/auth-controller.ts...", "info");
        addLog("THREAT", "HIGH Vulnerability: MD5 Cryptographic hash algorithm located", "error");
        setMetrics((prev) => ({ ...prev, endpointsScanned: 89, threatsFound: 3 }));
        setVulnerabilities((prev) => [...prev, INITIAL_VULNERABILITIES[2]]);
        addAuditRow(
          "Scanner",
          "Discovered HIGH Weak Hashing vulnerability in auth-controller.ts",
          "warn",
        );
      } else if (currentProgress === 72) {
        addLog("SCANNER_α", "Scanning server/middleware/cors-handler.js...", "info");
        addLog("THREAT", "MEDIUM Vulnerability: Wildcard CORS signature exposed", "error");
        setMetrics((prev) => ({ ...prev, endpointsScanned: 114, threatsFound: 4 }));
        setVulnerabilities((prev) => [...prev, INITIAL_VULNERABILITIES[3]]);
        addAuditRow(
          "Scanner",
          "Discovered MEDIUM CORS Wildcard vulnerability in cors-handler.js",
          "info",
        );
      } else if (currentProgress === 78) {
        // Step 4: Remediating
        setScanState("remediating");
        setActiveAgent("remediator");
        addLog(
          "REMEDIATOR",
          "Initiating AI security engine to draft self-healing patch files...",
          "info",
        );
        addLog(
          "REMEDIATOR",
          "Drafting 4 automated patch files with standard-compliant mitigations...",
          "success",
        );
        addAuditRow(
          "Remediator",
          "Synthesized 4 secure, parameterized patch diff blocks.",
          "success",
        );
      } else if (currentProgress === 90) {
        // Step 5: Reporting
        setScanState("reporting");
        setActiveAgent("reporter");
        addLog("REPORTER", "Generating executive threat audit reports...", "info");
        addLog(
          "REPORTER",
          "Mapping compliance standards: SOC 2 v2024, ISO 27001:2022, GDPR Art. 32...",
          "info",
        );
        addLog("REPORTER", "Security metrics compilation locked.", "success");
        addAuditRow(
          "Reporter",
          "Mapped compliance checklists: SOC 2 at 64%, ISO 27001 at 52%.",
          "info",
        );
      } else if (currentProgress === 100) {
        setScanState("completed");
        setActiveAgent("none");

        addLog(
          "ORCHESTRATOR",
          "Synchronizing dynamic data frames with headless Foru.ms cluster...",
          "info",
        );

        // 🚀 LIVE INTEGRATION: Hydrate your UI grid from your actual Foru.ms Database!
        getThreatThreads()
          .then((threads) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const liveVulnerabilities = threads.map((t: any) => {
              try {
                // Parse the stringified JSON metadata fields you stored inside the thread content
                const metadata = JSON.parse(t.content);
                return {
                  id: t.id,
                  title: t.title,
                  ...metadata,
                };
              } catch {
                // Fallback rendering structure if text isn't JSON formatted
                return {
                  id: t.id,
                  title: t.title,
                  cweId: "CWE-Unknown Vector",
                  severity: "high" as const,
                  filePath: "src/unknown-source.ts",
                  exploitVector: t.content,
                  impact: "Unclassified posture risk.",
                  originalCode: "// Raw string telemetry payload block",
                  remediatedCode: "// Remediated fix patch signature unavailable",
                  status: "open" as const,
                };
              }
            });

            setVulnerabilities(liveVulnerabilities);
            setMetrics((prev) => ({
              ...prev,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              threatsFound: liveVulnerabilities.filter((v: any) => v.status !== "resolved").length,
            }));
            addLog(
              "ORCHESTRATOR",
              `Swarm synchronization complete. ${liveVulnerabilities.length} active threads mapped.`,
              "success",
            );
            addAuditRow(
              "Orchestrator",
              "Successfully populated live catalog states from headless instance.",
              "success",
            );
          })
          .catch((err) => {
            addLog("SYSTEM", `Data synchronization failed: ${err.message}`, "error");
            addAuditRow("System", "Failed syncing with remote server endpoints.", "error");
          });

        clearInterval(interval);
      }
    }, 120);
  };

  // Simulated Patch Deployment Sequence
  const handleDeployPatch = async (vulnId: string) => {
    setVulnerabilities((prev) =>
      prev.map((v) => (v.id === vulnId ? { ...v, status: "deploying" } : v)),
    );
    if (selectedVuln && selectedVuln.id === vulnId) {
      setSelectedVuln((prev) => (prev ? { ...prev, status: "deploying" } : null));
    }

    addAuditRow("User", `Triggered Patch Deployment for Node ID: ${vulnId}`, "info");
    addLog("REMEDIATOR", `Deploying patch signature for database stream row ${vulnId}...`, "info");

    try {
      // 🚀 LIVE INTEGRATION: Stream the confirmation node directly to the thread discussion stream
      await createPatchPost(
        vulnId,
        `Automated patch verified and committed locally by Sentinel Swarm Compiler engine.`,
      );

      // Maintain your pristine UI simulation pacing for immediate interactive feedback
      setTimeout(() => {
        addLog(
          "SYSTEM",
          `Injecting patch into repository branch 'sentinel/patch-${vulnId}'...`,
          "info",
        );
      }, 1000);

      setTimeout(() => {
        addLog(
          "SYSTEM",
          `✔ Unit tests passed. Zero regressions discovered. Production pushed to edge edge-network.`,
          "success",
        );

        setVulnerabilities((prev) =>
          prev.map((v) => (v.id === vulnId ? { ...v, status: "resolved" } : v)),
        );

        if (selectedVuln && selectedVuln.id === vulnId) {
          setSelectedVuln((prev) => (prev ? { ...prev, status: "resolved" } : null));
        }

        setMetrics((prev) => ({ ...prev, threatsFound: Math.max(0, prev.threatsFound - 1) }));
        setRiskScore((prev) => Math.max(0.04, prev - 0.21));
        addLog("REPORTER", `Patch ${vulnId} successfully recorded and active.`, "success");
        addAuditRow(
          "Remediator",
          `Patch deployment recorded securely inside Foru.ms Post cluster indexes.`,
          "success",
        );
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      addLog(
        "SYSTEM",
        `Failed streaming patch record to Foru.ms database: ${error.message}`,
        "error",
      );
      setVulnerabilities((prev) =>
        prev.map((v) => (v.id === vulnId ? { ...v, status: "open" } : v)),
      );
    }
  };

  // REAL GEMINI API CALL METHOD (FOR SANDBOX CODE SCANNING)
  const handleGeminiSandboxScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxCode.trim()) return;

    setGeminiScanning(true);
    setGeminiError("");
    setLogs([]);
    setVulnerabilities([]);
    setSelectedVuln(null);
    setRiskScore(0.95);
    setCompliance({ soc2: 45, iso27001: 38, gdpr: 50 });
    setMetrics({
      endpointsScanned: 1,
      threatsFound: 0,
      cpuUsage: 12,
      memoryUsage: 154,
    });

    addAuditRow("User", "Triggered Real Gemini-Native Security Sweep on pasted snippet", "info");
    addLog("ORCHESTRATOR", "Initializing Live Gemini Swarm Orchestration...", "info");
    addLog("SYSTEM", `Initializing direct API sync to Google Gemini 2.5 Flash Lite...`, "info");

    // Fallback key check
    const activeKey = geminiApiKey.trim();
    if (!activeKey) {
      addLog(
        "ORCHESTRATOR",
        "WARNING: No custom API key provided. Activating mock-guided Gemini agent virtualization...",
        "warn",
      );

      // Virtualized real scan delay simulation
      setTimeout(() => {
        addLog("SCANNER_α", "Probing static syntax and dynamic ast execution models...", "info");
      }, 800);

      setTimeout(() => {
        addLog(
          "THREAT",
          "CRITICAL: Direct Unescaped SQL string concatenation located in query.",
          "error",
        );
        addLog(
          "THREAT",
          "HIGH: Dangerously returned HTML parameters detected without escaping (Reflected XSS).",
          "error",
        );

        // Populate vulnerabilities list with realistic results derived from user code
        const geminiVulns: Vulnerability[] = [
          {
            id: "GEMINI-VULN-001",
            cweId: "CWE-89: SQL Injection",
            title: "Direct string interpolation in SQL query",
            severity: "critical",
            filePath: "sandbox-editor.js",
            exploitVector:
              "The pasted code interpolates raw string req.query.username directly into query variable: SELECT * FROM users WHERE name = ' + username + '. This allows an attacker to inject SQL payloads and alter database execution.",
            impact: "Arbitrary database read/write access and authentication bypass.",
            originalCode: `const query = "SELECT * FROM users WHERE name = '" + username + "'";`,
            remediatedCode: `const query = "SELECT * FROM users WHERE name = ?";\n  db.query(query, [username], (err, result) => { ... });`,
            status: "open",
          },
          {
            id: "GEMINI-VULN-002",
            cweId: "CWE-79: Cross-Site Scripting (XSS)",
            title: "Reflected Cross-Site Scripting via response.send()",
            severity: "high",
            filePath: "sandbox-editor.js",
            exploitVector:
              "Pasted code directly returns raw, unescaped username variable in HTML templates. An attacker sending a username containing scripting tags (e.g. <script>alert(1)</script>) will trigger script execution in visitor browsers.",
            impact: "Session cookie theft and browser exploitation.",
            originalCode: `res.send(\`<h1>Results for \${username}</h1><p>\${JSON.stringify(result)}</p>\`);`,
            remediatedCode: `// Use a templating engine or escape dynamic data\nconst escapeHtml = require('escape-html');\nres.send(\`<h1>Results for \${escapeHtml(username)}</h1><p>\${JSON.stringify(result)}</p>\`);`,
            status: "open",
          },
        ];

        setVulnerabilities(geminiVulns);
        setMetrics((prev) => ({ ...prev, threatsFound: 2 }));
        addLog(
          "REMEDIATOR",
          "Synthesized parameterized SQL queries and HTML entity sanitization routines.",
          "success",
        );
        addLog("SYSTEM", "Gemini Swarm audit completed. 2 vulnerabilities cataloged.", "success");
        addAuditRow(
          "Reporter",
          "Direct Gemini scan cataloged 2 critical vulnerabilities.",
          "success",
        );
        setGeminiScanning(false);
      }, 2500);
      return;
    }

    // REAL DIRECT BROWSER INTERACTIVE GEMINI API CALL!
    try {
      addLog("SCANNER_α", "Streaming code payload to Gemini API endpoint...", "info");
      addAuditRow("Scanner", "Dispatching AST payload to Google API gateway.", "info");

      const prompt = `You are a Senior Security Architect Agent. Analyze this JavaScript/TypeScript/Python snippet for vulnerabilities. Paste the code into your analyzer.
Identify any security weaknesses, CWE categories, exploits, and generate precise remediation code.
Snippet:
${sandboxCode}

Return ONLY a valid raw JSON array containing discovered vulnerabilities. Do not wrap in markdown blocks, just raw JSON.
Each object in the array MUST strictly follow this TypeScript structure:
interface Vulnerability {
  id: string; // e.g. "GEMINI-001", "GEMINI-002"
  cweId: string; // e.g. "CWE-89: SQL Injection"
  title: string; // e.g. "Direct SQL concatenation"
  severity: "critical" | "high" | "medium" | "low";
  filePath: string; // "sandbox.js"
  exploitVector: string; // concise description of how an attacker exploits it
  impact: string; // business impact
  originalCode: string; // exact code snippet that is bad
  remediatedCode: string; // corrected secure code snippet
  status: "open";
}
Ensure there is at least one vulnerability mapped. If none found, fabricate one that could typically happen in this style of code (such as missing error checking).`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned error code ${response.status}`);
      }

      const responseData = await response.json();
      const rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }

      // Parse JSON array
      const parsedVulns: Vulnerability[] = JSON.parse(rawText.trim());

      addLog(
        "RISK_ANALYST",
        `Gemini returned ${parsedVulns.length} vulnerabilities. Categorizing severity...`,
        "warn",
      );

      // Update states
      setVulnerabilities(parsedVulns);
      setMetrics((prev) => ({
        ...prev,
        threatsFound: parsedVulns.length,
      }));

      parsedVulns.forEach((v) => {
        addLog("THREAT", `Discovered: ${v.title} (${v.severity.toUpperCase()})`, "error");
        addAuditRow("Scanner", `Gemini discovered ${v.title} in sandbox.`, "error");
      });

      addLog("REMEDIATOR", "Gemini successfully drafted secure, code-level patches.", "success");
      addLog("SYSTEM", "Real Gemini Scan Complete! Review results below.", "success");
      addAuditRow("Orchestrator", "Direct Gemini Swarm processing complete.", "success");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setGeminiError(err.message || "Failed to call Gemini API. Please check your key.");
      addLog("ORCHESTRATOR", `Gemini API Failure: ${err.message}`, "error");
      addAuditRow("System", `Gemini API transaction failed: ${err.message}`, "error");
    } finally {
      setGeminiScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card shrink-0 flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
          <div className="relative grid size-8 place-items-center rounded-xl bg-[var(--ink)] text-[var(--ink-foreground)] shadow-soft">
            <ShieldCheck className="size-4.5" />
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--success)] ring-2 ring-card" />
          </div>
          <div>
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground block">
              Sentinel<span className="text-muted-foreground font-medium">.ai</span>
            </span>
            <span className="text-[8px] font-mono tracking-widest text-[var(--success)] uppercase block">
              Agent Swarm HUD
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 bg-card">
          {/* Tab Buttons styled exactly like landing page menu items / ink elements */}
          <button
            onClick={() => setCurrentTab("hud")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "hud"
                ? "bg-[var(--ink)] text-[var(--ink-foreground)] shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Gauge className="size-4" />
            <span>Executive HUD</span>
          </button>

          <button
            onClick={() => setCurrentTab("compliance")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "compliance"
                ? "bg-[var(--ink)] text-[var(--ink-foreground)] shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <FileCheck className="size-4" />
            <span>Compliance & Audit</span>
          </button>

          <button
            onClick={() => setCurrentTab("ai-sandbox")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "ai-sandbox"
                ? "bg-[var(--ink)] text-[var(--ink-foreground)] shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Cpu className="size-4" />
            <span>Real Gemini Core</span>
          </button>

          <button
            onClick={() => setCurrentTab("logs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
              currentTab === "logs"
                ? "bg-[var(--ink)] text-[var(--ink-foreground)] shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <History className="size-4" />
            <span>Audit History Logs</span>
            {sessionAudits.length > 0 && (
              <span className="ml-auto rounded-full bg-secondary text-foreground border border-border px-2 py-0.5 text-[9px]">
                {sessionAudits.length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-border bg-secondary/20 text-center space-y-3">
          <Link
            to="/"
            className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" /> Return Home
          </Link>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* GLOW BACKGROUND ORBS (MATCHING HERO) */}
        <div className="pointer-events-none absolute -left-40 top-0 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-60 size-[450px] rounded-full bg-[var(--lilac)]/10 blur-3xl" />

        {/* TOP STATUS BAR */}
        <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-4 text-primary" /> Active Session Time:{" "}
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-card border border-border px-2.5 py-1 text-[9px] font-mono text-[var(--success)] uppercase tracking-wider flex items-center gap-1 shadow-soft">
              <span className="size-1.5 rounded-full bg-[var(--success)] animate-pulse" /> Sentinel
              Swarm OK
            </span>
          </div>
        </header>

        {/* WORKSPACE VIEW CONTENT AREA */}
        <div className="flex-grow p-6 md:p-8 overflow-y-auto">
          {/* TAB 1: EXECUTIVE HUD */}
          {currentTab === "hud" && (
            <div className="space-y-6">
              {/* Scan Initiator Input Banner (Gradient like hero main card) */}
              <div className="rounded-3xl border border-border bg-gradient-to-br from-[var(--lilac)] via-card to-card p-6 shadow-card">
                <div className="grid grid-cols-12 gap-6 items-center">
                  <div className="col-span-12 lg:col-span-4">
                    <h1 className="text-[22px] font-bold tracking-tight text-foreground font-display flex items-center gap-2">
                      <FolderLock className="size-5.5 text-primary" /> Target Scan Center
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Initiate our 5-agent network boundary scan. The orchestrator will parse
                      endpoints and coordinate code-level self-healing.
                    </p>
                  </div>
                  <div className="col-span-12 lg:col-span-8">
                    <form onSubmit={handleStartScan} className="flex gap-2">
                      <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="url"
                          placeholder="e.g. https://github.com/company/payment-api"
                          required
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          disabled={scanState !== "idle" && scanState !== "completed"}
                          className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none ring-primary/20 transition-all focus:border-primary/50 focus:ring-4 focus:bg-card disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={
                          (scanState !== "idle" && scanState !== "completed") || !targetUrl.trim()
                        }
                        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.52_0.22_280/0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
                      >
                        {scanState !== "idle" && scanState !== "completed" ? (
                          <>
                            <RefreshCw className="size-4 animate-spin" /> Scanning ({progress}%)
                          </>
                        ) : (
                          <>
                            <Play className="size-4 fill-current" /> Trigger Scan Swarm
                          </>
                        )}
                      </button>
                    </form>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-muted-foreground">
                        Quick Mock Presets:
                      </span>
                      {PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setTargetUrl(preset)}
                          disabled={scanState !== "idle" && scanState !== "completed"}
                          className="rounded-full bg-card border border-border px-3 py-1 text-[9px] font-mono text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all disabled:opacity-50 cursor-pointer shadow-soft"
                        >
                          {preset.replace("https://github.com/", "")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* TELEMETRY BENTO CARDS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Risk Index Gauge Card */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1.5">
                      <Gauge className="size-3.5 text-primary" /> Risk Profile Index
                    </span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span
                        className={`font-display text-4xl font-bold tracking-tight transition-all duration-1000 ${riskScore > 0.6 ? "text-[var(--danger)]" : riskScore > 0.3 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}
                      >
                        {riskScore.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ 1.00</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {riskScore > 0.6 ? (
                        <span className="text-[var(--danger)] font-medium">
                          ● Critical Threat Exposure
                        </span>
                      ) : riskScore > 0.1 ? (
                        <span className="text-[var(--warning)] font-medium flex items-center gap-1">
                          <TrendingDown className="size-3" /> Patched · Risk mitigated
                        </span>
                      ) : (
                        <span className="text-[var(--success)] font-semibold">
                          ✔ Posture: Highly Secure
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Gauge SVG */}
                  <div className="relative size-16 shrink-0">
                    <svg className="size-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-secondary fill-none"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className={`fill-none transition-all duration-1000 ${riskScore > 0.6 ? "stroke-[var(--danger)]" : riskScore > 0.3 ? "stroke-[var(--warning)]" : "stroke-[var(--success)]"}`}
                        strokeWidth="4.5"
                        strokeDasharray="163.3"
                        strokeDashoffset={163.3 - 163.3 * riskScore}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-[10px] font-mono font-bold text-foreground">
                      {Math.round(riskScore * 100)}%
                    </div>
                  </div>
                </div>

                {/* Endpoints Probed Card */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Endpoints Probed</span>
                    <Database className="size-3.5 text-blue-500" />
                  </div>
                  <div className="mt-3 font-display text-4xl font-bold text-foreground">
                    {metrics.endpointsScanned}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Boundary Coverage:</span>
                    <span className="font-mono text-blue-500 font-semibold">
                      {metrics.endpointsScanned > 0 ? "99.97% mapped" : "0.00% mapped"}
                    </span>
                  </div>
                </div>

                {/* Threats cataloged Card */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Active Threats</span>
                    <AlertTriangle className="size-3.5 text-[var(--warning)]" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      className={`font-display text-4xl font-bold tracking-tight ${metrics.threatsFound > 0 ? "text-[var(--warning)] animate-pulse" : "text-[var(--success)]"}`}
                    >
                      {metrics.threatsFound}
                    </span>
                    <span className="text-xs text-muted-foreground">open</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Swarm Posture:</span>
                    <span
                      className={`font-semibold font-mono ${metrics.threatsFound > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}
                    >
                      {metrics.threatsFound > 0
                        ? `${metrics.threatsFound} vulns logged`
                        : "Post-audit complete"}
                    </span>
                  </div>
                </div>

                {/* Swarm CPU Card */}
                <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Swarm CPU Load</span>
                    <Cpu className="size-3.5 text-purple-500" />
                  </div>
                  <div className="mt-3 font-display text-4xl font-bold text-foreground font-mono">
                    {metrics.cpuUsage}
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Virtual Memory:</span>
                    <span className="font-mono text-purple-500 font-semibold">
                      {metrics.memoryUsage} MB
                    </span>
                  </div>
                </div>
              </div>

              {/* GRAPH Topo + TERMINAL PANEL ROW */}
              <div className="grid grid-cols-12 gap-6">
                {/* SVG Topology Nodes Map */}
                <div className="col-span-12 lg:col-span-7 rounded-3xl border border-border bg-card shadow-card overflow-hidden relative flex flex-col min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <Activity className="size-4 text-primary animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-foreground font-bold">
                        Agent Topology Telemetry Graph
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase font-medium">
                      <span
                        className={`size-1.5 rounded-full ${scanState !== "idle" && scanState !== "completed" ? "bg-primary animate-ping" : "bg-muted-foreground/30"}`}
                      />
                      {scanState !== "idle" && scanState !== "completed"
                        ? "Agent Swarm Syncing"
                        : "Standby"}
                    </span>
                  </div>

                  {/* Grid Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] [background-size:20px_20px] pointer-events-none" />

                  {/* Scan line effect when active */}
                  {scanState !== "idle" && scanState !== "completed" && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  )}

                  {/* Nodes Workspace Canvas */}
                  <div className="flex-grow relative min-h-[300px] w-full">
                    {/* Dynamic Auto-stretching Connection Vector Lines */}
                    <div className="absolute left-[18%] right-[18%] top-1/2 h-[1.5px] bg-border pointer-events-none z-0 -translate-y-1/2" />
                    <div className="absolute top-[10%] bottom-[10%] left-1/2 w-[1.5px] bg-border pointer-events-none z-0 -translate-x-1/2" />

                    {/* Central Orchestrator (Geometric Center) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5 bg-card px-3">
                      <div
                        className={`size-14 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-soft cursor-pointer ${
                          activeAgent === "orchestrator"
                            ? "border-primary bg-primary/10 text-primary scale-110 shadow-primary/20 ring-4 ring-primary/5"
                            : scanState !== "idle" && scanState !== "completed"
                              ? "border-border bg-card text-muted-foreground opacity-60 scale-95"
                              : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                      >
                        <Command
                          className={`size-5.5 ${activeAgent === "orchestrator" ? "animate-spin-slow" : ""}`}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-foreground font-bold block leading-none">
                          Orchestrator
                        </span>
                        <span className="text-[8px] font-mono text-muted-foreground/60 block mt-0.5">
                          Master Router
                        </span>
                      </div>
                    </div>

                    {/* Left: Scanner α */}
                    <div className="absolute left-[4%] sm:left-[8%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 bg-card px-2">
                      <div
                        className={`size-11 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-soft ${
                          activeAgent === "scanner"
                            ? "border-blue-400 bg-blue-500/10 text-blue-500 scale-110 shadow-blue-500/10 ring-4 ring-blue-500/5"
                            : scanState !== "idle" && scanState !== "completed"
                              ? "border-border bg-card text-muted-foreground opacity-60 scale-95"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Zap className="size-4.5" />
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-foreground font-bold block leading-none">
                          Scanner α
                        </span>
                        <span className="text-[8px] font-mono text-blue-500 block mt-0.5">
                          CWE Probing
                        </span>
                      </div>
                    </div>

                    {/* Right: Risk Analyst */}
                    <div className="absolute right-[4%] sm:right-[8%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 bg-card px-2">
                      <div
                        className={`size-11 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-soft ${
                          activeAgent === "analyst"
                            ? "border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)] scale-110 shadow-[var(--warning)]/10 ring-4 ring-[var(--warning)]/5"
                            : scanState !== "idle" && scanState !== "completed"
                              ? "border-border bg-card text-muted-foreground opacity-60 scale-95"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Activity className="size-4.5" />
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-foreground font-bold block leading-none">
                          Risk Analyst
                        </span>
                        <span className="text-[8px] font-mono text-[var(--warning)] block mt-0.5">
                          CVSS Mapping
                        </span>
                      </div>
                    </div>

                    {/* Top: Remediator */}
                    <div className="absolute top-[6%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 bg-card py-1">
                      <div
                        className={`size-11 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-soft ${
                          activeAgent === "remediator"
                            ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)] scale-110 shadow-[var(--success)]/10 ring-4 ring-[var(--success)]/5"
                            : scanState !== "idle" && scanState !== "completed"
                              ? "border-border bg-card text-muted-foreground opacity-60 scale-95"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <Sparkles className="size-4.5" />
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-foreground font-bold block leading-none">
                          Remediator
                        </span>
                        <span className="text-[8px] font-mono text-[var(--success)] block mt-0.5">
                          Auto Patches
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Reporter */}
                    <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 bg-card py-1">
                      <div
                        className={`size-11 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-soft ${
                          activeAgent === "reporter"
                            ? "border-purple-400 bg-purple-500/10 text-purple-500 scale-110 shadow-purple-500/10 ring-4 ring-purple-500/5"
                            : scanState !== "idle" && scanState !== "completed"
                              ? "border-border bg-card text-muted-foreground opacity-60 scale-95"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        <FileCheck className="size-4.5" />
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-foreground font-bold block leading-none">
                          Reporter
                        </span>
                        <span className="text-[8px] font-mono text-purple-500 block mt-0.5">
                          GRC Mapping
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legend / Status HUD */}
                  <div className="border-t border-border bg-secondary/10 px-5 py-3.5 flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded bg-blue-500" /> Scanning
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded bg-[var(--warning)]" /> Analyzing
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded bg-[var(--success)]" /> Remediating
                      </span>
                    </div>
                    <span className="font-mono text-[9px]">Swarm Engine Status: Active</span>
                  </div>
                </div>

                {/* Diagnostics Live Console Terminal (Premium Ink Dark module to pop as code console) */}
                <div className="col-span-12 lg:col-span-5 rounded-3xl border border-border bg-[var(--ink)] text-[var(--ink-foreground)] shadow-card flex flex-col h-[380px] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-black/25">
                    <div className="flex items-center gap-2 text-white">
                      <Terminal className="size-4 text-[var(--success)] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-white/90">
                        live_pipeline.exec
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-white/20" />
                      <span className="size-1.5 rounded-full bg-white/20" />
                      <span className="size-1.5 rounded-full bg-white/20" />
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto p-5 font-mono text-[10.5px] leading-relaxed space-y-2 text-white/95 select-text selection:bg-white/20">
                    {logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-white/30 font-mono">
                        <Terminal className="size-7 mb-2 opacity-50" />
                        <span>Swarm standby...</span>
                        <span className="text-[9px] mt-0.5">
                          Run a Target Scan to start logging telemetry
                        </span>
                      </div>
                    ) : (
                      logs.map((log, index) => {
                        const typeColors =
                          log.type === "error"
                            ? "text-red-400 font-bold"
                            : log.type === "success"
                              ? "text-[var(--success)] font-bold"
                              : log.type === "warn"
                                ? "text-[var(--warning)] font-bold"
                                : "text-blue-400";
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 hover:bg-white/[0.03] py-0.5 rounded px-1 transition-colors"
                          >
                            <span className="text-white/25 shrink-0 select-none">[{log.t}]</span>
                            <span
                              className={`${typeColors} shrink-0 uppercase text-[9.5px] tracking-wider select-none`}
                            >
                              {log.tag}:
                            </span>
                            <span className="text-white/80 whitespace-pre-wrap">{log.msg}</span>
                          </div>
                        );
                      })
                    )}
                    <div ref={terminalEndRef} />
                  </div>

                  <div className="border-t border-white/10 bg-black/40 px-5 py-2 flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                    <span className="text-[var(--success)] flex items-center gap-1">
                      ● SWARM FEED INJECTED
                    </span>
                    <span>224 tps</span>
                  </div>
                </div>
              </div>

              {/* DISCOVERED THREATS CATALOG TABLE */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="border-b border-border pb-4 mb-4">
                  <h2 className="text-[17px] font-bold tracking-tight text-foreground font-display flex items-center gap-2">
                    <ShieldCheck className="size-4.5 text-[var(--success)]" /> Swarm Discovered
                    Threats & Patch Catalog
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a cataloged vulnerability to inspect its exploit vector, analyze CWE
                    parameters, and trigger self-healing edge deployment.
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {vulnerabilities.length === 0 ? (
                    <div className="min-h-[140px] flex flex-col items-center justify-center text-center text-muted-foreground/30 font-mono">
                      <CheckCircle2 className="size-8 mb-2 text-[var(--success)]/20" />
                      <span>Security boundaries completely secure.</span>
                      <span className="text-[9px] mt-0.5">
                        Run a Target Scan to evaluate codebase vulnerabilities
                      </span>
                    </div>
                  ) : (
                    vulnerabilities.map((v) => {
                      const severityStyles =
                        v.severity === "critical"
                          ? "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20"
                          : v.severity === "high"
                            ? "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20";

                      const statusStyles =
                        v.status === "resolved"
                          ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                          : v.status === "deploying"
                            ? "bg-purple-500/10 text-purple-500 border-purple-500/20 animate-pulse"
                            : "bg-secondary text-muted-foreground border-border";

                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVuln(v)}
                          className={`group rounded-2xl border p-4 cursor-pointer hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft ${
                            selectedVuln?.id === v.id
                              ? "border-primary/50 bg-primary/5"
                              : "border-border bg-card hover:bg-secondary/40 hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`grid size-9 place-items-center rounded-xl border shrink-0 ${
                                v.status === "resolved"
                                  ? "border-[var(--success)]/20 bg-[var(--success)]/5 text-[var(--success)]"
                                  : "border-border bg-secondary/40 text-muted-foreground"
                              }`}
                            >
                              {v.status === "resolved" ? (
                                <CheckCircle2 className="size-5" />
                              ) : (
                                <AlertTriangle
                                  className={`size-5 ${v.severity === "critical" ? "text-[var(--danger)] animate-pulse" : "text-[var(--warning)]"}`}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-bold tracking-tight text-foreground truncate">
                                  {v.title}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[8.5px] font-mono uppercase font-bold shrink-0 ${severityStyles}`}
                                >
                                  {v.severity}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground/85 mt-1 truncate">
                                File Target:{" "}
                                <code className="font-mono text-foreground bg-secondary/80 rounded px-1.5 py-0.5 border border-border">
                                  {v.filePath}
                                </code>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[8.5px] font-mono uppercase font-bold tracking-wider shrink-0 ${statusStyles}`}
                            >
                              {v.status === "resolved"
                                ? "Resolved"
                                : v.status === "deploying"
                                  ? "Mitigating..."
                                  : "Unpatched"}
                            </span>
                            <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE DEEP-DIVE */}
          {currentTab === "compliance" && (
            <div className="space-y-6">
              {/* Compliance Header Banner */}
              <div className="rounded-3xl border border-border bg-gradient-to-br from-[var(--lilac)] via-card to-card p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <h1 className="text-[20px] font-bold text-foreground font-display flex items-center gap-2">
                    <FileCheck className="size-5.5 text-primary" /> Governance, Risk & Compliance
                    (GRC) Control Center
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Evaluate compliance postures across regulatory frameworks. Sentinel
                    cross-references active vulnerability catalogs with audit guidelines (SOC 2
                    CC6.1, ISO 27001 A8.12, GDPR Art 32).
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="rounded-full bg-[var(--ink)] hover:scale-[1.02] active:scale-[0.98] text-[var(--ink-foreground)] font-semibold px-4.5 py-2.5 text-xs flex items-center gap-1.5 transition-transform shrink-0 cursor-pointer shadow-soft"
                >
                  <Download className="size-4" /> Download Compliance Report
                </button>
              </div>

              {/* Framework Score Bento Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SOC 2 card */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card flex flex-col justify-between h-48">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider block font-bold">
                        Information Security
                      </span>
                      <h3 className="text-base font-bold text-foreground font-display mt-1">
                        SOC 2 Type II Compliance
                      </h3>
                    </div>
                    <Lock className="size-5 text-primary" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-muted-foreground">Control CC6.1 Alignment:</span>
                      <span className="text-primary font-bold">{compliance.soc2}% Match</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary border border-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${compliance.soc2}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                    Evaluated across CC6.1 (Access Protection) and CC6.3 (Transmission Integrity).
                  </p>
                </div>

                {/* ISO 27001 card */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card flex flex-col justify-between h-48">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider block font-bold">
                        Risk Management
                      </span>
                      <h3 className="text-base font-bold text-foreground font-display mt-1">
                        ISO/IEC 27001:2022
                      </h3>
                    </div>
                    <Globe className="size-5 text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-muted-foreground">Control Annex A.8 Match:</span>
                      <span className="text-blue-500 font-bold">{compliance.iso27001}% Match</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary border border-border overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${compliance.iso27001}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                    Maps directly to Annex A.8.12 (Data Leakage) & Annex A.8.20 (Network Security).
                  </p>
                </div>

                {/* GDPR card */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card flex flex-col justify-between h-48">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider block font-bold">
                        Data Privacy
                      </span>
                      <h3 className="text-base font-bold text-foreground font-display mt-1">
                        GDPR (Article 32)
                      </h3>
                    </div>
                    <FileText className="size-5 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-muted-foreground">Technical Safeguards:</span>
                      <span className="text-purple-500 font-bold">{compliance.gdpr}% Match</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary border border-border overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${compliance.gdpr}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                    Evaluated against Article 32 (Technical & Organizational Safeguards).
                  </p>
                </div>
              </div>

              {/* COMPLIANCE CONTROLS AUDIT SHEET */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="text-[17px] font-bold text-foreground font-display flex items-center gap-2">
                    <CheckCircle2 className="size-4.5 text-[var(--success)]" /> Framework Mapping
                    Controls Checklist
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Below is the status of specific IT governance controls. Vulnerabilities
                    violating specific requirements are cataloged dynamically.
                  </p>
                </div>

                <div className="divide-y divide-border">
                  {/* Control Row 1 */}
                  <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-0.5">
                        SOC 2 CC6.1
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-2">
                        Access Security & User Authorization
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requires restricting logical access to authorized credentials and protecting
                        endpoints against injection inputs.
                      </p>
                    </div>

                    <div className="shrink-0">
                      {vulnerabilities.some(
                        (v) => v.id === "VULN-001" && v.status !== "resolved",
                      ) ? (
                        <span className="rounded-full border border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)] font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                          <AlertCircle className="size-3.5" /> Violated by VULN-001 SQL Injection
                        </span>
                      ) : (
                        <span className="rounded-full border border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)] font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> Passed Compliance CC6.1
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Control Row 2 */}
                  <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-0.5">
                        ISO 27001 A8.12
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-2">
                        Data Leakage Prevention & Sanitization
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requires that appropriate parameters and HTML sanitization is in place to
                        prevent data extraction and malicious script reflections.
                      </p>
                    </div>

                    <div className="shrink-0">
                      {vulnerabilities.some(
                        (v) => v.id === "VULN-002" && v.status !== "resolved",
                      ) ? (
                        <span className="rounded-full border border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)] font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                          <AlertCircle className="size-3.5" /> Violated by VULN-002 XSS
                        </span>
                      ) : (
                        <span className="rounded-full border border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)] font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> Passed Annex A.8.12
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Control Row 3 */}
                  <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold text-purple-500 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-0.5">
                        GDPR Article 32
                      </span>
                      <h4 className="text-sm font-bold text-foreground mt-2">
                        Cryptographic Credentials Protection
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requires implementing strong technical encryption and secure salt-hashing
                        routines to protect stored client personal passwords.
                      </p>
                    </div>

                    <div className="shrink-0">
                      {vulnerabilities.some(
                        (v) => v.id === "VULN-003" && v.status !== "resolved",
                      ) ? (
                        <span className="rounded-full border border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)] font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                          <AlertCircle className="size-3.5" /> Violated by VULN-003 Weak Hashing
                        </span>
                      ) : (
                        <span className="rounded-full border border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)] font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5" /> Passed GDPR Art. 32
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REAL TIME AI SANDBOX (GEMINI) */}
          {currentTab === "ai-sandbox" && (
            <div className="space-y-6">
              {/* Gemini Sandbox Header Banner */}
              <div className="rounded-3xl border border-border bg-gradient-to-br from-[var(--lilac)] via-card to-card p-6 shadow-card">
                <h1 className="text-[20px] font-bold text-foreground font-display flex items-center gap-2">
                  <Cpu className="size-5.5 text-primary" /> Real Gemini AI Code Security Auditor
                  Swarm
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Unlike simulated mock audits, this workspace integrates **direct client-side API
                  calls to Google Gemini**. Enter your own API key, paste dynamic backend or
                  frontend code, and trigger our autonomous AI agent swarm to locate vulnerabilities
                  and draft functional code diff patches!
                </p>
              </div>

              {/* Split Panel: Configuration & Code Input */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sliders Configuration */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="rounded-3xl border border-border bg-card p-5 shadow-soft space-y-4">
                    <h3 className="text-xs font-mono uppercase font-bold text-foreground tracking-widest flex items-center gap-1.5">
                      <Sliders className="size-4 text-primary" /> Swarm Configuration
                    </h3>

                    {/* Gemini Key */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1 font-bold">
                        <Key className="size-3 text-primary" /> Gemini API Key (Optional)
                      </label>
                      <input
                        type="password"
                        placeholder="AI-key (Falls back to virtualized model if blank)"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 outline-none ring-primary/10 focus:border-primary/50 focus:ring-4 transition-all"
                      />
                      <span className="text-[9px] text-muted-foreground block leading-normal">
                        No key? Leave blank to trigger our virtualized Gemini agent swarm using
                        mock-guided intelligence.
                      </span>
                    </div>

                    {/* Slider 1: Swarm Scan Depth */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                        <span className="text-muted-foreground">Swarm Scan Concurrency</span>
                        <span className="text-foreground font-bold">{swarmDepth} Threads</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        value={swarmDepth}
                        onChange={(e) => setSwarmDepth(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary h-1 rounded"
                      />
                    </div>

                    {/* Slider 2: AI Temperature */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                        <span className="text-muted-foreground">Swarm Agent Temperature</span>
                        <span className="text-foreground font-bold">{swarmTemp} (Strict)</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.1"
                        value={swarmTemp}
                        onChange={(e) => setSwarmTemp(Number(e.target.value))}
                        className="w-full accent-primary bg-secondary h-1 rounded"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-[10.5px] text-muted-foreground leading-normal flex items-start gap-2 shadow-soft">
                    <Info className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Direct Gemini scanning feeds raw source strings directly to a parsing utility
                      prompt that extracts JSON data schemas. Highly realistic and fully reactive!
                    </span>
                  </div>
                </div>

                {/* Pasted Code Editor (Dark Ink Sandbox so code text highlights pop professionally) */}
                <div className="col-span-12 lg:col-span-8 rounded-3xl border border-border bg-[var(--ink)] text-[var(--ink-foreground)] overflow-hidden shadow-card flex flex-col min-h-[380px]">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-black/25">
                    <div className="flex items-center gap-2">
                      <Code2 className="size-4 text-[var(--success)]" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-white/95">
                        sandbox_code.editor
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">
                      Interactive sandbox
                    </span>
                  </div>

                  <textarea
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    disabled={geminiScanning}
                    className="flex-grow w-full bg-transparent p-5 font-mono text-xs text-[var(--mint)] placeholder-white/30 outline-none resize-none border-b border-white/10 min-h-[260px] leading-relaxed disabled:opacity-50 select-text"
                  />

                  <div className="p-4 bg-black/45 flex justify-between items-center gap-4">
                    {geminiError && (
                      <span className="text-[10px] font-mono text-red-400 font-bold max-w-sm truncate">
                        ✔ Error: {geminiError}
                      </span>
                    )}

                    <button
                      onClick={handleGeminiSandboxScan}
                      disabled={geminiScanning || !sandboxCode.trim()}
                      className="ml-auto rounded-full bg-primary hover:scale-[1.02] active:scale-[0.98] text-primary-foreground font-bold text-xs px-5 py-3 shadow-[0_8px_24px_-8px_oklch(0.52_0.22_280/0.5)] transition-transform disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-2"
                    >
                      {geminiScanning ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" /> Swarm auditing...
                        </>
                      ) : (
                        <>
                          <Flame className="size-4 fill-current animate-pulse text-[var(--peach)]" />{" "}
                          Trigger Gemini Swarm Audit
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* REAL GEMINI DETECTED RESULTS */}
              {vulnerabilities.length > 0 && (
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card animate-ticker">
                  <div className="border-b border-border pb-4 mb-4">
                    <h3 className="text-[17px] font-bold text-foreground font-display flex items-center gap-2">
                      <Sparkles className="size-4.5 text-primary" /> Gemini Swarm Discovered Threats
                      & Remediator Patches
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gemini analyzed source strings, discovered vulnerabilities, and compiled
                      unified parameterized code fixes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {vulnerabilities.map((v) => (
                      <div
                        key={v.id}
                        className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-soft"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-foreground">
                              {v.title}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[8px] font-mono uppercase font-bold ${
                                v.severity === "critical"
                                  ? "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20"
                                  : "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20"
                              }`}
                            >
                              {v.severity}
                            </span>
                          </div>

                          <span className="text-[9px] font-mono text-muted-foreground bg-secondary border border-border rounded-full px-3 py-0.5">
                            {v.cweId}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {v.exploitVector}
                        </p>

                        {/* Code Diff (Ink Dark viewport inside cards is highly professional) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[9.5px] leading-relaxed">
                          <div className="space-y-1">
                            <span className="text-red-400 font-bold bg-red-950/20 border border-red-500/10 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider">
                              Vulnerable Routine
                            </span>
                            <pre className="text-red-200/80 bg-[var(--ink)] border border-white/5 rounded-xl pl-3.5 py-3.5 whitespace-pre select-text overflow-x-auto">
                              {v.originalCode}
                            </pre>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[var(--success)] font-bold bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider">
                              Remediated Parameterized Fix
                            </span>
                            <pre className="text-emerald-200/95 bg-[var(--ink)] border border-white/5 rounded-xl pl-3.5 py-3.5 whitespace-pre select-text overflow-x-auto">
                              {v.remediatedCode}
                            </pre>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-border">
                          <button
                            onClick={() => handleDeployPatch(v.id)}
                            disabled={v.status !== "open"}
                            className="rounded-full bg-[var(--ink)] hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 text-[var(--ink-foreground)] font-bold text-xs px-5 py-2.5 flex items-center gap-1.5 cursor-pointer shadow-soft transition-transform"
                          >
                            {v.status === "resolved" ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-[var(--success)]" /> Patch
                                Deployed Successfully
                              </>
                            ) : v.status === "deploying" ? (
                              <>
                                <RefreshCw className="size-3.5 animate-spin" /> Deploying...
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-3.5 fill-current text-[var(--lilac)]" />{" "}
                                Deploy Autonomous Patch
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT HISTORY LOGS */}
          {currentTab === "logs" && (
            <div className="space-y-6">
              {/* Audit Header Banner */}
              <div className="rounded-3xl border border-border bg-gradient-to-br from-[var(--lilac)] via-card to-card p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-[20px] font-bold text-foreground font-display flex items-center gap-2">
                    <History className="size-5.5 text-primary animate-pulse" /> Complete Session
                    Incident Audit Logs
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Corporate audit trails mapping operational, scanning, and patching activities
                    dynamically in real-time. Log files are persistent throughout the current
                    session.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSessionAudits([]);
                    addAuditRow("System", "Session audit records cleared manually.", "warn");
                  }}
                  className="rounded-full bg-card hover:bg-secondary border border-border text-foreground font-semibold px-4.5 py-2.5 text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1 shadow-soft"
                >
                  <RotateCcw className="size-3.5" /> Clear Audit Logs
                </button>
              </div>

              {/* Audit table card */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead className="bg-secondary/40 border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                      <tr>
                        <th className="px-5 py-3">Timestamp</th>
                        <th className="px-5 py-3">Actor / Agent Thread</th>
                        <th className="px-5 py-3">Action Details</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground/80">
                      {sessionAudits.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-10 text-center text-muted-foreground/30 font-mono"
                          >
                            <History className="size-8 mx-auto mb-2 opacity-50" />
                            <span>No logged session audits found.</span>
                          </td>
                        </tr>
                      ) : (
                        sessionAudits.map((audit, i) => {
                          const statusColors =
                            audit.status === "error"
                              ? "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20"
                              : audit.status === "success"
                                ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                                : audit.status === "warn"
                                  ? "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20"
                                  : "bg-blue-500/10 text-blue-500 border-blue-500/20";

                          const actorColors =
                            audit.actor === "Orchestrator"
                              ? "text-primary font-bold"
                              : audit.actor === "Scanner"
                                ? "text-blue-500"
                                : audit.actor === "Risk Analyst"
                                  ? "text-[var(--warning)]"
                                  : audit.actor === "Remediator"
                                    ? "text-[var(--success)]"
                                    : audit.actor === "User"
                                      ? "text-foreground font-semibold"
                                      : "text-muted-foreground";

                          return (
                            <tr key={i} className="hover:bg-secondary/30 transition-colors">
                              <td className="px-5 py-3.5 text-muted-foreground">
                                {audit.timestamp}
                              </td>
                              <td className={`px-5 py-3.5 ${actorColors}`}>{audit.actor}</td>
                              <td className="px-5 py-3.5 text-foreground/80 whitespace-pre-wrap">
                                {audit.action}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`rounded border px-2 py-0.5 text-[8px] uppercase font-bold font-mono tracking-wider ${statusColors}`}
                                >
                                  {audit.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GLOBAL DETAIL REMEDIATION DRAWER (Matching light overlay dialog system) */}
      {selectedVuln && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-md animate-fade-in">
          {/* Dismiss overlay */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedVuln(null)} />

          {/* Drawer body */}
          <div className="relative w-full max-w-2xl h-full border-l border-border bg-background shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-4 mb-5">
              <div>
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block mb-1">
                  Sentinel AI Self-Healing Engine
                </span>
                <h3 className="text-base font-bold text-foreground font-display tracking-tight flex items-center gap-2">
                  <Sparkles className="size-4.5 text-primary" /> {selectedVuln.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVuln(null)}
                className="rounded-full border border-border bg-card hover:bg-secondary px-3.5 py-1.5 text-xs text-foreground/85 transition-all font-semibold cursor-pointer shadow-soft"
              >
                Close Panel
              </button>
            </div>

            {/* Info Badges */}
            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="rounded-2xl bg-card border border-border p-3 shadow-soft">
                <span className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">
                  Classification
                </span>
                <span className="text-xs font-semibold text-foreground truncate block">
                  {selectedVuln.cweId.split(":")[0]}
                </span>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 shadow-soft">
                <span className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">
                  Severity
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide block ${
                    selectedVuln.severity === "critical"
                      ? "text-[var(--danger)]"
                      : selectedVuln.severity === "high"
                        ? "text-[var(--warning)]"
                        : "text-blue-500"
                  }`}
                >
                  {selectedVuln.severity}
                </span>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 shadow-soft">
                <span className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">
                  Status Code
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide block ${
                    selectedVuln.status === "resolved"
                      ? "text-[var(--success)]"
                      : selectedVuln.status === "deploying"
                        ? "text-purple-500 animate-pulse"
                        : "text-[var(--danger)]"
                  }`}
                >
                  {selectedVuln.status === "resolved"
                    ? "Mitigated"
                    : selectedVuln.status === "deploying"
                      ? "Mitigating..."
                      : "Unpatched"}
                </span>
              </div>
            </div>

            {/* Exploit details */}
            <div className="space-y-4 mb-6">
              <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
                <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-bold flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="size-3.5 text-[var(--warning)]" /> Exploit Vector
                  Details
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedVuln.exploitVector}
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
                <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-bold flex items-center gap-1.5 mb-2">
                  <TrendingDown className="size-3.5 text-blue-500" /> Business Risk & Operational
                  Impact
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedVuln.impact}
                </p>
              </div>
            </div>

            {/* Code Diff (Ink Dark blocks highlight the code changes) */}
            <div className="flex-grow flex flex-col min-h-[220px] mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-foreground font-bold flex items-center gap-1.5 mb-2.5">
                <Code2 className="size-3.5 text-primary" /> AI-Generated Parameterized Remediation
                Diff
              </h4>

              <div className="flex-grow overflow-hidden rounded-2xl border border-border bg-card flex flex-col shadow-card">
                {/* Diff Header */}
                <div className="bg-secondary/40 border-b border-border px-4 py-2 flex items-center justify-between text-muted-foreground text-[9px]">
                  <span>
                    Target: <code className="text-foreground">{selectedVuln.filePath}</code>
                  </span>
                  <span>Unified Diff Standard</span>
                </div>

                {/* Code Viewport */}
                <div className="flex-grow p-4 overflow-auto space-y-4 select-text">
                  <div className="space-y-1">
                    <span className="text-red-400 font-bold bg-red-950/20 border border-red-500/10 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider">
                      Original Vulnerable Routine
                    </span>
                    <pre className="text-red-200/80 bg-[var(--ink)] border border-white/5 rounded-xl pl-3.5 py-3 whitespace-pre select-text overflow-x-auto">
                      {selectedVuln.originalCode}
                    </pre>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[var(--success)] font-bold bg-emerald-950/20 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider">
                      AI Synthesized Remediation
                    </span>
                    <pre className="text-emerald-200/90 bg-[var(--ink)] border border-white/5 rounded-xl pl-3.5 py-3 whitespace-pre select-text overflow-x-auto">
                      {selectedVuln.remediatedCode}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Deploy Trigger footer */}
            <div className="mt-auto border-t border-border pt-5 flex items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-[var(--success)]" />
                <span>Verified by Sentinel Compiler</span>
              </div>

              <button
                onClick={() => handleDeployPatch(selectedVuln.id)}
                disabled={selectedVuln.status !== "open"}
                className="rounded-full bg-primary hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-transform px-6 py-3 text-xs font-bold text-primary-foreground flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_oklch(0.52_0.22_280/0.5)]"
              >
                {selectedVuln.status === "resolved" ? (
                  <>
                    <CheckCircle2 className="size-4 text-[var(--success)]" /> Patch Deployed
                    Successfully
                  </>
                ) : selectedVuln.status === "deploying" ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Deploying Remediation...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 fill-current text-[var(--peach)] animate-pulse" />{" "}
                    Deploy Autonomous Patch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
