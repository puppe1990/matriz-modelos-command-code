import { test } from "node:test";
import assert from "node:assert/strict";

import {
  MODELS, PLANS, PROFILE, WINDOW, AA_OFFSET, CRED_TIERS, CRED_MAX,
  PICKS, BALANCED, RANKED, SCORED,
  reqMonth, reqOf, usd, usdReq, int
} from "../src/core.js";

const byName = name => MODELS.find(m => m.n === name);

test("dataset: 70 modelos, com as contagens que a doc publica", () => {
  assert.equal(MODELS.length, 70);
  assert.equal(MODELS.filter(m => m.onGoat).length, 50);   // "GOAT plan 50"
  assert.equal(MODELS.filter(m => m.isDeal).length, 6);    // "Deals 6"
  assert.equal(MODELS.filter(m => m.isFree).length, 3);    // "Free 3"
  assert.equal(MODELS.filter(m => m.cred != null && m.onGoat && !m.isFree).length, 47);
});

test("perfil de requisição agêntica é o documentado pelo Command Code", () => {
  assert.deepEqual(PROFILE, { input: 800, cache: 50000, output: 160 });
  assert.equal(PROFILE.input + PROFILE.cache + PROFILE.output, 50960);
});

test("custo por requisição e blend seguem a fórmula do perfil", () => {
  const v4flash = byName("DeepSeek V4 Flash");
  // 800*0.15 + 50000*0.003 + 160*0.60 = 366 micro-dólares
  assert.equal(+(v4flash.costReq * 1e6).toFixed(3), 366);
  // blend = custo / 50.960 tokens * 1M
  assert.equal(+v4flash.blend.toFixed(4), 0.0072);

  const sol = byName("GPT-5.6 Sol");
  assert.equal(+(sol.costReq * 1e6).toFixed(0), 33800);
  assert.equal(+sol.blend.toFixed(4), 0.6633);
});

test("modelos grátis não têm custo, valor nem equilíbrio", () => {
  for (const m of MODELS.filter(x => x.isFree)) {
    assert.equal(m.costReq, 0, m.n);
    assert.equal(m.blend, 0, m.n);
    assert.equal(m.value, null, m.n);
    assert.equal(m.balance, null, m.n);
  }
});

test("equilíbrio: 0–100, topo no Contributor e zero no piso de IQ", () => {
  for (const m of SCORED) {
    assert.ok(m.balance >= 0 && m.balance <= 100, `${m.n}: ${m.balance}`);
  }
  assert.equal(BALANCED[0].n, "Muse Spark 1.3 Contributor");
  assert.equal(+BALANCED[0].balance.toFixed(0), 100);
  // o índice zera nas DUAS pontas: menor IQ (Haiku, 17,4) e maior custo por
  // requisição (Sol e GPT-5.5, os mais caros de rodar entre os pontuados)
  assert.deepEqual(
    BALANCED.filter(m => m.balance === 0).map(m => m.n).sort(),
    ["Claude Haiku 4.5", "GPT-5.5", "GPT-5.6 Sol"]
  );
  const maisCaro = Math.max(...SCORED.map(m => m.costReq));
  assert.equal(BALANCED.at(-1).costReq, maisCaro);
});

test("equilíbrio exige as duas pontas: barato e fraco cai em relação ao ratio puro", () => {
  const pos = (list, name) => list.findIndex(m => m.n === name) + 1;
  assert.equal(pos(RANKED, "MiMo V2.5"), 5);    // ratio puro IQ/US$
  assert.equal(pos(BALANCED, "MiMo V2.5"), 10); // equilíbrio
  assert.equal(pos(RANKED, "GLM-5.3 Flash"), 8);
  assert.equal(pos(BALANCED, "GLM-5.3 Flash"), 5);
});

test("nota estimada só existe quando falta a oficial, com o offset calibrado", () => {
  assert.equal(AA_OFFSET, 5.6);
  assert.equal(byName("DeepSeek V4.1 Flash").iq, null);
  assert.equal(byName("DeepSeek V4.1 Flash").iqEst, 45.1);   // 39.5 + 5.6
  assert.equal(byName("Claude Fable 5.1").iqEst, 59.0);      // 53.4 + 5.6
  // quem tem nota oficial usa a oficial, sem offset
  assert.equal(byName("Muse Spark 1.3").iqEst, 53.0);
  assert.equal(byName("Muse Spark 1.3").iq, 53.0);
});

test("request por mês: publicado quando existe, estimado quando não", () => {
  const pub = reqMonth(byName("DeepSeek V4 Flash"), "goat");
  assert.deepEqual(pub, { n: 154000, est: false });

  const est = reqMonth(byName("GLM-5.1"), "goat");   // fora das tabelas de req
  assert.equal(est.est, true);
  assert.ok(est.n > 0);

  // grátis não têm cota mensal (são 100/dia)
  assert.deepEqual(reqMonth(byName("LongCat 2.0"), "goat"), { n: 0, est: false });
  // plano que não serve o modelo
  assert.equal(reqMonth(byName("Claude Opus 5"), "goat"), null);
});

test("janelas de 5h e semana são 20% e 50% do teto mensal", () => {
  assert.deepEqual(WINDOW, { h5: 0.20, week: 0.50 });
  const goat = PLANS.find(p => p.key === "goat");
  const flash = reqOf(byName("DeepSeek V4 Flash"), goat);
  assert.equal(flash.n, 154000);
  assert.equal(Math.round(flash.n * WINDOW.h5), 30800);   // doc: 30.800 / 5h
  assert.equal(Math.round(flash.n * WINDOW.week), 77000); // doc: 76.900 / semana
});

test("Max 20× entrega o dobro do Max 10×", () => {
  const m = byName("Kimi K3");
  const max10 = PLANS.find(p => p.key === "max10");
  const max20 = PLANS.find(p => p.key === "max20");
  assert.equal(reqOf(m, max20).n, reqOf(m, max10).n * 2);
});

test("tetos de crédito: faixas e extremos", () => {
  assert.deepEqual(CRED_TIERS, [70, 60, 47, 40, 33, 30, 20]);
  assert.equal(CRED_MAX, 70);
  assert.deepEqual(
    MODELS.filter(m => m.cred === 70).map(m => m.n).sort(),
    ["GLM-5.2", "GPT-5.6 Sol", "Qwen 3.8 27B", "Tencent Hy3"].sort()
  );
  assert.equal(MODELS.filter(m => m.cred === 20).length, 32);
});

test("recomendações: cada critério escolhe o modelo esperado", () => {
  assert.equal(PICKS.best.n, "Muse Spark 1.3 Contributor");
  assert.equal(PICKS.smartest.n, "Muse Spark 1.3");       // maior nota oficial
  assert.equal(PICKS.fastest.n, "Gemini 3.8 Flash");
  assert.equal(PICKS.volume.n, "DeepSeek V4 Flash");
  assert.equal(PICKS.noDeal.n, "DeepSeek V4 Flash");
  assert.equal(PICKS.bigBudget.n, "Qwen 3.8 27B");        // melhor equilíbrio entre os de teto $70
  assert.equal(PICKS.free.n, "LongCat 2.0");
});

test("formatação de dinheiro: nunca menos de 2 casas, sem zero sobrando", () => {
  assert.equal(usd(0), "$0");
  assert.equal(usd(0.1), "$0.10");
  assert.equal(usd(0.15), "$0.15");
  assert.equal(usd(0.002), "$0.002");
  assert.equal(usd(0.0036), "$0.0036");
  assert.equal(usd(0.08334), "$0.083");
  assert.equal(usd(7.0325), "$7.03");
  assert.equal(usd(15), "$15.00");

  assert.equal(usdReq(0), "$0");
  assert.equal(usdReq(0.000212), "$0.000212");
  assert.equal(usdReq(0.00918), "$0.00918");
  assert.equal(usdReq(0.0338164), "$0.0338");

  assert.equal(int(154000), "154.000");
  assert.equal(int(null), "—");
});
