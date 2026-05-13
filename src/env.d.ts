/// <reference types="astro/client" />

interface Env {
  ASSETS: Fetcher;
  IMAGES: Fetcher;
  SESSION: KVNamespace;
  PABACK: Fetcher; // Service Binding → paback Worker
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
