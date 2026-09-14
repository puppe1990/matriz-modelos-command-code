/* ============================================================
   i18n — resolução de idioma, interpolação e aplicação no DOM.
   A parte pura (t / placeholders / plano de tradução por elemento)
   é testada em Node; a parte que toca o DOM é fina de propósito.
   ============================================================ */
import { pt } from "./pt.js";
import { en } from "./en.js";

export const LANGS = ["pt", "en"];
export const DICTS = { pt, en };
export const DEFAULT_LANG = "pt";
const STORAGE_KEY = "cc-matriz-idioma";

let current = DEFAULT_LANG;

export const isLang = l => LANGS.includes(l);
export const getLang = () => current;
export const otherLang = (l = current) => (l === "pt" ? "en" : "pt");

export function setLang(lang) {
  current = isLang(lang) ? lang : DEFAULT_LANG;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, current);
  } catch (e) { /* modo privado / sem storage: segue só em memória */ }
  return current;
}

export function initLang() {
  let saved = null;
  try {
    if (typeof localStorage !== "undefined") saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) { /* idem */ }
  current = isLang(saved) ? saved : DEFAULT_LANG;
  return current;
}

/* Traduz uma chave, interpolando {placeholders}.
   Chave inexistente devolve a própria chave — erro visível é melhor que texto vazio. */
export function t(key, params = null, lang = current) {
  const dict = DICTS[lang] || DICTS[DEFAULT_LANG];
  const s = dict[key] ?? DICTS[DEFAULT_LANG][key] ?? key;
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? String(params[k]) : m));
}

/* Quais propriedades traduzir de um elemento. Puro: recebe {dataset} e devolve
   o que deve ser escrito. Mantém a parte testável fora do DOM.                  */
export function propsFor(dataset, lang = current) {
  const out = {};
  if (dataset.i18n) out.textContent = t(dataset.i18n, null, lang);
  if (dataset.i18nHtml) out.innerHTML = t(dataset.i18nHtml, null, lang);
  if (dataset.i18nTitle) out.title = t(dataset.i18nTitle, null, lang);
  if (dataset.i18nPlaceholder) out.placeholder = t(dataset.i18nPlaceholder, null, lang);
  if (dataset.i18nAria) out.ariaLabel = t(dataset.i18nAria, null, lang);
  return out;
}

export function applyTranslations(root, lang = current) {
  const scope = root || (typeof document !== "undefined" ? document : null);
  if (!scope) return;
  scope.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-title],[data-i18n-placeholder],[data-i18n-aria]")
    .forEach(el => {
      const props = propsFor(el.dataset, lang);
      for (const [k, v] of Object.entries(props)) {
        if (k === "ariaLabel") el.setAttribute("aria-label", v);
        else el[k] = v;
      }
    });
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }
  const titleKey = "header.title";
  const titleEl = scope.querySelector("title[data-i18n]");
  if (titleEl) titleEl.textContent = t(titleKey, null, lang) + " — Command Code";
}
