import pandas as pd
import numpy as np
import json
import base64
import io
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from sklearn.cluster import AgglomerativeClustering
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from flask import Flask, request, jsonify

# Set Matplotlib backend to 'Agg' for non-interactive plotting
plt.switch_backend('Agg')

app = Flask(__name__)

# CORS headers for Flask
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

app.after_request(add_cors_headers)

def generate_plot_base64(fig):
    """Converts a matplotlib figure to a base64 encoded PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

@app.route('/', methods=['POST', 'OPTIONS'])
def handle_analysis_request():
    if request.method == "OPTIONS":
        return jsonify({"message": "ok"}), 200

    try:
        body = request.json
        data = body.get('data')
        headers = body.get('headers')
        analysis_type = body.get('analysisType')

        if not data or not headers or not analysis_type:
            return jsonify({"error": "Missing data, headers, or analysisType in request body."}), 400

        df = pd.DataFrame(data)

        results = {
            "analysis_type": analysis_type,
            "report_text": f"Python-powered {analysis_type.replace('_', ' ')} analysis performed.",
            "summary_stats": None,
            "plot_base64": None,
            "cluster_profile": None,
            "correlation_matrix": None,
            "anomaly_detection_summary": None,
            "association_rules": None,
        }

        # Convert numeric columns to appropriate types
        for col in headers:
            try:
                # Attempt to convert to numeric, coercing errors to NaN
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except Exception:
                # If conversion fails, keep as object/string
                pass

        numeric_cols = df.select_dtypes(include=np.number).columns.tolist()

        if analysis_type == "data_preparation":
            # Simulate data preparation steps
            initial_missing = df.isnull().sum().to_dict()
            df.fillna(df.mean(numeric_only=True), inplace=True) # Simple mean imputation
            df.drop_duplicates(inplace=True)
            final_missing = df.isnull().sum().to_dict()
            
            results["report_text"] = (
                "**Data Preparation Report:**\n\n"
                "1. **Initial Missing Values:** " + json.dumps(initial_missing, indent=2) + "\n"
                "2. **Missing Value Handling:** Numeric columns filled with mean. Categorical columns (if any) would typically be filled with mode or a placeholder.\n"
                "3. **Duplicate Handling:** Duplicate rows removed.\n"
                "4. **Data Type Conversion:** Attempted to convert all suitable columns to numeric types.\n"
                "5. **Final Missing Values:** " + json.dumps(final_missing, indent=2) + "\n"
                "The dataset is now prepared for further analysis."
            )
            results["summary_stats"] = df.describe().to_dict()

        elif analysis_type == "exploratory_analysis":
            results["summary_stats"] = df.describe().to_dict()
            
            # Generate a simple histogram for the first numeric column
            if numeric_cols:
                fig, ax = plt.subplots(figsize=(8, 5))
                sns.histplot(df[numeric_cols[0]].dropna(), kde=True, ax=ax)
                ax.set_title(f'Distribution of {numeric_cols[0]}')
                results["plot_base64"] = generate_plot_base64(fig)
                plt.close(fig) # Close the figure to free memory
            
            results["report_text"] = (
                "**Exploratory Data Analysis Report:**\n\n"
                "1. **Summary Statistics:** Descriptive statistics for numerical columns are provided below.\n"
                "2. **Feature Distributions:** A histogram for the first numeric column is generated. Further analysis would include distributions for all key features.\n"
                "3. **Correlation Matrix:** A heatmap would typically show correlations between numerical variables.\n"
                "4. **Insights:** Initial insights suggest patterns in data distribution and potential relationships between variables."
            )

        elif analysis_type == "data_visualization":
            # Generate a scatter plot for two numeric columns if available
            if len(numeric_cols) >= 2:
                fig, ax = plt.subplots(figsize=(8, 5))
                sns.scatterplot(x=df[numeric_cols[0]], y=df[numeric_cols[1]], ax=ax)
                ax.set_title(f'Scatter Plot: {numeric_cols[0]} vs {numeric_cols[1]}')
                results["plot_base64"] = generate_plot_base64(fig)
                plt.close(fig)
                results["report_text"] = (
                    "**Data Visualization Report:**\n\n"
                    f"1. **Scatter Plot:** A scatter plot visualizing '{numeric_cols[0]}' against '{numeric_cols[1]}' has been generated. This helps in identifying relationships and patterns between these two variables.\n"
                    "2. **Further Visualizations:** Depending on the data, bar charts, line charts, and pie charts would be used to highlight trends, distributions, and comparisons across categories."
                )
            else:
                results["report_text"] = "Not enough numeric columns to generate a meaningful scatter plot for data visualization. Please ensure your dataset has at least two numeric columns."

        elif analysis_type == "correlation_analysis":
            if len(numeric_cols) >= 2:
                correlation_matrix = df[numeric_cols].corr().to_dict()
                results["correlation_matrix"] = correlation_matrix

                fig, ax = plt.subplots(figsize=(8, 6))
                sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='coolwarm', ax=ax)
                ax.set_title('Correlation Heatmap')
                results["plot_base64"] = generate_plot_base64(fig)
                plt.close(fig)

                results["report_text"] = (
                    "**Correlation Analysis Report:**\n\n"
                    "1. **Correlation Matrix:** The correlation matrix for numerical variables is provided below, showing the linear relationships between them.\n"
                    "2. **Heatmap Visualization:** A heatmap has been generated to visually represent these correlations, making it easy to spot strong positive or negative relationships.\n"
                    "3. **Interpretation:** Positive values indicate a direct relationship, negative values an inverse relationship, and values close to zero suggest no linear correlation. Further analysis would interpret the strength and significance of these correlations."
                )
            else:
                results["report_text"] = "Not enough numeric columns to perform correlation analysis. Please ensure your dataset has at least two numeric columns."

        elif analysis_type == "anomaly_detection":
            if len(numeric_cols) >= 1:
                # Simple Z-score based anomaly detection
                anomalies = {}
                for col in numeric_cols:
                    mean = df[col].mean()
                    std = df[col].std()
                    if std > 0: # Avoid division by zero
                        df[f'{col}_zscore'] = (df[col] - mean) / std
                        outliers = df[(df[f'{col}_zscore'] > 3) | (df[f'{col}_zscore'] < -3)]
                        if not outliers.empty:
                            anomalies[col] = outliers[[col, f'{col}_zscore']].to_dict(orient='records')
                
                if anomalies:
                    results["anomaly_detection_summary"] = anomalies
                    results["report_text"] = (
                        "**Anomaly Detection Report:**\n\n"
                        "1. **Methodology:** Z-score method applied to numerical columns. Data points with a Z-score greater than 3 or less than -3 are considered anomalies.\n"
                        "2. **Detected Anomalies:** Anomalies found in the following columns: " + ", ".join(anomalies.keys()) + ".\n"
                        "3. **Interpretation:** These points significantly deviate from the mean and warrant further investigation. A visualization (e.g., scatter plot with anomalies highlighted) would provide more context."
                    )
                else:
                    results["report_text"] = "No significant anomalies detected using the Z-score method (threshold +/- 3 standard deviations)."
            else:
                results["report_text"] = "No numeric columns available for anomaly detection."

        elif analysis_type == "clustering":
            if len(numeric_cols) >= 2:
                # Standardize data
                scaler = StandardScaler()
                X_scaled = scaler.fit_transform(df[numeric_cols].dropna())

                # K-Means Clustering (simplified for demo)
                if X_scaled.shape[0] > 1: # Ensure enough samples for clustering
                    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10) # Assume 3 clusters for demo
                    clusters = kmeans.fit_predict(X_scaled)
                    df_clustered = df[numeric_cols].dropna().copy()
                    df_clustered['Cluster'] = clusters

                    cluster_profile = df_clustered.groupby('Cluster').mean().to_dict()
                    results["cluster_profile"] = cluster_profile

                    # Generate scatter plot of clusters
                    fig, ax = plt.subplots(figsize=(8, 6))
                    sns.scatterplot(x=df_clustered[numeric_cols[0]], y=df_clustered[numeric_cols[1]], hue=df_clustered['Cluster'], palette='viridis', ax=ax)
                    ax.set_title(f'K-Means Clusters: {numeric_cols[0]} vs {numeric_cols[1]}')
                    results["plot_base64"] = generate_plot_base64(fig)
                    plt.close(fig)

                    results["report_text"] = (
                        "**Clustering Analysis Report (K-Means):**\n\n"
                        "1. **Data Standardization:** Numerical features were standardized to ensure equal weighting.\n"
                        "2. **K-Means Clustering:** Applied K-Means with 3 clusters (for demonstration). The optimal number of clusters would typically be determined using methods like the Elbow Method or Silhouette Score.\n"
                        "3. **Cluster Profile:** Mean values for each feature within the clusters are provided below, outlining the characteristics of each segment.\n"
                        "4. **Visualization:** A scatter plot shows the data points colored by their assigned cluster, illustrating the segmentation.\n"
                        "5. **Insights:** This segmentation can reveal distinct customer groups or data patterns, useful for targeted strategies."
                    )
                else:
                    results["report_text"] = "Not enough data points or numeric columns for clustering analysis."
            else:
                results["report_text"] = "Not enough numeric columns for clustering analysis. Please ensure your dataset has at least two numeric columns."

        elif analysis_type == "association":
            # This is a complex analysis, providing a simplified simulation
            results["report_text"] = (
                "**Association Rule Mining Report (Simulated):**\n\n"
                "1. **Data Preparation:** For association rule mining, numerical data would typically be binned into categorical ranges (e.g., 'Age_Group', 'Income_Level').\n"
                "2. **Transaction Dataset:** A 'transaction' dataset would be created where each row represents a set of items (e.g., customer attributes).\n"
                "3. **Frequent Itemsets & Rules:** Algorithms like Apriori would be used to find frequent itemsets and generate association rules (e.g., 'customers who buy X also buy Y').\n"
                "4. **Key Metrics:** Rules are evaluated using metrics like Support, Confidence, and Lift.\n"
                "5. **Insights:** This analysis helps uncover hidden relationships in data, useful for product recommendations or market basket analysis. (Actual rules would be displayed here if fully implemented)."
            )
        else:
            results["report_text"] = "Unknown analysis type or analysis not yet implemented in Python backend."

        return jsonify(results), 200

    except Exception as e:
        print(f"Python function error: {e}")
        return jsonify({"error": str(e)}), 500

# This is for local development if you run `python python-analysis.py` directly
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)