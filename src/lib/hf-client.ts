export interface PortfolioAnalysisRequest {
  data: Record<string, unknown>[];
  stage: string;
  tasks: string[];
}

export interface PortfolioChart {
  title: string;
  description: string;
  image: string;
}

export interface PortfolioAnalysisResponse {
  stage: string;
  preview: Record<string, unknown>[];
  summary: Record<string, unknown>;
  charts: PortfolioChart[];
  insights: string[];
  kmeans?: Record<string, unknown>;
  anomalies?: Record<string, unknown>;
  tasks: string[];
  stage_steps: string[];
  tech_stack: string[];
  limit_notice: string;
}

const defaultSpaceUrl = "https://westconex-ai-chat.hf.space";

const getSpaceUrl = () => {
  if (typeof import.meta !== "undefined") {
    const configured = import.meta.env.VITE_HF_SPACE_URL as string | undefined;
    if (configured && configured.trim().length > 0) {
      return configured.trim().replace(/\/$/, "");
    }
  }
  return defaultSpaceUrl;
};

export const runPortfolioAnalysis = async (
  payload: PortfolioAnalysisRequest,
  signal?: AbortSignal,
): Promise<PortfolioAnalysisResponse> => {
  const baseUrl = getSpaceUrl();
  const response = await fetch(`${baseUrl}/analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Space request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as PortfolioAnalysisResponse;
  return data;
};
