import { test } from "node:test";
import assert from "node:assert/strict";

import { pt } from "../src/i18n/pt.js";
import { en } from "../src/i18n/en.js";
import {
  LANGS, DICTS, DEFAULT_LANG, t, propsFor, isLang, otherLang, setLang, getLang
} from "../src/i18n/index.js";

const chaves = obj => Object.keys(obj);
const tags = s => (s.match(/<\/?[a-z][a-z0-9]*/gi) || []).map(x => x.toLowerCase().replace(/[</]/g, "")).sort();
const placeholders = s => (s.match(/\{(\w+)\}/g) || []).sort();

test("os dois idiomas têm exatamente as mesmas chaves", () => {
  assert.deepEqual(chaves(en).sort(), chaves(pt).sort());
  assert.ok(chaves(pt).length > 100, "dicionário pequeno demais: " + chaves(pt).length);
  assert.deepEqual(LANGS, ["pt", "en"]);
  assert.equal(DEFAULT_LANG, "pt");
});

test("nenhum valor vazio, em nenhum idioma", () => {
  for (const [lang, dict] of Object.entries(DICTS)) {
    for (const [k, v] of Object.entries(dict)) {
      assert.equal(typeof v, "string", `${lang}.${k} não é string`);
      assert.ok(v.trim().length > 0, `${lang}.${k} está vazio`);
    }
  }
});

test("tradução preserva a marcação, os placeholders e os números-chave", () => {
  for (const k of chaves(pt)) {
    assert.deepEqual(tags(en[k]), tags(pt[k]), `marcação divergente em ${k}`);
    assert.deepEqual(placeholders(en[k]), placeholders(pt[k]), `placeholders divergentes em ${k}`);
  }
});

test("t() traduz na língua pedida e cai para o PT quando não há tradução", () => {
  assert.equal(t("table.model", null, "pt"), "Modelo");
  assert.equal(t("table.model", null, "en"), "Model");
  assert.equal(t("header.theme.toLight", null, "en"), "Light");
  // chave inexistente aparece na tela em vez de virar vazio
  assert.equal(t("nao.existe"), "nao.existe");
});

test("t() interpola placeholders e mantém os que faltam", () => {
  assert.equal(t("plans.creditBadge", { value: 7 }), "7× crédito");
  assert.equal(t("plans.credits", { value: "$70" }), "$70 de créditos");
  const parcial = t("plans.creditBadge", {});
  assert.equal(parcial, "{value}× crédito");
});

test("propsFor decide o que escrever em cada elemento", () => {
  assert.deepEqual(propsFor({ i18n: "table.model" }), { textContent: "Modelo" });
  assert.deepEqual(propsFor({ i18nTitle: "table.ctxTitle" }).title.length > 10, true);
  assert.deepEqual(propsFor({ i18nPlaceholder: "filters.searchPlaceholder" }).placeholder, "nome, vendor ou id…");
  assert.deepEqual(propsFor({ i18nAria: "header.theme.ariaLight" }).ariaLabel, "Ativar tema claro");
  assert.deepEqual(propsFor({}), {});
  // chaves ricas devolvem marcação, e não texto puro
  const rich = propsFor({ i18nHtml: "method.value.html" });
  assert.ok(rich.innerHTML.includes("<strong"));
});

test("idioma é estado: normaliza, troca e persiste a escolha", () => {
  assert.equal(isLang("en"), true);
  assert.equal(isLang("fr"), false);
  assert.equal(otherLang("pt"), "en");
  assert.equal(otherLang("en"), "pt");
  setLang("en");
  assert.equal(getLang(), "en");
  setLang("fr");            // inválido volta para o padrão
  assert.equal(getLang(), "pt");
  setLang("pt");
});
