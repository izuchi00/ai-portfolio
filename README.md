# Welcome to your Dyad app

## Running locally

1. Install dependencies with `pnpm install`.
2. Start the development server with `pnpm dev`.

## Checking your work

Before you share updates, run the project checks that the repository uses in CI:

```bash
pnpm lint
```

## Pushing your changes after making corrections

1. Review the files you have modified:
   ```bash
   git status
   ```
2. Stage the updates you want to share:
   ```bash
   git add <path-to-file>
   ```
   Use `git add .` to stage every change in the working tree if appropriate.
3. Create a commit describing the correction:
   ```bash
   git commit -m "Describe the fix"
   ```
4. Push the commit to your remote branch:
   ```bash
   git push origin <your-branch-name>
   ```
5. Open or update your pull request so reviewers can confirm the corrections.

If `git push` reports that your local branch is behind the remote, pull the latest updates first:

```bash
git pull --rebase origin <your-branch-name>
```

Then repeat the push command.
