/* ============================================================
   Partial de detalhe de um modelo.
   Função pura: (modelo, idioma) -> string HTML. É o que o htmx
   busca em /partials/<lang>/<slug>.html e injeta no painel.
   ============================================================ */
import { usd, usdReq, int, reqMonth, WINDOW } from "./core.js";
import { t } from "./i18n/index.js";

export const slugify = nome => nome
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export const partialPath = (m, lang) => `/partials/${lang}/${slugify(m.n)}.html`;

const celula = (tr, rotulo, valor, extra = "") => `
  <div class="rounded-xl bg-slate-950/70 px-3 py-2">
    <div class="text-[10px] uppercase tracking-wide text-slate-500">${rotulo}</div>
    <div class="text-sm font-bold text-slate-100">${valor}</div>
    ${extra ? `<div class="text-[10px] text-slate-500">${extra}</div>` : ""}
  </div>`;

const preco = (tr, rotulo, valor, base) => `
  <div class="text-xs">
    <span class="text-slate-500">${rotulo}</span>
    <span class="font-semibold text-slate-200 mono">${valor === 0 ? tr("table.free") : usd(valor)}</span>
    ${base ? `<s class="text-slate-600 ml-1 mono">${usd(base)}</s>` : ""}
  </div>`;

export function modelPartial(m, lang) {
  // toda tradução do partial precisa do idioma explícito: sem isso o t() cairia
  // no idioma corrente do módulo e os dois idiomas sairiam iguais.
  const tr = (key, params) => t(key, params, lang);
  const r = reqMonth(m, "goat");
  const iqTxt = m.iq != null
    ? `${m.iq}`
    : (m.iqEst != null ? `${tr("ui.approx")}${m.iqEst.toFixed(1)} ${tr("ui.estimateMark")}` : tr("table.noScore"));
  const iqLabel = m.iq != null ? tr("detail.intelligence") : tr("detail.intelligenceEst");

  const janelas = m.isFree
    ? `<p class="text-xs text-emerald-300">${tr("detail.freeQuota")}</p>`
    : (r
      ? `<div class="grid grid-cols-3 gap-2">
           ${celula(tr, tr("detail.window5h"), int(r.n * WINDOW.h5) + " " + tr("detail.requests"))}
           ${celula(tr, tr("detail.windowWeek"), int(r.n * WINDOW.week) + " " + tr("detail.requests"))}
           ${celula(tr, tr("detail.windowMonth"), int(r.n) + " " + tr("detail.requests"), r.est ? tr("ui.approx") : "")}
         </div>`
      : `<p class="text-xs text-slate-500">${tr("detail.ceilingNone")}</p>`);

  const teto = m.isFree
    ? tr("detail.freeQuota")
    : (m.cred != null ? `$${m.cred}` : tr("detail.ceilingNone"));

  return `
<div class="space-y-4">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="text-lg font-bold text-white leading-tight">${m.n}</h3>
      <div class="text-[11px] text-slate-500 mono">${m.id}</div>
      <div class="text-xs text-slate-400 mt-1">${m.v} · ${m.ctx} · ${m.min.toUpperCase()}+</div>
    </div>
    <button type="button" class="text-[11px] rounded-lg border border-slate-700 hover:border-sky-500 hover:text-sky-300 px-2.5 py-1 text-slate-300 transition"
            onclick="window.closeDetail && window.closeDetail()">${tr("detail.close")}</button>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
    ${celula(tr, tr("detail.costReq"), usdReq(m.costReq))}
    ${celula(tr, tr("detail.blend"), m.blend === 0 ? "$0" : usd(m.blend))}
    ${celula(tr, iqLabel, iqTxt, m.aa != null && m.iq == null ? `AA ${m.aa}` : "")}
    ${celula(tr, tr("detail.iqPerUsd"), m.value != null ? int(m.value) : tr("ui.na"))}
    ${celula(tr, tr("detail.balance"), m.balance != null ? m.balance.toFixed(0) : tr("ui.na"))}
    ${celula(tr, tr("detail.ceiling"), teto)}
    ${celula(tr, "tok/s", m.tps != null ? m.tps : tr("ui.na"))}
    ${celula(tr, tr("picks.reqMonth"), r ? int(r.n) : tr("ui.na"))}
  </div>

  <div>
    <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">${tr("detail.windows")}</div>
    ${janelas}
  </div>

  <div class="rounded-xl border border-slate-800 p-3">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">${tr("detail.prices")}</div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      ${preco(tr, "In", m.inp, m.base ? m.base[0] : null)}
      ${preco(tr, "Out", m.out, m.base ? m.base[1] : null)}
      ${preco(tr, "Cache read", m.cr, m.base ? m.base[2] : null)}
      ${preco(tr, "Cache write", m.cw ?? 0, null)}
    </div>
    ${m.peak ? `<div class="text-[10px] text-amber-500/90 mt-2">${tr("detail.peak", { in: usd(m.peak[0]), out: usd(m.peak[1]) })}</div>` : ""}
  </div>

  <div class="flex flex-wrap gap-3 text-[11px]">
    <a class="text-sky-500 hover:underline" href="https://commandcode.ai/models/${slugify(m.n)}" target="_blank" rel="noopener">${tr("detail.source")}</a>
  </div>
</div>`;
}
