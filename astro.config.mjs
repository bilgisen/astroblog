// @ts-check

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://paraanaliz.com',
  output: 'server',
  adapter: cloudflare(),
  integrations: [mdx(), react()],

  vite: {
    plugins: [tailwindcss()],
  },
});