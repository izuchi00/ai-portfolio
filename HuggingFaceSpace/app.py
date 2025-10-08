from __future__ import annotations

import base64
import io
from typing import Any, Dict, List, Tuple

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.io as pio
import seaborn as sns
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

sns.set_theme(style="whitegrid")

DEMO_PREVIEW_LIMIT = 100


def to_data_url(image_bytes: bytes) -> str:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def matplotlib_to_png(fig: plt.Figure) -> str:
    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight", dpi=200)
    plt.close(fig)
    buffer.seek(0)
    return to_data_url(buffer.read())


def plotly_to_png(fig: px.scatter) -> str:
    image_bytes = pio.to_image(fig, format="png", width=1000, height=650, scale=2)
    return to_data_url(image_bytes)


def normalize_value(value: Any) -> Any:
    if isinstance(value, (np.floating, np.integer)):
        return value.item()
    if isinstance(value, (np.ndarray, list, tuple)):
        return [normalize_value(v) for v in value]
    if isinstance(value, dict):
        return {key: normalize_value(val) for key, val in value.items()}
    return value


def prepare_dataframe(raw_rows: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(raw_rows)
    if df.empty:
        raise ValueError("Dataset is empty. Provide at least one row for analysis.")

    for column in df.columns:
        if pd.api.types.is_numeric_dtype(df[column]):
            continue
        df[column] = pd.to_numeric(df[column], errors="ignore")
    return df


def build_descriptive_summary(df: pd.DataFrame) -> Dict[str, Any]:
    numeric_summary = df.select_dtypes(include=[np.number]).describe().T
    categorical_summary = df.select_dtypes(include=["object", "category", "bool"])\
        .apply(lambda col: col.value_counts().head(5))

    missing_counts = df.isna().sum()
    return {
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "numeric_overview": normalize_value(numeric_summary.round(3).to_dict()),
        "categorical_peek": {
            column: counts.to_dict()
            for column, counts in categorical_summary.items()
        },
        "missing_values": normalize_value(missing_counts[missing_counts > 0].to_dict()),
    }


def build_histogram(df: pd.DataFrame) -> Tuple[str, str]:
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_cols:
        return "", ""

    column = numeric_cols[0]
    fig, ax = plt.subplots(figsize=(7, 4))
    df[column].dropna().plot(kind="hist", bins=25, color="#2563eb", alpha=0.9, ax=ax)
    ax.set_title(f"Distribution of {column}")
    ax.set_xlabel(column)
    ax.set_ylabel("Frequency")
    plt.tight_layout()
    return matplotlib_to_png(fig), column


def build_heatmap(df: pd.DataFrame) -> Tuple[str, List[str]]:
    numeric = df.select_dtypes(include=[np.number])
    if numeric.shape[1] < 2:
        return "", []

    correlation = numeric.corr().round(3)
    fig, ax = plt.subplots(figsize=(6 + correlation.shape[0], 5))
    sns.heatmap(
        correlation,
        annot=correlation.shape[0] <= 6,
        cmap="coolwarm",
        center=0,
        linewidths=0.5,
        cbar_kws={"shrink": 0.8},
        ax=ax,
    )
    ax.set_title("Correlation Heatmap")
    plt.tight_layout()
    strong_pairs: List[str] = []
    for i in range(len(correlation.columns)):
        for j in range(i + 1, len(correlation.columns)):
            value = correlation.iloc[i, j]
            if abs(value) >= 0.4:
                strong_pairs.append(
                    f"{correlation.index[i]} vs {correlation.columns[j]}: {value:.2f}"
                )
    return matplotlib_to_png(fig), strong_pairs


def build_plotly_matrix(df: pd.DataFrame) -> str:
    numeric = df.select_dtypes(include=[np.number])
    if numeric.shape[1] < 2:
        return ""

    fig = px.scatter_matrix(
        numeric,
        dimensions=numeric.columns[:4],
        title="Multivariate Relationships",
        color=numeric.columns[0],
        height=650,
    )
    fig.update_traces(diagonal_visible=False)
    fig.update_layout(plot_bgcolor="white")
    return plotly_to_png(fig)


def run_kmeans(df: pd.DataFrame) -> Dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number]).dropna()
    if numeric.shape[1] < 2 or numeric.shape[0] < 6:
        return {}

    scaler = StandardScaler()
    scaled = scaler.fit_transform(numeric)
    clusters = min(3, max(2, numeric.shape[0] // 3))
    model = KMeans(n_clusters=clusters, n_init="auto", random_state=42)
    labels = model.fit_predict(scaled)

    silhouette = None
    if len(set(labels)) > 1:
        silhouette = float(round(silhouette_score(scaled, labels), 3))

    cluster_summary = (
        pd.DataFrame({"cluster": labels})
        .join(numeric.reset_index(drop=True))
        .groupby("cluster")
        .agg(["mean", "median"])
    )

    return {
        "clusters": clusters,
        "silhouette_score": silhouette,
        "centroids": normalize_value(model.cluster_centers_.round(3)),
        "summary": normalize_value(cluster_summary.round(3).to_dict()),
        "labels": normalize_value(labels.tolist()),
    }


def run_isolation_forest(df: pd.DataFrame) -> Dict[str, Any]:
    numeric = df.select_dtypes(include=[np.number]).dropna()
    if numeric.shape[1] < 2 or numeric.shape[0] < 15:
        return {}

    scaler = StandardScaler()
    scaled = scaler.fit_transform(numeric)
    forest = IsolationForest(contamination=0.1, random_state=42)
    anomaly_flags = forest.fit_predict(scaled)
    anomalies = df.iloc[np.where(anomaly_flags == -1)[0]].head(5)
    return {
        "detected": int((anomaly_flags == -1).sum()),
        "preview": normalize_value(anomalies.to_dict(orient="records")),
    }


def run_pca_projection(df: pd.DataFrame, labels: List[int] | None = None) -> str:
    numeric = df.select_dtypes(include=[np.number]).dropna()
    if numeric.shape[1] < 2 or numeric.shape[0] < 5:
        return ""

    scaler = StandardScaler()
    scaled = scaler.fit_transform(numeric)
    pca = PCA(n_components=2)
    components = pca.fit_transform(scaled)

    fig = px.scatter(
        x=components[:, 0],
        y=components[:, 1],
        color=labels if labels is not None and len(labels) == len(components) else None,
        title="PCA Projection",
        labels={"x": "PC1", "y": "PC2"},
        height=550,
    )
    fig.update_traces(marker=dict(size=10, opacity=0.8))
    fig.update_layout(plot_bgcolor="white")
    return plotly_to_png(fig)


@app.get("/health")
def health() -> Dict[str, bool]:
    return {"ok": True}


@app.post("/analysis")
async def analyze(request: Request) -> Dict[str, Any]:
    payload = await request.json()
    raw_rows = payload.get("data", [])
    stage = payload.get("stage", "basic")
    requested_tasks = payload.get("tasks", [])

    if not isinstance(raw_rows, list) or not raw_rows:
        raise HTTPException(status_code=400, detail="Provide a non-empty dataset for analysis.")

    try:
        dataframe = prepare_dataframe(raw_rows)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    preview = dataframe.head(DEMO_PREVIEW_LIMIT).to_dict(orient="records")
    summary = build_descriptive_summary(dataframe)

    histogram_url, histogram_column = build_histogram(dataframe)
    heatmap_url, strong_pairs = build_heatmap(dataframe)
    scatter_matrix_url = build_plotly_matrix(dataframe)

    kmeans_result = run_kmeans(dataframe)
    anomalies = run_isolation_forest(dataframe)
    pca_url = run_pca_projection(dataframe, kmeans_result.get("labels"))

    insights: List[str] = [
        "Structured the dataset using pandas and numpy, ensuring numeric columns are ready for computation.",
        "Profiled data completeness and variability to highlight quick wins for data quality.",
    ]

    if histogram_url:
        insights.append(
            f"Visualised the distribution of {histogram_column} with matplotlib to reveal skew and outliers."
        )
    if strong_pairs:
        insights.append(
            "Seaborn correlation heatmap surfaced the following strong relationships: "
            + "; ".join(strong_pairs[:4])
        )
    if kmeans_result:
        insights.append(
            "Applied scikit-learn clustering to uncover latent segments and estimate their centroid behaviour."
        )
    if anomalies:
        insights.append(
            "Isolation Forest highlights potential anomalies worth deeper investigation before modelling."
        )

    advanced_stack = [
        "pandas",
        "numpy",
        "matplotlib",
        "seaborn",
        "scikit-learn",
        "plotly",
    ]

    charts: List[Dict[str, Any]] = []
    if histogram_url:
        charts.append(
            {
                "title": "Feature distribution",
                "description": "Matplotlib histogram illustrating numeric spread.",
                "image": histogram_url,
            }
        )
    if heatmap_url:
        charts.append(
            {
                "title": "Correlation heatmap",
                "description": "Seaborn heatmap to expose linear relationships.",
                "image": heatmap_url,
            }
        )
    if scatter_matrix_url:
        charts.append(
            {
                "title": "Multivariate relationships",
                "description": "Plotly scatter matrix for quick dimensional comparisons.",
                "image": scatter_matrix_url,
            }
        )
    if pca_url:
        charts.append(
            {
                "title": "PCA projection",
                "description": "Plotly PCA scatter showcasing condensed feature space.",
                "image": pca_url,
            }
        )

    applied_stage_steps: Dict[str, List[str]] = {
        "basic": [
            "Data ingestion and typing with pandas.",
            "Missing value scan and statistical profiling.",
            "Quick trend visualisation for headline KPIs.",
        ],
        "intermediate": [
            "Correlation diagnostics to understand driver interplay.",
            "Segmentation or clustering to reveal behavioural cohorts.",
            "Design of exploratory dashboards using Plotly for stakeholder review.",
        ],
        "expert": [
            "Advanced anomaly detection and feature importance review.",
            "Dimensionality reduction and scenario planning for executive-ready briefs.",
            "Roadmap for production-grade automation and monitoring.",
        ],
    }

    stage_steps = applied_stage_steps.get(stage, applied_stage_steps["basic"])

    return {
        "stage": stage,
        "preview": normalize_value(preview),
        "summary": summary,
        "charts": charts,
        "insights": insights[:6],
        "kmeans": normalize_value(kmeans_result),
        "anomalies": anomalies,
        "tasks": requested_tasks,
        "stage_steps": stage_steps,
        "tech_stack": advanced_stack,
        "limit_notice": (
            "Demo run limited to 100 preview rows and condensed visuals. "
            "Hire me to deploy full-model pipelines, monitoring, and collaboration surfaces."
        ),
    }
