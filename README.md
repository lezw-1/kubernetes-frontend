# kubernetes-frontend

React dashboard for the AI system platform, deployed via ArgoCD.

## Contents

- [Usage](#usage)
- [Links](#links)

## Usage

### Local development

```bash
cp .env.example .env
npm install
npm run dev
```

### Build image locally

```bash
nerdctl build -t frontend:local \
  --build-arg VITE_IAM_SUBPATH=/iam \
  -f Containerfile .
```

### Deployment

Deployment is fully automated via ArgoCD (managed in `kubernetes-deployment`).

- Push to `dev` → CI builds image, commits updated tag to `dev` → ArgoCD auto-syncs to `ai-system-dev`
- Push to `prod` (via PR from `dev`) → CI builds image, commits updated tag to `prod` → ArgoCD requires manual sync to `ai-system-prod`

### Runtime configuration

| Variable        | Default                       | Description              |
|----------------|-------------------------------|--------------------------|
| `VITE_API_URL`  | `http://localhost:8000`       | Backend platform-api URL |
| `VITE_IAM_URL`  | `http://localhost:8080/iam`   | Keycloak IAM URL         |

`VITE_IAM_SUBPATH` is injected at **build time** via the `AUTH_IAM_SUBPATH` CI secret.

## Links

- ArgoCD: managed in `kubernetes-deployment`
- Platform API: `kubernetes-ai-system/platform-api`
- IAM: `kubernetes-ai-system` (Keycloak)
