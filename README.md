# Agentic Data Intelligence Portfolio

This project showcases a computer science graduate portfolio focused on generative and agentic AI for data-heavy teams. The experience lets visitors upload datasets, choose intelligence tiers, preview Python-powered insights, and explore limited demo missions before booking a full engagement.

## Key features

- **Data Intelligence Studio** – A guided, tiered workflow (Basic, Intermediate, Expert) that runs through pandas, numpy, seaborn, plotly, scikit-learn, and matplotlib pipelines hosted on a Hugging Face Space.
- **Mission Templates** – Curated pathways for revenue, people operations, product sentiment, risk, and web intelligence demos.
- **Web Scraping Agent** – A controlled showcase that highlights extraction limits and promotes the production build.
- **Responsive layout** – Tailored for desktop, tablet, and mobile audiences with CTA-driven storytelling.

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
