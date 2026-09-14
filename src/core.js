/* ============================================================
   Núcleo do painel: constantes, métricas e rankings.
   Tudo aqui é puro (sem DOM), para poder ser testado em Node.
   ============================================================ */
import { MODELS } from "./data.js";

export { MODELS };

/* Perfil de uma requisição típica de agente, documentado pelo Command Code:
   ~800 tokens de input novo, ~50.000 de cache read e ~160 de output.     */
export const PROFILE = { input: 800, cache: 50000, output: 160 };
export const TOKENS_PER_REQ = PROFILE.input + PROFILE.cache + PROFILE.output; // 50.960

/* As janelas são frações do teto mensal do próprio modelo. A doc publica os
   três números e a proporção se confirma em todos (ex.: $14 = 20% de $70). */
export const WINDOW = { h5: 0.20, week: 0.50 };

/* A tabela do plano e o catálogo publicam versões diferentes do mesmo índice
   (AA v4.2 vs v4.3). Nos 53 modelos presentes nas duas, o catálogo fica 5,6
   pontos abaixo em média (desvio 1,4; faixa 2,0–8,1) — é esse o offset usado
   para estimar quem a tabela do plano não pontua.                          */
export const AA_OFFSET = 5.6;

export const PREMIUM_VENDORS = ["Anthropic", "OpenAI", "Google", "Sakana", "Meta", "xAI"];
export const PLAN_RANK = { go: 0, goat: 1, pro: 2, max: 3, max10: 3, max20: 3 };

export const PLANS = [
  { key: "go", name: "Go", price: 1, credits: 10, reqKey: null, models: "Open-source + alguns premium", limits: "$3 / 5h · $6 / semanal", note: "Entrada global. Sem acesso à API." },
  { key: "goat", name: "GOAT", price: 10, credits: 70, reqKey: "goat", models: "30+ open + alguns closed", limits: "$14 / 5h · $35 / semanal", note: "7× de multiplicador — o melhor valor do mercado." },
  { key: "pro", name: "Pro", price: 20, credits: 80, reqKey: "pro", models: "45+ open + Claude/GPT/Gemini", limits: "$16 / 5h · $40 / semanal", note: "Premium com até $20 de teto por modelo." },
  { key: "max10", name: "Max 10×", price: 100, credits: 150, reqKey: "max", models: "Todos (Opus, Fable, Fugu)", limits: "$45 / 5h · $90 / semanal", note: "$150 standard + $100 premium." },
  { key: "max20", name: "Max 20×", price: 200, credits: 300, reqKey: "max", models: "Todos (Opus, Fable, Fugu)", limits: "$90 / 5h · $180 / semanal", note: "$300 standard + $200 premium." },
  { key: "provider", name: "Provider", price: 15, credits: null, reqKey: null, models: "Todos via API (pay-as-you-go)", limits: "sem limite (pré-pago)", note: "API OpenAI/Anthropic-compatível, ao custo do modelo." }
];

/* ============================ FORMATAÇÃO ============================ */
// dinheiro: nunca menos de 2 casas, nunca zero à direita sobrando
const trim = (s, min) => {
  const [i, d] = s.split(".");
  if (d.length <= min) return s;
  let t = d.replace(/0+$/, "");
  if (t.length < min) t = d.slice(0, min);
  return i + "." + t;
};
export const usd = v => v === 0 ? "$0"
  : v >= 1 ? "$" + v.toFixed(2)
  : v >= 0.01 ? "$" + trim(v.toFixed(3), 2)
  : v >= 0.001 ? "$" + trim(v.toFixed(4), 3)
  : "$" + trim(v.toFixed(5), 4);
export const usdReq = v => v === 0 ? "$0"
  : v < 0.001 ? "$" + trim(v.toFixed(6), 4)
  : v < 0.01 ? "$" + trim(v.toFixed(5), 4)
  : "$" + trim(v.toFixed(4), 3);
export const int = n => n == null ? "—" : Math.round(n).toLocaleString("pt-BR");
export const num = n => n == null ? "—" : String(n);

/* ============================ MÉTRICAS ============================ */
MODELS.forEach(m => {
  m.isOpen = !PREMIUM_VENDORS.includes(m.v);
  m.planRank = PLAN_RANK[m.min];
  m.isFree = m.tags.includes("free");
  m.isDeal = m.tags.includes("deal");
  m.onGoat = m.planRank <= PLAN_RANK.goat;

  if (m.isFree) {
    m.costReq = 0; m.blend = 0; m.value = null;
  } else {
    m.costReq = (PROFILE.input * m.inp + PROFILE.cache * m.cr + PROFILE.output * m.out) / 1e6;
    m.blend = m.costReq / TOKENS_PER_REQ * 1e6;
    m.value = (m.iq != null && m.blend > 0) ? m.iq / m.blend : null;
  }
  // estimativa só para quem não tem nota oficial
  m.iqEst = m.iq ?? (m.aa != null ? +(m.aa + AA_OFFSET).toFixed(1) : null);
});

/* req/mês por plano: número oficial quando existe, senão teto ÷ custo por requisição */
export function reqMonth(m, planKey) {
  if (m.isFree) return { n: 0, est: false };
  const pub = m.req[planKey];
  if (pub != null) return { n: pub, est: false };
  if (planKey === "goat" && m.cred > 0 && m.costReq > 0) return { n: m.cred / m.costReq, est: true };
  return null;
}

export function reqOf(m, plan) {
  if (!plan.reqKey) return null;
  const r = reqMonth(m, plan.reqKey);
  if (!r) return null;
  return { n: plan.key === "max20" ? r.n * 2 : r.n, est: r.est };
}

/* ============================ RANKINGS ============================ */
export const NO_FREE = MODELS.filter(m => !m.isFree);
export const SCORED = MODELS.filter(m => m.iq != null && m.blend > 0);
export const RANKED = MODELS.filter(m => m.value != null).sort((a, b) => b.value - a.value);

/* "Inteligente e barato": exige as DUAS pontas.
   Inteligência entra em escala linear e barateza em escala log (preço varia em
   ordens de magnitude); a combinação é a média geométrica. Barato porém fraco
   é penalizado — ao contrário do ratio puro IQ/US$, que favorece o mais barato. */
(function computeBalance() {
  const iqs = SCORED.map(m => m.iq), blends = SCORED.map(m => m.blend);
  const iqMin = Math.min(...iqs), iqMax = Math.max(...iqs);
  const bMin = Math.min(...blends), bMax = Math.max(...blends);
  const lg = Math.log;
  SCORED.forEach(m => {
    const nIq = (m.iq - iqMin) / (iqMax - iqMin);
    const nCheap = (lg(bMax) - lg(m.blend)) / (lg(bMax) - lg(bMin));
    m.balance = Math.sqrt(nIq * nCheap) * 100;
  });
  MODELS.forEach(m => { if (m.balance == null) m.balance = null; });
})();

export const BALANCED = SCORED.slice().sort((a, b) => b.balance - a.balance);
export const BALANCE_TOP = BALANCED[0];

MODELS.filter(m => m.isFree).forEach((m, i) => { m.rankLabel = "FREE" + (i + 1); });
RANKED.forEach((m, i) => { m.rankLabel = (i + 1) + "º"; });

/* ============================ TETOS ============================ */
export const CRED_MAX = Math.max(...MODELS.map(m => m.cred || 0));
export const CRED_TIERS = [...new Set(NO_FREE.filter(m => m.onGoat).map(m => m.cred))].sort((a, b) => b - a);
export const PAID_GOAT = NO_FREE.filter(m => m.onGoat);

/* ============================ SELEÇÃO ============================ */
export const byBalance = (a, b) => (b.balance ?? -1) - (a.balance ?? -1);
export const byIq = (a, b) => (b.iq ?? -1) - (a.iq ?? -1);
export const byTps = (a, b) => (b.tps ?? -1) - (a.tps ?? -1);
export const byCpr = (a, b) => a.costReq - b.costReq || (b.iq ?? -1) - (a.iq ?? -1);
export const byVolume = (a, b) => (reqMonth(b, "goat")?.n || 0) - (reqMonth(a, "goat")?.n || 0);

export const PICKS = {
  best: BALANCED[0],
  smartest: SCORED.slice().sort(byIq)[0],
  fastest: MODELS.slice().sort(byTps)[0],
  cheapest: NO_FREE.slice().sort(byCpr)[0],
  volume: MODELS.filter(m => m.onGoat).slice().sort(byVolume)[0],
  noDeal: BALANCED.filter(m => !m.isDeal)[0],
  bigBudget: MODELS.filter(m => m.cred === CRED_MAX).sort(byBalance)[0],
  premium: MODELS.filter(m => m.planRank > PLAN_RANK.goat && m.iq != null).sort(byIq)[0],
  free: MODELS.filter(m => m.isFree && m.iq != null).sort(byIq)[0]
};

export const byId = id => MODELS.find(m => m.id === id);
