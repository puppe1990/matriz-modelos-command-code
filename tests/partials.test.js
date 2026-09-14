import { test } from "node:test";
import assert from "node:assert/strict";

import { MODELS } from "../src/core.js";
import { modelPartial, slugify, partialPath } from "../src/partials.js";
import { t } from "../src/i18n/index.js";

const byName = n => MODELS.find(m => m.n === n);

test("slug é estável, sem acento e único entre os 70 modelos", () => {
  assert.equal(slugify("DeepSeek V4 Pro"), "deepseek-v4-pro");
  assert.equal(slugify("Muse Spark 1.3 Contributor"), "muse-spark-1-3-contributor");
  assert.equal(slugify("Claude Haiku 4.5"), "claude-haiku-4-5");
  assert.equal(slugify("  Qwen 3.8 Max 0902  "), "qwen-3-8-max-0902");

  const slugs = MODELS.map(m => slugify(m.n));
  assert.equal(new Set(slugs).size, MODELS.length, "slug repetido: " + slugs.filter((s, i) => slugs.indexOf(s) !== i));
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/);
});

test("caminho do partial segue o idioma", () => {
  const m = byName("DeepSeek V4 Flash");
  assert.equal(partialPath(m, "pt"), "/partials/pt/deepseek-v4-flash.html");
  assert.equal(partialPath(m, "en"), "/partials/en/deepseek-v4-flash.html");
});

test("partial traz o perfil completo do modelo", () => {
  const m = byName("DeepSeek V4 Flash");
  const html = modelPartial(m, "pt");
  assert.ok(html.includes("DeepSeek V4 Flash"));
  assert.ok(html.includes("deepseek/deepseek-v4-flash"));
  assert.ok(html.includes("$0.000366"), "custo por requisição formatado");
  assert.ok(html.includes("154.000"), "req/mês publicado");
  assert.ok(html.includes("30.800"), "janela de 5 h");
  assert.ok(html.includes("77.000"), "janela semanal");
  assert.ok(html.includes("$60"), "teto do modelo");
});

test("partial do grátis mostra a cota diária, e não teto/janelas", () => {
  const html = modelPartial(byName("LongCat 2.0"), "pt");
  assert.ok(html.includes("100 req/dia"));
  assert.ok(!html.includes("teto $"), "grátis não tem teto mensal");
});

test("partial marca preço de pico (DeepSeek) e preço cheio riscado (deal)", () => {
  const ds = modelPartial(byName("DeepSeek V4 Pro"), "pt");
  assert.ok(ds.includes("pico"), "DeepSeek tem preço de pico");
  const deal = modelPartial(byName("MiMo V2.5"), "pt");
  assert.ok(deal.includes("<s "), "deal mostra o preço cheio riscado");
  assert.ok(deal.includes("$0.80"), "preço cheio do MiMo V2.5");
});

test("partial troca de idioma", () => {
  const m = byName("Muse Spark 1.3");
  const ptHtml = modelPartial(m, "pt");
  const enHtml = modelPartial(m, "en");
  assert.notEqual(ptHtml, enHtml);
  assert.ok(ptHtml.includes("Equilíbrio"));
  assert.ok(enHtml.includes("Balance"));
  assert.ok(enHtml.includes(t("detail.requests", null, "en")));
});

test("nenhuma chave de tradução vaza para o HTML gerado", () => {
  for (const m of MODELS) {
    for (const lang of ["pt", "en"]) {
      const html = modelPartial(m, lang);
      assert.ok(!/>(detail|table|ui|free|picks)\.[a-zA-Z.]+</.test(html), `chave não traduzida em ${m.n} (${lang})`);
      assert.ok(!html.includes("{"), `placeholder não interpolado em ${m.n} (${lang})`);
    }
  }
});
