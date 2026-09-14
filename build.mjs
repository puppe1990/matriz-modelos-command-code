/* ============================================================
   Gera os partials de detalhe: uma página HTML por modelo × idioma,
   consumida pelo htmx (hx-get="/partials/<lang>/<slug>.html").
   Uso: npm run build
   ============================================================ */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { MODELS } from "./src/core.js";
import { modelPartial, slugify } from "./src/partials.js";
import { LANGS } from "./src/i18n/index.js";

export async function buildPartials(outDir = "partials") {
  let total = 0;
  for (const lang of LANGS) {
    const dir = join(outDir, lang);
    await mkdir(dir, { recursive: true });
    for (const m of MODELS) {
      await writeFile(join(dir, `${slugify(m.n)}.html`), modelPartial(m, lang), "utf8");
      total++;
    }
  }
  return total;
}

const executadoDireto = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (executadoDireto) {
  const total = await buildPartials();
  console.log(`${total} partials gerados (${MODELS.length} modelos × ${LANGS.length} idiomas)`);
}
