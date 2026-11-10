import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración de Playwright para smoke tests end-to-end.
 *
 * Levanta DOS dev servers, uno por cliente, en puertos distintos:
 *   5173 → demo          (VITE_CLIENT/VITE_MODE de .env, ya versionado)
 *   5175 → demo-medical  (override explícito vía `env`, ver ADR-0019)
 * e2e/theme-derivation.spec.js navega a ambas URLs para comparar los dos
 * clientes en la misma corrida — es la prueba de que cambiar de cliente no
 * toca código del core.
 *
 * Corre cada spec en desktop y en móvil — cubre el paso "verificar
 * responsive" que pide .claude/skills/testing/SKILL.md sin duplicar tests.
 *
 * Ver docs/architecture/DECISIONS.md D-08, ADR-0019.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'Desktop Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],

  webServer: [
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { VITE_CLIENT: 'demo', VITE_MODE: 'demo' },
    },
    {
      command: 'npm run dev -- --port 5175 --strictPort',
      url: 'http://localhost:5175',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { VITE_CLIENT: 'demo-medical', VITE_MODE: 'demo' },
    },
  ],
})
