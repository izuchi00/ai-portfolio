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
    id: "data-prep-cleaning",
    title: "Data Prep / Cleaning",
    description: "Clean and organize the dataset to be analysis-ready.",
    steps: 1,
    icon: UploadCloud,
    category: "Data Preparation",
    analysisType: "data_preparation",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "exploratory-analysis",
    title:
      "Exploratory Analysis",
    description:
      "Conduct an exploratory analysis - basic descriptive stats and data visualizations.",
    steps: 3,
    icon: FlaskConical,
    category: "Exploratory Analysis",
    analysisType: "exploratory_analysis",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "data-viz-analysis",
    title: "Data Visualization & Analysis",
    description:
      "Create and analyze data visualizations, highlighting trends and insights for each chart.",
    steps: 2,
    icon: BarChart2,
    category: "Data Visualization",
    analysisType: "data_visualization",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "correlation-analysis",
    title: "Correlation Analysis",
    description:
      "Show the relationship between multiple variables in a dataset by calculating their correlation.",
    steps: 2,
    icon: LineChart,
    category: "Data Visualization",
    analysisType: "correlation_analysis",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "anomaly-detection",
    title: "Anomaly Detection",
    description: "Identify data points that deviate from the norm.",
    steps: 2,
    icon: AlertTriangle,
    category: "Data Analysis",
    analysisType: "anomaly_detection",
    requiresFile: true,
    actionText: "Run Report",
  },
  {
    id: "sentiment-analysis",
    title: "Sentiment Analysis",
    description:
      "Analyze the emotional tone of text (customer reviews) - positive, negative or neutral.",
    steps: 1,
    icon: Smile,
    category: "Qualitative Analysis",
    analysisType: "sentiment_analysis",
    requiresFile: false,
    actionText: "Go to Tool",
  },
  {
    id: "text-extraction",
    title: "Text Extraction",
    description:
      "Extract specific items from a block of text (ie: person's name, company name, address).",
    steps: 1,
    icon: Type,
    category: "Qualitative Analysis",
    analysisType: "text_extraction",
    requiresFile: false,
    actionText: "Go to Tool",
  },
  {
    id: "language-translation",
    title: "Language Translation",
    description: "Translate text from any language to any language.",
    steps: 0,
    icon: Languages,
    category: "Qualitative Analysis",
    analysisType: "language_translation",
    requiresFile: false,
    actionText: "Go to Tool",
  },
  {
    id: "traffic-acquisition",
    title: "Traffic Acquisition Report",
    description: "Find your website's top acquisition traffic sources.",
    steps: 1,
    icon: Globe,
    category: "Marketing",
    analysisType: "traffic_acquisition",
    requiresFile: false,
    actionText: "Connect Analytics",
  },
];
