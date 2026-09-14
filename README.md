# Matriz de Modelos & Planos — Command Code

Análise comparativa dos modelos e planos do [Command Code](https://commandcode.ai) em uma página única: preço por 1M tokens, custo real por requisição agêntica, teto de crédito por modelo, janelas de uso e índices de custo-benefício.

`index.html` é autocontido — a única dependência externa é o CDN do Tailwind.

## O que a página responde

- Qual modelo entrega mais Intelligence por dólar, com e sem deal
- Quanto custa **uma requisição típica de agente** em cada um dos 70 modelos
- Quanto do teto mensal do GOAT cada modelo consome e quantas requisições isso rende
- O que os modelos grátis valem, comparados com os vizinhos mais próximos em benchmark
- Onde estão os tetos de $70 e por que a maioria trava em $20

## Como os números são calculados

| Métrica | Fórmula |
|---|---|
| Custo por requisição | `800 input + 50.000 cache read + 160 output` (perfil documentado pela Command Code) |
| Custo por 1M (blend) | o mesmo perfil, normalizado por 1M de tokens |
| Custo-benefício | `Intelligence ÷ custo por 1M` |
| Equilíbrio (0–100) | média geométrica de inteligência (linear) e barateza (log), normalizadas — exige as duas pontas |
| Janelas 5 h / semana | 20% e 50% do teto mensal do modelo (proporção confirmada pelos números oficiais) |

**‡** marca Intelligence estimada. A tabela do plano não pontua alguns modelos, mas o catálogo publica uma versão mais nova do mesmo índice (Artificial Analysis v4.3). O offset de **5,6 pontos** foi medido em **53 modelos** presentes nas duas escalas (desvio 1,4; faixa 2,0–8,1). As estimativas entram na ordenação por Intelligence, mas ficam fora dos índices de custo-benefício e equilíbrio, que exigem nota oficial.

## Fonte dos dados

[commandcode.ai/docs](https://commandcode.ai/docs) — Pricing & Limits, planos Go/GOAT/Pro/Max e catálogo de modelos, além das páginas individuais de cada modelo. Referência: **14/set/2026**.

Preços e deals mudam com frequência; a página de uso do Studio sempre reflete o valor real cobrado por requisição.

## Rodando localmente

```bash
python3 -m http.server 8000
# abra http://127.0.0.1:8000
```

## Deploy

```bash
netlify deploy --prod --dir=.
```
