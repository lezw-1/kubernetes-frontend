# Frontend

React/TypeScript dashboard for the Kubernetes AI system. Provides a UI for login, monitoring, and interacting with the worker pipeline.

## Setup
- nvm is necessary
- use version in `.nvmrc`
- copy `.env.example` to `.env` and fill in values

```sh
nvm install
nvm use
npm install
npm run dev
npm run build
```

### Test
No test framework is configured yet. To add one (e.g. Vitest):
```sh
npm install --save-dev vitest
```
Then add `"test": "vitest"` to `scripts` in `package.json` and run:
```sh
npm test
```
