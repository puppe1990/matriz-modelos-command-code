import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { pt } from "../src/i18n/pt.js";

const raiz = new URL("..", import.meta.url).pathname;
const ler = p => readFile(join(raiz, p), "utf8");

async function arquivosDe(dir) {
  const out = [];
  for (const e of await readdir(join(raiz, dir), { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...await arquivosDe(join(dir, e.name)));
    else if (e.name.endsWith(".js")) out.push(join(dir, e.name));
  }
  return out;
}

/* Chaves usadas de fato: no HTML via data-i18n*, no JS via t("…") / tr("…").
   As famílias montadas dinamicamente (plan.<chave>.models etc.) são cobertas
   pelo padrão `plan.${p.key}` encontrado no código.                            */
async function chavesEmUso() {
  const usadas = new Set();
  const html = await ler("index.html");
  for (const m of html.matchAll(/data-i18n(?:-html|-title|-placeholder|-aria)?="([^"]+)"/g)) usadas.add(m[1]);

  const fontes = [...await arquivosDe("src")];
  for (const f of fontes) {
    const src = await ler(f);
    for (const m of src.matchAll(/\b(?:t|tr)\(\s*"([^"]+)"/g)) usadas.add(m[1]);
    // chaves escolhidas por condicional (ex.: tema claro/escuro) aparecem como literal solto
    for (const k of Object.keys(pt)) {
      if (src.includes(`"${k}"`)) usadas.add(k);
    }
    // famílias construídas por template: plan.${p.key}.models | limits | note
    if (/`plan\.\$\{p\.key\}\.(models|limits|note)`/.test(src)) {
      for (const k of Object.keys(pt)) if (/^plan\.[a-z0-9]+\.(models|limits|note)$/.test(k)) usadas.add(k);
    }
  }
  return usadas;
}

test("toda chave do dicionário é usada em algum lugar (HTML ou JS)", async () => {
  const usadas = await chavesEmUso();
  const orfas = Object.keys(pt).filter(k => !usadas.has(k));
  assert.deepEqual(orfas, [], "chaves sem uso: " + orfas.join(", "));
});

test("todo data-i18n do HTML existe no dicionário", async () => {
  const html = await ler("index.html");
  const faltando = [];
  for (const m of html.matchAll(/data-i18n(?:-html|-title|-placeholder|-aria)?="([^"]+)"/g)) {
    if (!(m[1] in pt)) faltando.push(m[1]);
  }
  assert.deepEqual([...new Set(faltando)], [], "chaves inexistentes no HTML: " + faltando.join(", "));
});

test("o HTML estático ainda tem o texto em português como fallback (sem JS)", async () => {
  const html = await ler("index.html");
  // as seções continuam legíveis sem JS: títulos e parágrafos no HTML
  assert.ok(html.includes("Planos do Command Code"));
  assert.ok(html.includes("Metodologia"));
  assert.ok(html.includes("O que valem os grátis"));
  // e o conteúdo que depende de JS é claramente preenchido por script
  assert.ok(html.includes('id="tbody"'));
});
