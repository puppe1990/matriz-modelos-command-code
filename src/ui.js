/* ============================================================
   Renderização e interação da página.
   Porte do script que vivia inline no index.html, agora com i18n
   (todas as strings via dicionário) e htmx no painel de detalhe.
   ============================================================ */
import {
  MODELS, PLANS, PLAN_RANK, PROFILE, WINDOW,
  PICKS, BALANCED, RANKED, CRED_TIERS, CRED_MAX, PAID_GOAT, NO_FREE,
  reqMonth, reqOf, usd, usdReq, int
} from "./core.js";
import { t, getLang } from "./i18n/index.js";
import { partialPath } from "./partials.js";

const $ = s => document.querySelector(s);
const tr = (key, params) => t(key, params, getLang());
const PLAN_LABEL = { go: "Go", goat: "GOAT", pro: "Pro", max: "Max" };

// o htmx precisa "acordar" os elementos criados depois do load
const htmxProcess = el => { if (el && window.htmx) window.htmx.process(el); };

/* ============================ PLANOS ============================ */
export function renderPlans() {
  $("#planGrid").innerHTML = PLANS.map(p => {
    const mult = p.credits ? (p.credits / p.price) : null;
    const isProvider = p.key === "provider";
    return `
    <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-2 hover:border-sky-600/60 transition">
      <div class="flex items-center justify-between">
        <span class="font-bold text-white">${p.name}</span>
        ${mult ? `<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">${tr("plans.creditBadge", { value: mult.toFixed(0) })}</span>`
               : `<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400">${tr("plans.payAsYouGoBadge")}</span>`}
      </div>
      <div class="flex items-end gap-1">
        <span class="text-3xl font-black ${mult ? 'grad-text' : 'text-slate-300'}">$${p.price}</span>
        <span class="text-xs text-slate-500 mb-1">${tr("plans.perMonth")}</span>
      </div>
      <div class="text-sm ${isProvider ? 'text-slate-400' : 'text-slate-300'} font-semibold">
        ${p.credits ? tr("plans.credits", { value: "$" + p.credits }) : tr("plans.payAsYouGo")}
      </div>
      <div class="text-xs text-slate-400 leading-relaxed flex-1">
        <div class="mb-1"><span class="text-slate-500">${tr("plans.modelsLabel")}</span> ${tr(`plan.${p.key}.models`)}</div>
        <div><span class="text-slate-500">${tr("plans.windowsLabel")}</span> ${tr(`plan.${p.key}.limits`)}</div>
      </div>
      <div class="text-[11px] text-slate-500 border-t border-slate-800 pt-2">${tr(`plan.${p.key}.note`)}</div>
      <button data-plan="${p.key}" class="planPick text-[11px] rounded-lg border border-slate-700 hover:border-sky-500 hover:text-sky-300 py-1.5 text-slate-300 transition">${tr("plans.filterBtn")}</button>
    </div>`;
  }).join("");
  document.querySelectorAll(".planPick").forEach(b => b.onclick = () => {
    $("#fPlan").value = b.dataset.plan === "provider" ? "max20" : b.dataset.plan;
    $("#fOnlyPlan").checked = true;
    render();
  });
}

/* ============================ KPIs ============================ */
function kpiCard(label, value, sub, accent) {
  return `<div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
    <div class="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">${label}</div>
    <div class="text-xl font-bold ${accent} mt-1 leading-snug">${value}</div>
    <div class="text-xs text-slate-400 mt-1 leading-relaxed">${sub}</div>
  </div>`;
}

export function renderKPIs() {
  const p = PICKS;
  const byCache = NO_FREE.slice().sort((a, b) => a.cr - b.cr || (b.iq ?? -1) - (a.iq ?? -1));
  const nonDeal = NO_FREE.filter(m => !m.isDeal).sort((a, b) => a.cr - b.cr)[0];
  const floor = Math.min(...CRED_TIERS);
  const cheapTier = NO_FREE.filter(m => m.onGoat && m.cred === floor);
  const vol = reqMonth(p.volume, "goat").n;
  const tie = byCache[1].cr === byCache[0].cr;

  $("#kpiGrid").innerHTML =
    kpiCard(tr("kpi.balance.label"), p.best.n,
      tr("kpi.balance.body.html", { balance: p.best.balance.toFixed(0), iq: p.best.iq, cost: usdReq(p.best.costReq), cred: p.best.cred, req: int(reqMonth(p.best, "goat").n) }), "text-emerald-400") +
    kpiCard(tr("kpi.smartest.label"), p.smartest.n,
      tr("kpi.smartest.body.html", { iq: p.smartest.iq, cost: usdReq(p.smartest.costReq), out: usd(p.smartest.out), cred: p.smartest.cred, req: int(reqMonth(p.smartest, "goat").n) }), "text-violet-400") +
    kpiCard(tr("kpi.volume.label"), p.volume.n,
      tr("kpi.volume.body.html", { req: int(vol), cred: p.volume.cred, cost: usdReq(p.volume.costReq), iq: p.volume.iq ?? tr("table.noScore"), cache: usd(p.volume.cr) }), "text-sky-400") +
    kpiCard(tr("kpi.cheapest.label"), p.cheapest.n,
      tr("kpi.cheapest.body.html", { cost: usdReq(p.cheapest.costReq), iq: p.cheapest.iq ?? tr("table.noScore"), cred: p.cheapest.cred }), "text-amber-400") +
    kpiCard(tr("kpi.cache.label"), byCache[0].n,
      tr("kpi.cache.body.html", {
        cache: usd(byCache[0].cr),
        tie: tie ? tr("kpi.cache.tie", { name: byCache[1].n }) : tr("kpi.cache.second", { cache: usd(byCache[1].cr), name: byCache[1].n }),
        nonDeal: usd(nonDeal.cr), nonDealName: nonDeal.n
      }), "text-teal-400") +
    kpiCard(tr("kpi.tier.label"), tr("kpi.tier.value", { max: CRED_MAX, floor }),
      tr("kpi.tier.body.html", {
        n: cheapTier.length, total: PAID_GOAT.length, floor, max: CRED_MAX,
        n70: MODELS.filter(m => m.cred === CRED_MAX).length,
        names: MODELS.filter(m => m.cred === CRED_MAX).map(m => m.n).join(", ")
      }), "text-rose-400") +
    kpiCard(tr("kpi.noDeal.label"), p.noDeal.n,
      tr("kpi.noDeal.body.html", { balance: p.noDeal.balance.toFixed(0), iq: p.noDeal.iq, inp: usd(p.noDeal.inp), out: usd(p.noDeal.out), cache: usd(p.noDeal.cr), cred: p.noDeal.cred }), "text-lime-400") +
    kpiCard(tr("kpi.free.label"), p.free.n,
      tr("kpi.free.body.html", { iq: p.free.iq, tps: p.free.tps, ctx: p.free.ctx }), "text-emerald-400");
}

/* ============================ TETOS ============================ */
export function renderTiers() {
  const paid = PAID_GOAT;
  $("#tierSummary").innerHTML = tr("tiers.summary.html", {
    paid: paid.length, bands: CRED_TIERS.length, min: Math.min(...CRED_TIERS), max: CRED_MAX
  });

  const linhas = CRED_TIERS.map(tier => {
    const ms = paid.filter(m => m.cred === tier).sort((a, b) => (b.balance ?? -1) - (a.balance ?? -1));
    const share = Math.round(ms.length / paid.length * 100);
    return `
    <div class="px-4 py-3 grid grid-cols-1 lg:grid-cols-[110px_1fr] gap-3 hover:bg-slate-900/40 transition">
      <div class="flex items-center gap-2 lg:block">
        <div class="text-2xl font-black text-white mono">$${tier}</div>
        <div class="text-[11px] text-slate-500">${tr("tiers.tierMeta", { n: ms.length, s: ms.length > 1 ? "s" : "", share })}</div>
      </div>
      <div class="min-w-0">
        <div class="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
          <div class="h-full ${tier >= 60 ? "bg-emerald-400" : tier >= 40 ? "bg-sky-400" : tier >= 30 ? "bg-violet-400" : "bg-slate-500"}" style="width:${share}%"></div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${ms.map(m => `<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 whitespace-nowrap">${m.n}<span class="text-slate-500">${tr("tiers.reqPerMonth", { req: int(reqMonth(m, "goat").n) })}</span></span>`).join("")}
        </div>
      </div>
    </div>`;
  }).join("");

  $("#tierList").innerHTML = linhas + `
    <div class="px-4 py-3 grid grid-cols-1 lg:grid-cols-[110px_1fr] gap-3">
      <div class="flex items-center gap-2 lg:block">
        <div class="text-2xl font-black text-emerald-400 mono">$0</div>
        <div class="text-[11px] text-slate-500">${tr("tiers.freeTierMeta")}</div>
      </div>
      <div class="flex flex-wrap gap-1.5 items-center">
        ${MODELS.filter(m => m.isFree).map(m => `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 whitespace-nowrap">${m.n}</span>`).join("")}
        <span class="text-[10px] text-slate-500">${tr("tiers.freeNote")}</span>
      </div>
    </div>`;
}

/* ============================ RECOMENDAÇÕES ============================ */
function pickCard(eyebrow, accent, m, why) {
  const reqFor = m => {
    if (m.isFree) return "100/dia";
    const key = m.onGoat ? "goat" : m.min === "pro" ? "pro" : "max";
    const r = reqMonth(m, key);
    return r ? (r.est ? tr("ui.approx") : "") + int(r.n) : tr("ui.na");
  };
  const url = partialPath(m, getLang());
  return `
  <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col hover:border-slate-700 transition">
    <div class="text-[11px] uppercase tracking-wide font-semibold text-${accent}-400">${eyebrow}</div>
    <button type="button" class="text-left text-base font-bold text-white mt-1 leading-snug hover:text-sky-300 transition"
            hx-get="${url}" hx-target="#detalheBody" hx-swap="innerHTML" hx-indicator="#detalheLoading"
            aria-label="${tr("picks.openDetail")}">${m.n}</button>
    <div class="text-[11px] text-slate-500 mb-2">${m.v} · ${m.ctx} · ${PLAN_LABEL[m.min]}+ ${m.cred ? `· ${tr("free.ceiling", { value: m.cred })}` : ""}</div>
    <p class="text-xs text-slate-400 leading-relaxed flex-1">${why}</p>
    <div class="grid grid-cols-3 gap-1.5 mt-3 text-center">
      <div class="rounded-lg bg-slate-950/70 py-1.5"><div class="text-[9px] text-slate-500 uppercase">${tr("picks.perReq")}</div><div class="font-bold text-sky-400 text-xs mono">${usdReq(m.costReq)}</div></div>
      <div class="rounded-lg bg-slate-950/70 py-1.5"><div class="text-[9px] text-slate-500 uppercase">${tr("picks.iq")}</div><div class="font-bold text-violet-400 text-xs">${m.iq ?? tr("ui.na")}</div></div>
      <div class="rounded-lg bg-slate-950/70 py-1.5"><div class="text-[9px] text-slate-500 uppercase">${tr("picks.reqMonth")}</div><div class="font-bold text-emerald-400 text-xs mono">${reqFor(m)}</div></div>
    </div>
  </div>`;
}

export function renderPicks() {
  const p = PICKS;
  const cred70 = MODELS.filter(m => m.cred === CRED_MAX).sort((a, b) => (b.balance ?? -1) - (a.balance ?? -1));
  const tie = MODELS.filter(m => m.iq === p.smartest.iq && m !== p.smartest).sort((a, b) => a.costReq - b.costReq)[0];
  const smartWhy = tie
    ? tr("pick.smartest.why.html", {
      iq: p.smartest.iq, tieName: tie.n, cost: usdReq(p.smartest.costReq), tieCost: usdReq(tie.costReq),
      cred: p.smartest.cred, req: int(reqMonth(p.smartest, "goat").n), tieReq: int(reqMonth(tie, "goat").n)
    })
    : tr("pick.smartest.alone", { iq: p.smartest.iq, cost: usdReq(p.smartest.costReq) });

  $("#pickGrid").innerHTML =
    pickCard(tr("pick.best.label"), "emerald", p.best,
      tr("pick.best.why.html", { iq: p.best.iq, cost: usdReq(p.best.costReq), listIn: usd(1.25), listOut: usd(4.25) })) +
    pickCard(tr("pick.smartest.label"), "violet", p.smartest, smartWhy) +
    pickCard(tr("pick.volume.label"), "sky", p.volume,
      tr("pick.volume.why.html", { cred: p.volume.cred, cost: usdReq(p.volume.costReq), iq: p.volume.iq })) +
    pickCard(tr("pick.fastest.label"), "amber", p.fastest,
      tr("pick.fastest.why.html", { tps: p.fastest.tps, iq: p.fastest.iq, cost: usdReq(p.fastest.costReq), cred: p.fastest.cred })) +
    pickCard(tr("pick.noDeal.label"), "lime", p.noDeal,
      tr("pick.noDeal.why.html", { inp: usd(p.noDeal.inp), out: usd(p.noDeal.out), cache: usd(p.noDeal.cr), balance: p.noDeal.balance.toFixed(0) })) +
    pickCard(tr("pick.bigBudget.label"), "cyan", p.bigBudget,
      tr("pick.bigBudget.why.html", { n: cred70.length, max: CRED_MAX, names: cred70.map(m => m.n).join(", "), cost: usdReq(p.bigBudget.costReq) })) +
    pickCard(tr("pick.premium.label"), "rose", p.premium,
      tr("pick.premium.why.html", { iq: p.premium.iq, cost: usdReq(p.premium.costReq) })) +
    pickCard(tr("pick.free.label"), "emerald", p.free,
      tr("pick.free.why.html", { iq: p.free.iq, tps: p.free.tps, ctx: p.free.ctx }));
}

/* ============================ PODIUM + RANKING ============================ */
export function renderPodium() {
  const top = BALANCED.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const ring = ["border-amber-400/60", "border-slate-400/50", "border-amber-700/50"];
  $("#podium").innerHTML = top.map((m, i) => `
    <div class="rounded-2xl border-2 ${ring[i]} bg-slate-900/60 p-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">${medals[i]}</span>
        <div>
          <div class="font-bold text-white leading-tight">${m.n}</div>
          <div class="text-[11px] text-slate-500">${m.v} · ${m.ctx} · ${PLAN_LABEL[m.min]}+ · ${tr("free.ceiling", { value: m.cred })}</div>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2 text-center">
        <div class="rounded-lg bg-slate-950/70 py-2"><div class="text-[10px] text-slate-500 uppercase">${tr("ranking.balanceShort")}</div><div class="font-bold text-emerald-400 text-sm">${m.balance.toFixed(0)}</div></div>
        <div class="rounded-lg bg-slate-950/70 py-2"><div class="text-[10px] text-slate-500 uppercase">${tr("ranking.iqShort")}</div><div class="font-bold text-violet-400 text-sm">${m.iq}</div></div>
        <div class="rounded-lg bg-slate-950/70 py-2"><div class="text-[10px] text-slate-500 uppercase">${tr("ranking.perReq")}</div><div class="font-bold text-sky-400 text-xs mono">${usdReq(m.costReq)}</div></div>
        <div class="rounded-lg bg-slate-950/70 py-2"><div class="text-[10px] text-slate-500 uppercase">${tr("ranking.reqWeek")}</div><div class="font-bold text-slate-300 text-xs mono">${int(reqMonth(m, "goat").n * WINDOW.week)}</div></div>
      </div>
    </div>`).join("");
}

export function renderRanking() {
  const list = BALANCED.slice(0, 15);
  $("#rankingList").innerHTML = list.map((m, i) => {
    const pct = Math.max(4, Math.round(m.balance / BALANCED[0].balance * 100));
    const color = i === 0 ? "bg-emerald-400" : i < 3 ? "bg-sky-400" : i < 8 ? "bg-violet-400" : "bg-slate-500";
    const rm = reqMonth(m, "goat");
    return `<div class="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div class="flex items-baseline justify-between gap-2">
        <div class="min-w-0">
          <div class="text-sm font-semibold text-white truncate">${i + 1}º ${m.n}</div>
          <div class="text-[10px] text-slate-500 truncate">${m.v} · IQ ${m.iq} · ${usdReq(m.costReq)}/req · ${tr("free.ceiling", { value: m.cred })} · ${int(rm?.n)} ${tr("picks.reqMonth")}</div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-sm font-bold text-emerald-400">${m.balance.toFixed(0)}</div>
          <div class="text-[9px] text-slate-600 uppercase">${tr("ranking.balanceShort")}</div>
        </div>
      </div>
      <div class="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div class="h-full ${color}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}

/* ============================ TABELA ============================ */
function tagChips(m) {
  const map = {
    free: ["Grátis", "bg-emerald-500/15 text-emerald-400"],
    vision: ["visão", "bg-sky-500/15 text-sky-300"],
    reasoning: ["reasoning", "bg-violet-500/15 text-violet-300"],
    deal: ["deal", "bg-amber-500/15 text-amber-300"]
  };
  return m.tags.map(tag => map[tag] ? `<span class="text-[9px] px-1.5 py-0.5 rounded ${map[tag][1]} whitespace-nowrap">${map[tag][0]}</span>` : "").join("");
}

function priceCell(m, val, baseIdx, peakIdx) {
  if (m.isFree) return `<span class="text-emerald-400">${tr("table.free")}</span>`;
  const base = m.base ? `<s class="text-slate-600 mr-1">${usd(m.base[baseIdx])}</s>` : "";
  const peak = (m.peak && peakIdx != null)
    ? `<div class="text-[9px] text-amber-500/80 whitespace-nowrap">${tr("table.peak", { in: usd(m.peak[peakIdx]) })}</div>`
    : (m.cw != null && baseIdx === 2 ? `<div class="text-[9px] text-slate-500 whitespace-nowrap">${tr("table.write", { value: usd(m.cw) })}</div>` : "");
  return base + usd(val) + peak;
}

export function render() {
  const q = $("#fSearch").value.trim().toLowerCase();
  const cat = $("#fCat").value;
  const vendor = $("#fVendor").value;
  const planKey = $("#fPlan").value;
  const plan = PLANS.find(p => p.key === planKey) || PLANS[1];
  const planRank = PLAN_RANK[plan.key];
  let onlyPlan = $("#fOnlyPlan").checked;
  if (cat === "proplus") { onlyPlan = false; $("#fOnlyPlan").checked = false; }
  const sort = $("#fSort").value;
  const minIq = parseFloat($("#fMinIq").value) || 0;

  let rows = MODELS.filter(m => {
    if (cat === "goat" && !m.onGoat) return false;
    if (cat === "proplus" && m.planRank <= PLAN_RANK.goat) return false;
    if (cat === "deals" && !m.isDeal) return false;
    if (cat === "free" && !m.isFree) return false;
    if (cat === "open" && !m.isOpen) return false;
    if (cat === "vision" && !m.tags.includes("vision")) return false;
    if (cat === "reasoning" && !m.tags.includes("reasoning")) return false;
    if (vendor !== "all" && m.v !== vendor) return false;
    if (onlyPlan && m.planRank > planRank) return false;
    if (minIq > 0 && !(m.iqEst != null && m.iqEst >= minIq)) return false;
    if (q && !(m.n + " " + m.v + " " + m.id).toLowerCase().includes(q)) return false;
    return true;
  });

  const val = m => m.isFree ? 1e18 : (m.value ?? -1);
  const reqNum = m => { const r = reqOf(m, plan); return r ? r.n : -1; };

  const cmp = {
    balance: (a, b) => (b.balance ?? -1) - (a.balance ?? -1),
    value: (a, b) => val(b) - val(a) || (b.iq ?? -1) - (a.iq ?? -1),
    iq: (a, b) => (b.iqEst ?? -1) - (a.iqEst ?? -1),
    tps: (a, b) => (b.tps ?? -1) - (a.tps ?? -1),
    cred: (a, b) => (b.cred ?? -1) - (a.cred ?? -1) || (b.balance ?? -1) - (a.balance ?? -1),
    req: (a, b) => reqNum(b) - reqNum(a),
    reqh: (a, b) => (reqNum(b) - reqNum(a)) * WINDOW.h5,
    cpr: (a, b) => a.costReq - b.costReq || (b.iq ?? -1) - (a.iq ?? -1),
    blend: (a, b) => a.blend - b.blend,
    out: (a, b) => a.out - b.out,
    cache: (a, b) => a.cr - b.cr,
    name: (a, b) => a.n.localeCompare(b.n)
  };
  rows.sort(cmp[sort] || cmp.balance);

  const isGoatPlan = plan.key === "goat";
  $("#thReq").textContent = plan.reqKey ? tr("table.reqPlan", { plan: plan.name }) : tr("table.req");
  const piso = minIq > 0 ? tr("count.floor", { iq: minIq }) : "";
  const balTop = (sort === "balance" && rows[0] && rows[0].balance != null) ? rows[0] : null;
  $("#resultCount").innerHTML =
    tr("count.models", {
      n: rows.length, plan: plan.name,
      credits: plan.credits ? tr("count.credits", { value: plan.credits }) : tr("count.payg"),
      floor: piso
    }) +
    (balTop ? tr("count.best", { name: balTop.n, pts: balTop.balance.toFixed(0) }) : "");

  const viewTop = rows.reduce((b, m) => (m.balance != null && (!b || m.balance > b.balance)) ? m : b, null);
  const lang = getLang();

  $("#tbody").innerHTML = rows.map(m => {
    const isFree = m.isFree;
    const unavailable = m.planRank > planRank;
    const r = reqOf(m, plan);
    const isTop = m === viewTop;
    const reqCell = isFree
      ? `<span title="${tr("table.freeQuotaTitle")}" class="text-emerald-400">${tr("table.freeQuota")}</span>`
      : (r == null ? `<span class="text-slate-600">${tr("ui.na")}</span>`
        : `<span class="${r.est ? "text-slate-500" : "text-slate-300"}">${r.est ? tr("ui.approx") : ""}${int(r.n)}</span>` +
          (isGoatPlan ? `<div class="text-[9px] text-slate-500 whitespace-nowrap" title="${tr("table.reqWindowsTitle")}">${tr("table.reqWindows", { h5: int(r.n * WINDOW.h5), week: int(r.n * WINDOW.week) })}</div>` : ""));
    return `
    <tr class="row-hover ${unavailable ? "opacity-40" : ""}">
      <td class="px-3 py-2.5 text-slate-500 mono text-xs whitespace-nowrap">${m.rankLabel || tr("ui.na")}</td>
      <td class="px-3 py-2.5">
        <div class="flex items-center gap-2 flex-wrap">
          <button type="button" class="font-medium text-slate-100 text-left hover:text-sky-300 transition"
                  hx-get="${partialPath(m, lang)}" hx-target="#detalheBody" hx-swap="innerHTML" hx-indicator="#detalheLoading"
                  aria-label="${tr("table.openDetail", { name: m.n })}">${m.n}</button>
          ${isTop ? `<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 whitespace-nowrap font-bold">${tr("table.topPick")}</span>` : ""}
          ${tagChips(m)}
        </div>
        <div class="text-[10px] text-slate-600 mono">${m.id}</div>
      </td>
      <td class="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">${m.v}</td>
      <td class="px-3 py-2.5 text-right text-xs text-slate-400 whitespace-nowrap">${m.ctx}</td>
      <td class="px-3 py-2.5 text-right mono text-xs whitespace-nowrap ${m.cred == null ? "text-slate-600" : (m.cred >= 60 ? "text-emerald-400" : m.cred >= 40 ? "text-sky-400" : m.cred > 0 ? "text-slate-300" : "text-emerald-400")}">
        ${isFree ? tr("table.free") : (m.cred == null ? tr("ui.na") : "$" + m.cred)}
      </td>
      <td class="px-3 py-2.5 text-right mono text-xs whitespace-nowrap">${priceCell(m, m.inp, 0, 0)}</td>
      <td class="px-3 py-2.5 text-right mono text-xs whitespace-nowrap">${priceCell(m, m.out, 1, 1)}</td>
      <td class="px-3 py-2.5 text-right mono text-xs whitespace-nowrap">${priceCell(m, m.cr, 2, null)}</td>
      <td class="px-3 py-2.5 text-right mono text-xs font-semibold ${isFree ? "text-emerald-400" : "text-sky-300"} whitespace-nowrap">${isFree ? "$0" : usdReq(m.costReq)}</td>
      <td class="px-3 py-2.5 text-right mono text-xs whitespace-nowrap ${isFree ? "text-emerald-400" : "text-slate-300"}">${isFree ? "$0" : usd(m.blend)}</td>
      <td class="px-3 py-2.5 text-right text-xs font-semibold">
        ${m.iq != null ? `<span class="text-violet-300">${m.iq}</span>`
          : m.iqEst != null ? `<span class="text-slate-300">${tr("ui.approx")}${m.iqEst.toFixed(1)}${tr("ui.estimateMark")}</span><div class="text-[9px] text-slate-500 whitespace-nowrap">AA ${m.aa}</div>`
          : `<span class="text-slate-600">${tr("table.noScore")}</span>`}
      </td>
      <td class="px-3 py-2.5 text-right text-xs font-bold ${m.value == null ? "text-slate-600" : "text-emerald-400"} whitespace-nowrap">
        ${isFree ? "∞" : (m.value == null ? tr("ui.na") : Math.round(m.value).toLocaleString("pt-BR"))}
      </td>
      <td class="px-3 py-2.5 text-right text-xs whitespace-nowrap">
        ${m.balance == null ? `<span class="text-slate-600">${tr("ui.na")}</span>`
          : `<span class="font-bold ${m.balance >= 60 ? "text-emerald-400" : m.balance >= 35 ? "text-amber-400" : "text-slate-500"}">${m.balance.toFixed(0)}</span>`}
      </td>
      <td class="px-3 py-2.5 text-right text-xs text-slate-400">${m.tps ?? tr("ui.na")}</td>
      <td class="px-3 py-2.5 text-center whitespace-nowrap">
        <span class="text-[10px] px-2 py-0.5 rounded-full ${unavailable ? "bg-rose-500/10 text-rose-400" : "bg-slate-700/40 text-slate-300"}">${PLAN_LABEL[m.min]}+</span>
      </td>
      <td class="px-3 py-2.5 text-right mono text-xs whitespace-nowrap ${r && r.n === 0 ? "text-emerald-400" : ""}">${reqCell}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="16" class="px-3 py-10 text-center text-slate-500 text-sm">${tr("table.empty")}</td></tr>`;

  htmxProcess($("#tbody"));
}

/* ============================ GRÁTIS ============================ */
const FREE_RIVALS = [
  { id: "meta/muse-spark-1.3", aa: 48.2, coding: 75.8 },
  { id: "google/gemini-3.5-flash-lite", aa: 22.7, coding: 49.3 },
  { id: "xiaomi/mimo-v2.5", aa: 22.3, coding: 56.8 },
  { id: "meituan/LongCat-2.0:free", aa: 19.7, coding: 45.3, self: true },
  { id: "stepfun/Step-3.7-Flash", aa: 19.5, coding: 39.6 },
  { id: "stepfun/Step-3.5-Flash", aa: 17.0, coding: null }
];
const FREE_REQ_MONTH = 3000;

export function renderFree() {
  const byId = id => MODELS.find(m => m.id === id);
  $("#freeRivals").innerHTML = FREE_RIVALS.map(r => {
    const m = byId(r.id);
    const teto = m.isFree ? tr("free.noCeiling") : (m.cred ? tr("free.ceiling", { value: m.cred }) : `${PLAN_LABEL[m.min]}+`);
    return `
    <tr class="${r.self ? "bg-emerald-500/10" : "row-hover"}">
      <td class="px-3 py-2.5">
        <span class="${r.self ? "font-bold text-emerald-300" : "text-slate-100"}">${m.n}</span>
        ${r.self ? `<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-1 whitespace-nowrap">${tr("free.badge")}</span>` : ""}
        <div class="text-[10px] text-slate-500">${m.v} · ${m.ctx} · ${teto}</div>
      </td>
      <td class="px-3 py-2.5 text-right text-xs font-semibold ${r.self ? "text-emerald-300" : "text-slate-300"}">${r.aa.toFixed(1)}</td>
      <td class="px-3 py-2.5 text-right text-xs ${r.self ? "text-emerald-300/90" : "text-slate-400"}">${r.coding ?? tr("ui.na")}</td>
      <td class="px-3 py-2.5 text-right mono text-xs ${m.isFree ? "text-emerald-400" : "text-sky-300"}">${m.isFree ? "$0" : usdReq(m.costReq)}</td>
      <td class="px-3 py-2.5 text-right mono text-xs ${m.isFree ? "font-bold text-emerald-400" : "text-slate-300"}">${m.isFree ? "$0" : usd(m.costReq * FREE_REQ_MONTH)}</td>
    </tr>`;
  }).join("");

  const rv = id => FREE_RIVALS.find(r => r.id === id);
  const lc = rv("meituan/LongCat-2.0:free"), st = rv("stepfun/Step-3.7-Flash"), mi = rv("xiaomi/mimo-v2.5");
  const stCost = byId(st.id).costReq * FREE_REQ_MONTH, miCost = byId(mi.id).costReq * FREE_REQ_MONTH;
  $("#freeRivalsNote").innerHTML = tr("free.note.html", {
    stepIq: st.aa.toFixed(1), longIq: lc.aa.toFixed(1),
    longCoding: lc.coding, stepCoding: st.coding,
    stepCost: usd(stCost), mimoIq: mi.aa.toFixed(1), mimoCoding: mi.coding, mimoCost: usd(miCost)
  });

  $("#freeValue").innerHTML = tr("free.value.body.html", { cheap: usd(miCost), dear: usd(stCost) });
  $("#freeNoScore").innerHTML = tr("free.noscore.body.html");
}

/* ============================ CSV ============================ */
export function exportCsv() {
  const head = ["id", "modelo", "vendor", "contexto", "teto_goat_usd", "in_por_1M", "out_por_1M", "cache_read_por_1M", "cache_write_por_1M", "custo_por_requisicao_usd", "custo_blend_por_1M", "intelligence", "aa_v43", "intelligence_estimada", "iq_por_dolar", "equilibrio_inteligente_barato", "tokens_s", "plano_minimo", "req_mes_goat", "req_5h_goat", "req_semana_goat", "req_mes_pro", "req_mes_max10", "flags"];
  const lines = [head.join(",")];
  MODELS.forEach(m => {
    const g = reqMonth(m, "goat");
    lines.push([
      m.id, `"${m.n}"`, m.v, m.ctx, m.cred ?? "", m.inp, m.out, m.cr, m.cw ?? "",
      m.costReq.toFixed(6), m.blend.toFixed(6),
      m.iq ?? "", m.aa ?? "", m.iq == null && m.iqEst != null ? m.iqEst.toFixed(1) : "",
      m.value ? Math.round(m.value) : "", m.balance != null ? m.balance.toFixed(1) : "", m.tps ?? "", m.min,
      g ? (g.est ? "~" : "") + Math.round(g.n) : "", g ? Math.round(g.n * WINDOW.h5) : "", g ? Math.round(g.n * WINDOW.week) : "",
      m.req.pro ?? "", m.req.max ?? "", m.tags.join("|")
    ].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "command-code-matriz-modelos.csv";
  a.click();
}

/* ============================ BOOT DO CONTEÚDO ============================ */
export function renderAll() {
  renderPlans(); renderKPIs(); renderTiers(); renderPicks();
  renderPodium(); renderRanking(); renderFree(); render();
}

export function bind() {
  const vendors = [...new Set(MODELS.map(m => m.v))].sort((a, b) => a.localeCompare(b));
  $("#fVendor").innerHTML = `<option value="all">${tr("filters.vendorAll")}</option>` +
    vendors.map(v => `<option value="${v}">${v}</option>`).join("");
  ["#fSearch", "#fCat", "#fVendor", "#fPlan", "#fSort", "#fMinIq", "#fOnlyPlan"].forEach(s =>
    $(s).addEventListener("input", render));
  $("#btnCsv").onclick = exportCsv;
  htmxProcess(document.body);
}

export { PROFILE };
