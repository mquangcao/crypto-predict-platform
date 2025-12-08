**Giới Thiệu**

Đây là một monorepo sử dụng Turborepo, chứa nhiều ứng dụng và packages liên quan đến một nền tảng crypto (frontend Next.js, dịch vụ NestJS cho authentication, market streaming và news AI). README này tóm tắt cấu trúc, các package đã cài, yêu cầu môi trường và cách chạy / build dự án.

**Yêu Cầu Môi Trường**

- **Node.js**: >= 18 (theo `package.json` gốc)
- **npm**: dự án sử dụng `packageManager` = `npm@10.9.0` (khuyến nghị) hoặc quản lý package tương thích
- **Turborepo**: devDependency `turbo` được khai báo; bạn có thể dùng `npx turbo` nếu không cài global

**Cấu Trúc Dự Án (chung)**

- `apps/`
  - `frontend/` — Next.js app (React 19, Next 16)
  - `auth-service/` — NestJS service cho authentication
  - `market-service/` — NestJS service xử lý stream giá và websocket
  - `news-ai-service/` — NestJS service cho xử lý tin tức + AI
- `packages/`
  - `ui/` — thư viện component chia sẻ
    **Introduction**

  This repository is a Turborepo monorepo containing multiple applications and shared packages for a crypto platform: a Next.js frontend and several NestJS microservices (authentication, market streaming, and news AI). This README summarizes the project layout, installed packages, environment requirements, and how to run and build the project.

  **Environment Requirements**
  - **Node.js**: >= 18 (declared in the root `package.json`)
  - **npm**: This project uses `packageManager` = `npm@10.9.0` (recommended), but other compatible package managers will also work.
  - **Turborepo**: `turbo` is listed in devDependencies; you can use `npx turbo` if you don't have it installed globally.

  **Repository Structure (high level)**
  - `apps/`
    - `frontend/` — Next.js app (React 19, Next 16)
    - `auth-service/` — NestJS authentication service
    - `market-service/` — NestJS market streaming & websocket service
    - `news-ai-service/` — NestJS news + AI service
  - `packages/`
    - `ui/` — shared React component library
    - `eslint-config/`, `typescript-config/` — shared configurations

  **Key Tools & Installed Packages**
  - Root:
    - `turbo` (Turborepo), `prettier`, `typescript`
  - Frontend (`apps/frontend`):
    - `next@16.x`, `react@19.x`, `react-dom@19.x`, `socket.io-client`, `lightweight-charts`
    - Dev tools: `tailwindcss`, `eslint`, `prettier`, `typescript`
  - Backend services (`auth-service`, `market-service`, `news-ai-service`):
    - `@nestjs/*` (v11), `reflect-metadata`, `rxjs`
    - `market-service` additionally uses `@nestjs/platform-socket.io`, `@nestjs/websockets`, `axios`, and `ws` for realtime streams
    - Dev & test: `jest`, `ts-jest`, `ts-node`, `eslint`, `prettier`, etc.
  - Shared packages (`packages/ui`, `packages/eslint-config`, `packages/typescript-config`):
    - `react`, `react-dom` (inside `ui`), and shared lint/tsconfig packages

  **Important Scripts (root & per-app)**
  - Root `package.json`:
    - `npm run dev` → `turbo run dev --parallel` (run dev servers in parallel)
    - `npm run build` → `turbo run build`
    - `npm run lint` → `turbo run lint`
    - `npm run format` → `prettier --write "**/*.{ts,tsx,md}"`
    - `npm run check-types` → `turbo run check-types`

  - Frontend (`apps/frontend`):
    - `npm run dev` → `next dev`
    - `npm run build` → `next build`
    - `npm run start` → `next start`

  - NestJS services (`apps/*-service`):
    - `npm run dev` → `nest start --watch`
    - `npm run build` → `nest build`
    - `npm run start:prod` → `node dist/main`

  You can run a single app by `cd` into its folder and running `npm install` and the appropriate `npm run` script, or you can use Turborepo from the root to run multiple apps concurrently.

  **Quick Start & Installation (Windows PowerShell)**
  1. Install dependencies at the repository root:

  ```powershell
  cd "c:\Users\User\OneDrive - VNU-HCMUS\Documents\KHTN\KTPM\DOAN\crypto-platform"
  npm install
  ```

  2. Start all apps in development mode using Turborepo:

  ```powershell
  npm run dev
  ```

  This runs `turbo run dev --parallel` and starts the configured apps under `apps/*`.
  3. Run a single app locally
  - Frontend:

  ```powershell
  cd apps/frontend
  npm run dev
  ```

  - Auth service:

  ```powershell
  cd apps/auth-service
  npm run dev
  ```

  - Market service:

  ```powershell
  cd apps/market-service
  npm run dev
  ```

  - News AI service:

  ```powershell
  cd apps/news-ai-service
  npm run dev
  ```

  4. Build for production (example: build everything with Turbo):

  ```powershell
  npm run build
  ```

  You can also build a specific app using a Turbo filter, e.g.:

  ```powershell
  npx turbo build --filter=apps/frontend
  ```

  5. Start a built NestJS service in production mode (example):

  ```powershell
  cd apps/market-service
  npm run build
  npm run start:prod
  ```

  **Linting / Formatting / Type Checking**
  - Lint the entire monorepo:

  ```powershell
  npm run lint
  ```

  - Format code with Prettier:

  ```powershell
  npm run format
  ```

  - Run TypeScript checks (if configured):

  ```powershell
  npm run check-types
  ```

  **Project-specific Notes**
  - The frontend Next.js config enables the React compiler (`reactCompiler: true`) — see `apps/frontend/next.config.ts`.
  - `market-service` uses WebSocket/Socket.io (`@nestjs/platform-socket.io`, `ws`) to stream realtime price data — the frontend must connect to the appropriate endpoint.
  - The NestJS services rely on environment variables where applicable; there are no default `.env` files in the repository. Check each service's `src/main.ts` or configuration files for port and env expectations.

  **Troubleshooting Tips**
  - If Node version is incompatible: install Node >=18 or use nvm to switch versions.
  - If Turbo CLI errors occur: use `npx turbo` instead of a global `turbo` installation.
  - If an app fails to start: check console logs, confirm required env vars, and ensure ports are not in conflict.

  **Next Steps (optional tasks I can help with)**
  - Run `npm install` and `npm run dev` in this workspace and report errors/logs.
  - Create `.env.example` files for each service (you can provide expected env variables).
  - Add Dockerfiles and a basic `docker-compose` for local development.

  ***

  _This README was generated automatically from the repository's `package.json`, `turbo.json`, and `next.config.ts`. If you want me to include example environment variables, service ports, or deployment instructions (Docker/CI), tell me which one to add next._
