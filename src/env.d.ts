/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    FAQS_KV: import('@cloudflare/workers-types').KVNamespace;
  }
}
