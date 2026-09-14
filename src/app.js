/* ============================================================
   Boot da página: tema, idioma, render inicial e painel htmx.
   ============================================================ */
import { initLang, setLang, getLang, otherLang, applyTranslations, t } from "./i18n/index.js";
import { renderAll, bind } from "./ui.js";

const THEME_KEY = "cc-matriz-tema";
const q = s => document.querySelector(s);

/* ---------- tema ---------- */
export function applyTheme(theme) {
  const light = theme === "light";
  document.documentElement.setAttribute("data-theme", light ? "light" : "dark");
  const lang = getLang();
  const btn = q("#btnTheme");
  if (btn) {
    btn.setAttribute("aria-pressed", light ? "true" : "false");
    btn.setAttribute("aria-label", t(light ? "header.theme.ariaDark" : "header.theme.ariaLight", null, lang));
  }
  const label = q("#themeLabel");
  if (label) label.textContent = t(light ? "header.theme.toDark" : "header.theme.toLight", null, lang);
}

export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* sem storage */ }
  applyTheme(saved === "light" ? "light" : "dark");
  q("#btnTheme").onclick = () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* sem storage */ }
  };
}

/* ---------- painel de detalhe (htmx) ---------- */
export function closeDetail() {
  const body = q("#detalheBody");
  if (body) body.innerHTML = `<p class="text-sm text-slate-500" id="detalhePlaceholder">${t("detail.placeholder", null, getLang())}</p>`;
}

/* ---------- idioma ---------- */
function refresh() {
  applyTranslations(document);                                  // textos estáticos do HTML
  applyTheme(document.documentElement.getAttribute("data-theme")); // rótulos do botão de tema
  closeDetail();                                                // painel volta ao placeholder traduzido
  renderAll();                                                  // conteúdo gerado por JS
}

function initLangToggle() {
  const btn = q("#btnLang");
  btn.onclick = () => {
    setLang(otherLang());
    refresh();
  };
}

/* ---------- selo do Netlify ----------
   O edge injeta um iframe fixo ("Powered by Netlify") no fim do body, e no plano
   atual a API mantém built_with_badge_enabled=true. O CSS já esconde; aqui o
   elemento sai do DOM de fato (inclusive para leitores de tela).               */
function pruneNetlifyBadge() {
  document.querySelectorAll('#nl-badge-frame, iframe[title="Powered by Netlify"]')
    .forEach(el => el.remove());
}

function boot() {
  initTheme();
  initLang();
  bind();          // popula vendors e liga os controles
  refresh();       // traduz o HTML estático e renderiza tudo
  initLangToggle();
  window.closeDetail = closeDetail;  // usado pelo botão "Fechar" dos partials

  pruneNetlifyBadge();
  // o script do selo é async: ele pode criar o iframe depois do boot
  new MutationObserver(pruneNetlifyBadge).observe(document.body, { childList: true });
}

boot();
