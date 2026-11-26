import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
} as const;

function copyEntryAssets(sourceRoot: string, targetRoot: string): void {
  mkdirSync(targetRoot, { recursive: true });
  cpSync(join(sourceRoot, 'app'), join(targetRoot, 'app'), { recursive: true });

  const shotsTarget = join(targetRoot, 'screenshots');
  mkdirSync(shotsTarget, { recursive: true });
  const shotsSource = join(sourceRoot, 'screenshots');
  if (existsSync(shotsSource)) {
    cpSync(shotsSource, shotsTarget, { recursive: true });
  }
}

function main(): void {
  copyEntryAssets(rootDir, outputDir);
  const dossierBytes = buildDossier(outputDir, DOSSIER_LIMITS);
  writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
}

main();
