# Agentic Data Intelligence Portfolio

This project showcases a computer science graduate portfolio focused on generative and agentic AI for data-heavy teams. The experience lets visitors upload datasets, choose intelligence tiers, preview Python-powered insights, and explore limited demo missions before booking a full engagement.

## Key features

- **Data Intelligence Studio** – A guided, tiered workflow (Basic, Intermediate, Expert) that runs through pandas, numpy, seaborn, plotly, scikit-learn, and matplotlib pipelines hosted on a Hugging Face Space.
- **Dataset onboarding** – Drag-and-drop CSV and Excel uploads with instant schema detection and a 50-row preview table.
- **Visualization workspace** – Build bar, line, scatter, area, and pie charts, copy shareable links, export PNG/SVG assets, and print PDF-ready analysis reports.
- **Natural language assistant** – Ask contextual questions about the staged dataset and receive Hugging Face-powered answers within demo limits.
- **Mission Templates** – Curated pathways for revenue, people operations, product sentiment, risk, and web intelligence demos.
- **Web Scraping Agent** – A controlled showcase that highlights extraction limits and promotes the production build.
- **Responsive layout** – Tailored for desktop, tablet, and mobile audiences with CTA-driven storytelling.

## Demo walkthrough

1. **Upload & preview** – Drop a CSV/Excel file (or use the staged sample) to inspect columns and data quality before analysis.
2. **Choose intelligence tier** – Select Basic, Intermediate, or Expert missions to define the scope of the AI pipelines.
3. **Run AI analysis** – Trigger the Hugging Face backend to orchestrate Python libraries, surface insights, and outline next steps.
4. **Visualise & share** – Generate interactive charts, copy a shareable link, and export the results for decks or PDFs.
5. **Ask follow-up questions** – Use the natural language assistant to query the dataset and highlight how a full engagement would scale.

## Running locally

1. Install dependencies with `pnpm install`.
2. Start the development server with `pnpm dev` and open the app at [http://localhost:5173](http://localhost:5173).

## Configuring the Hugging Face backend

The analysis studio calls a FastAPI service deployed to Hugging Face Spaces. Override the default endpoint by creating a `.env` file in the project root:

```bash
VITE_HF_SPACE_URL=https://your-space-name.hf.space
```

Restart `pnpm dev` after updating environment variables. The default value points to `https://westconex-ai-chat.hf.space`.

## Checking your work

Before you share updates, run the lint command used in CI:

```bash
pnpm lint
```

## Pushing your changes

1. Review the files you have modified:
   ```bash
   git status
   ```
2. Stage the updates you want to share:
   ```bash
   git add <path-to-file>
   ```
   Use `git add .` to stage all changes when appropriate.
3. Create a commit describing the update:
   ```bash
   git commit -m "Describe the change"
   ```
4. Push the commit to your branch:
   ```bash
   git push origin <your-branch-name>
   ```
5. Open or update your pull request so reviewers can confirm the results.

If `git push` reports that your local branch is behind the remote, pull the latest updates first:

```bash
git pull --rebase origin <your-branch-name>
```

Then repeat the push command.
