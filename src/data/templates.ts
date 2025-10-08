import { LucideIcon } from "lucide-react";
import {
  UploadCloud,
  FlaskConical,
  BarChart2,
  LineChart,
  AlertTriangle,
  Smile,
  Type,
  Languages,
  Globe,
} from "lucide-react";

export interface AnalysisTemplate {
  id: string;
  title: string;
  description: string;
  steps: number;
  icon: LucideIcon;
  category: string;
  analysisType: string;
  requiresFile: boolean;
  actionText: string;
}

export const analysisTemplates: AnalysisTemplate[] = [
  {
    id: "mission-data-quality",
    title: "Data Quality Pulse",
    description: "Clean missing values, standardise types, and surface schema drift risks.",
    steps: 3,
    icon: UploadCloud,
    category: "Data Operations",
    analysisType: "data_preparation",
    requiresFile: true,
    actionText: "Preview Mission",
  },
  {
    id: "mission-exploratory-intel",
    title:
      "Exploratory Intelligence",
    description:
      "Profile key metrics, segment behaviour, and uncover signal in noisy datasets.",
    steps: 3,
    icon: FlaskConical,
    category: "Insight Discovery",
    analysisType: "exploratory_analysis",
    requiresFile: true,
    actionText: "Preview Mission",
  },
  {
    id: "mission-visual-story",
    title: "Visual Storyboard",
    description:
      "Generate tailored charts with narrative callouts for leadership-ready dashboards.",
    steps: 2,
    icon: BarChart2,
    category: "Data Visualization",
    analysisType: "data_visualization",
    requiresFile: true,
    actionText: "Preview Mission",
  },
  {
    id: "mission-correlation-scout",
    title: "Correlation Scout",
    description:
      "Reveal variable relationships, leading indicators, and leverage points for optimisation.",
    steps: 2,
    icon: LineChart,
    category: "Insight Discovery",
    analysisType: "correlation_analysis",
    requiresFile: true,
    actionText: "Preview Mission",
  },
  {
    id: "mission-anomaly-guardian",
    title: "Anomaly Guardian",
    description: "Detect outliers, emerging risks, and operational bottlenecks before they escalate.",
    steps: 2,
    icon: AlertTriangle,
    category: "Risk Intelligence",
    analysisType: "anomaly_detection",
    requiresFile: true,
    actionText: "Preview Mission",
  },
  {
    id: "sentiment-analysis",
    title: "Sentiment Pulse",
    description:
      "Analyse customer voice to spotlight satisfaction drivers and friction points.",
    steps: 1,
    icon: Smile,
    category: "Language Intelligence",
    analysisType: "sentiment_analysis",
    requiresFile: false,
    actionText: "Launch Tool",
  },
  {
    id: "text-extraction",
    title: "Entity Extraction",
    description:
      "Pull structured entities from research notes, interviews, or documents in seconds.",
    steps: 1,
    icon: Type,
    category: "Language Intelligence",
    analysisType: "text_extraction",
    requiresFile: false,
    actionText: "Launch Tool",
  },
  {
    id: "language-translation",
    title: "Language Translation",
    description: "Translate research, support tickets, or product copy between global markets.",
    steps: 0,
    icon: Languages,
    category: "Language Intelligence",
    analysisType: "language_translation",
    requiresFile: false,
    actionText: "Launch Tool",
  },
  {
    id: "traffic-acquisition",
    title: "Traffic Acquisition Report",
    description: "Identify top-performing acquisition sources and growth opportunities.",
    steps: 1,
    icon: Globe,
    category: "Growth Intelligence",
    analysisType: "traffic_acquisition",
    requiresFile: false,
    actionText: "Connect Analytics",
  },
];
