/// <reference types="@astrojs/cloudflare" />

declare namespace App {
  interface Locals {
    runtime: import('@astrojs/cloudflare').Runtime<Env>;
  }
}

type Env = {
  FAQS_KV: KVNamespace;
};
