import { LucideIcon, BarChart3, Compass, Layers, LineChart, Sparkles, Workflow } from "lucide-react";

export type AnalysisStageId = "basic" | "intermediate" | "expert";

export interface AnalysisStage {
  id: AnalysisStageId;
  title: string;
  subtitle: string;
  description: string;
  pythonStack: string[];
  focusAreas: string[];
  deliverables: string[];
  limitCopy: string;
  icon: LucideIcon;
}

export interface AnalysisTask {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
  idealFor: string;
  stage: AnalysisStageId;
}

export interface IntelligencePathway {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  impact: string;
  level: AnalysisStageId;
}

export const analysisStages: AnalysisStage[] = [
  {
    id: "basic",
    title: "Basic Intelligence",
    subtitle: "Data confidence fast",
    description:
      "Perfect for recruiters and teams who want to see clean, reliable data foundations with rapid profiling and quick wins.",
    pythonStack: ["pandas", "numpy", "matplotlib"],
    focusAreas: [
      "Schema validation & typing",
      "Missing value detection",
      "Business-ready descriptive statistics",
    ],
    deliverables: [
      "Interactive quality dashboard",
      "Executive-ready data profile",
      "Priority data cleansing backlog",
    ],
    limitCopy: "Demo includes 1 staged run with 100 preview rows.",
    icon: BarChart3,
  },
  {
    id: "intermediate",
    title: "Intermediate Intelligence",
    subtitle: "Model insights & storytelling",
    description:
      "Explore relationships, segmentation, and decision storytelling to show how AI elevates every stakeholder conversation.",
    pythonStack: ["pandas", "seaborn", "plotly", "scikit-learn"],
    focusAreas: [
      "Correlation and driver analysis",
      "Customer & account segmentation",
      "Scenario-driven dashboards",
    ],
    deliverables: [
      "Relationship heatmaps",
      "Cluster narratives",
      "Interactive comparison boards",
    ],
    limitCopy: "Demo limits: 1 clustering pass and 3 generated visuals.",
    icon: Layers,
  },
  {
    id: "expert",
    title: "Expert Intelligence",
    subtitle: "Agent orchestration & automation",
    description:
      "Surface anomalies, orchestrate predictive agents, and provide the executive-ready roadmap for production automation.",
    pythonStack: ["pandas", "numpy", "plotly", "scikit-learn", "matplotlib"],
    focusAreas: [
      "Anomaly detection",
      "Agent-led hypothesis testing",
      "Automation roadmap design",
    ],
    deliverables: [
      "Anomaly investigation log",
      "Agent-ready feature map",
      "Automation & monitoring blueprint",
    ],
    limitCopy: "Demo limits advanced agents to 10 insights.",
    icon: Sparkles,
  },
];

export const analysisTasks: AnalysisTask[] = [
  {
    id: "data-profiling",
    title: "Data profiling",
    description: "Automate schema checks, data typing, and source-of-truth validation in minutes.",
    outcomes: ["Column health report", "Business glossary alignment", "Quality risk register"],
    idealFor: "basic",
    stage: "basic",
  },
  {
    id: "cleanup",
    title: "Data cleanup",
    description: "Detect missing values, duplicates, and outliers then build a remediation backlog.",
    outcomes: ["Null + duplicate scan", "Prioritised cleanup backlog", "Automated remediation recipes"],
    idealFor: "Operations, RevOps, BizOps teams",
    stage: "basic",
  },
  {
    id: "relationship-map",
    title: "Relationship map",
    description: "Uncover the drivers that move revenue, churn, and acquisition across your GTM motions.",
    outcomes: ["Correlation network", "Driver heatmap", "Story-first insight slides"],
    idealFor: "intermediate",
    stage: "intermediate",
  },
  {
    id: "segmentation",
    title: "Segmentation & personas",
    description: "Cluster customers or teams by behaviour to reveal precise growth plays.",
    outcomes: ["Optimal cluster count", "Centroid personas", "Activation playbook"],
    idealFor: "intermediate",
    stage: "intermediate",
  },
  {
    id: "anomaly-ops",
    title: "Anomaly ops",
    description: "Pinpoint anomalies and risk signals before they impact customers.",
    outcomes: ["Isolation forest report", "Escalation triggers", "Agent response scripts"],
    idealFor: "expert",
    stage: "expert",
  },
  {
    id: "agent-automation",
    title: "Agent automation roadmap",
    description: "Design the autonomous agents that triage, analyse, and narrate outcomes end-to-end.",
    outcomes: ["Agent swimlane", "Monitoring spec", "Pilot rollout plan"],
    idealFor: "expert",
    stage: "expert",
  },
];

export const intelligencePathways: IntelligencePathway[] = [
  {
    id: "revenue-intelligence",
    title: "Revenue intelligence",
    category: "Growth & GTM",
    excerpt:
      "Blend pipeline health, conversion velocity, and channel attribution into a single revenue cockpit led by AI agents.",
    impact: "Accelerate decision cycles and spotlight net-new growth levers.",
    level: "intermediate",
  },
  {
    id: "talent-analytics",
    title: "Talent analytics",
    category: "People Ops",
    excerpt:
      "Combine hiring funnel data with retention and engagement metrics to help people teams hire and retain with precision.",
    impact: "Cut ramp time, reduce attrition, and align coaching to the right signals.",
    level: "basic",
  },
  {
    id: "product-sentiment",
    title: "Product sentiment intelligence",
    category: "Product",
    excerpt:
      "Fuse qualitative feedback, support interactions, and product telemetry to guide roadmap bets with confidence.",
    impact: "Enable PMs to ship what matters with AI-guided narratives.",
    level: "intermediate",
  },
  {
    id: "risk-operations",
    title: "Risk & compliance ops",
    category: "Risk",
    excerpt:
      "Deploy anomaly detection, alerting, and root-cause explorers that keep leadership ahead of the next crisis.",
    impact: "Automate reporting, reduce exposure, and build audit-ready trails.",
    level: "expert",
  },
  {
    id: "market-intelligence",
    title: "Market & web intelligence",
    category: "Insights",
    excerpt:
      "Scrape market sources, benchmark competitors, and orchestrate web research agents with audit-ready exports.",
    impact: "Deliver always-on situational awareness to growth teams.",
    level: "expert",
  },
];

export const missionIcons: Record<string, LucideIcon> = {
  "Growth & GTM": LineChart,
  "People Ops": Workflow,
  Product: Compass,
  Risk: Sparkles,
  Insights: BarChart3,
};
