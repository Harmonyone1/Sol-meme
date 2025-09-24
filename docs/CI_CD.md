# CI/CD Workflows

## Web → Vercel
- Build Next.js in CI; deploy with `amondnet/vercel-action` or native Vercel Git integration.
- Preview on PRs; production on `main`.

## API/Worker → Railway
- Build TypeScript.
- **Run Prisma migrations** (`migrate deploy`) before deploy.
- Deploy API then Worker.
- Guard with GitHub environments for approvals on prod.

Workflow files are in `.github/workflows`. Fill secrets as described in `docs/DEPLOYMENT.md`.
