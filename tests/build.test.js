import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { MODELS } from "../src/core.js";
import { LANGS } from "../src/i18n/index.js";
import { buildPartials } from "../build.mjs";

test("build gera um partial por modelo e idioma", async () => {
  const dir = await mkdtemp(join(tmpdir(), "partials-"));
  try {
    const total = await buildPartials(dir);
    assert.equal(total, MODELS.length * LANGS.length);
    for (const lang of LANGS) {
      const arquivos = await readdir(join(dir, lang));
      assert.equal(arquivos.length, MODELS.length);
      assert.ok(arquivos.includes("deepseek-v4-flash.html"));
    }
    const html = await readFile(join(dir, "pt", "muse-spark-1-3-contributor.html"), "utf8");
    assert.ok(html.includes("Muse Spark 1.3 Contributor"));
    assert.ok(html.includes("90.900"));
    const en = await readFile(join(dir, "en", "muse-spark-1-3-contributor.html"), "utf8");
    assert.notEqual(html, en);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("partial não depende de CSS/JS externo: é só o fragmento", async () => {
  const dir = await mkdtemp(join(tmpdir(), "partials-"));
  try {
    await buildPartials(dir);
    const html = await readFile(join(dir, "pt", "gpt-5-6-sol.html"), "utf8");
    assert.ok(!html.includes("<html"), "partial não deve ser um documento completo");
    assert.ok(!html.includes("<script"), "partial não deve trazer script");
    assert.ok(!html.includes("cdn.tailwindcss"), "partial não deve carregar o CDN");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
