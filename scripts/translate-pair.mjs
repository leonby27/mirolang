#!/usr/bin/env node
/**
 * MiroLang — bulk translator for content-language pairs.
 *
 * Reads the canonical RU/EN dataset in `src/data.js`, fills in missing
 * translations in `src/data/<lang>.js` via the Claude API, and writes the
 * merged file back. Idempotent: levels that already have a full word list
 * are skipped, so the script is safe to re-run after interruption.
 *
 * Usage:
 *   1. Add ANTHROPIC_API_KEY=sk-ant-... to a `.env` file at the repo root.
 *   2. Install deps once: `npm install --save-dev @anthropic-ai/sdk dotenv`
 *   3. Run: `node scripts/translate-pair.mjs de`
 *
 * Supported target languages: de, nl, es, fr, it, pt-BR, sv, ja, ko, tr, vi.
 * Add an entry to LANG_NAMES below to extend.
 *
 * Cost estimate (Sonnet 4.6, prompt caching enabled):
 *   ~6,600 words × ~50 tokens per word = ~330K tokens billed.
 *   System-prompt cache hits should bring effective cost to ~$3-6 per pair.
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_PATH = path.join(ROOT, 'src', 'data.js');

const LANG_NAMES = {
  de: 'German',
  nl: 'Dutch',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  'pt-BR': 'Brazilian Portuguese',
  sv: 'Swedish',
  ja: 'Japanese',
  ko: 'Korean',
  tr: 'Turkish',
  vi: 'Vietnamese',
};

const BATCH_SIZE = 50; // words per API request

// ---------- CLI ----------

const TARGET_LANG = process.argv[2];
if (!TARGET_LANG || !LANG_NAMES[TARGET_LANG]) {
  console.error('Usage: node scripts/translate-pair.mjs <lang>');
  console.error('Supported:', Object.keys(LANG_NAMES).join(', '));
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Add it to .env at repo root.');
  process.exit(1);
}

const langName = LANG_NAMES[TARGET_LANG];
const TARGET_PATH = path.join(ROOT, 'src', 'data', `${TARGET_LANG}.js`);

// ---------- File I/O ----------

/**
 * Read a `src/data.js`-style module as text and evaluate the array literal.
 * Used because the project ships these files as ES modules (`export default
 * [...]`) but isn't configured as `"type": "module"`, so `import()` from this
 * .mjs script would treat them as CommonJS and choke on the `export` keyword.
 */
async function loadJsModule(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  const marker = 'export default';
  const idx = text.indexOf(marker);
  if (idx === -1) throw new Error(`'export default' not found in ${filePath}`);
  const body = text.slice(idx + marker.length).replace(/;\s*$/, '');
  return new Function(`return ${body}`)();
}

async function writeTargetModule(filePath, data) {
  const header = `/**
 * MiroLang data — ${langName} (${TARGET_LANG}) → EN pair.
 *
 * Auto-generated/updated by scripts/translate-pair.mjs.
 * Mirrors the module/level structure of \`src/data.js\` (RU → EN).
 *
 * TECH DEBT: translations live in a field called \`ru\` (rather than
 * \`${TARGET_LANG}\` or \`translation\`) so existing screens that read
 * \`word.ru\` keep working without a sweeping refactor. Rename globally when
 * adding a third source language.
 */

`;
  // Plain JSON stringification produces valid JS (quoted keys are fine).
  const body = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, header + 'export default ' + body + ';\n');
}

// ---------- Anthropic client ----------

const client = new Anthropic();

const SYSTEM_PROMPT = `You are translating English vocabulary words into ${langName} for a mobile flashcard app. Translations appear next to the English word and must help an intermediate learner memorize the meaning.

Strict rules:
1. Output exactly one common, natural ${langName} translation per word.
2. Keep translations short — 1-3 words. Prefer single words. Never include parenthetical context, alternative meanings, or "or".
3. For nouns, include the definite article in the conventional dictionary form:
   - German: "der/die/das" before the noun (e.g. "der Tag", "die Frau", "das Jahr").
   - Dutch: "de/het" before the noun.
   - French: "le/la/l'" before the noun.
   - Spanish: "el/la" before the noun.
   - Italian: "il/lo/la/l'" before the noun.
   - Portuguese (Brazilian): "o/a" before the noun.
   - Swedish: "en/ett" before the noun.
   - Languages without definite-article gender (Japanese, Korean, Turkish, Vietnamese): no article.
4. For verbs, give the infinitive form (German "haben", French "avoir", Spanish "tener", Japanese dictionary form "持つ", etc.) unless the English word is a finite form that clearly demands one (e.g. "is", "was", "had").
5. For pronouns, give the equivalent pronoun. Mark plural/case where ambiguous, e.g. German "sie (Pl.)" for plural "they", "sie (Akk.)" for accusative "them".
6. For function words (articles, prepositions, conjunctions), give the most common direct equivalent.
7. If the English word has several common meanings, pick the most frequent one. Do not list alternatives.
8. Never include the English word, transliteration, IPA, or romanization in the translation.
9. Never add commentary, explanations, or notes.

Output format: return a JSON object with a single key "translations" whose value is an object mapping each input id (as a string) to its ${langName} translation (a string).`;

// JSON Schema for guaranteed structured output.
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    translations: {
      type: 'object',
      additionalProperties: {type: 'string'},
    },
  },
  required: ['translations'],
  additionalProperties: false,
};

async function translateBatch(words, levelTitle) {
  const list = words.map(w => `${w.id}: ${w.word}`).join('\n');
  const userMsg = `Translate these English words to ${langName}.

Source level: "${levelTitle}" — frequency-sorted English vocabulary at this level.

Words:
${list}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    // Top-level cache_control caches the last cacheable block (the system
    // prompt). After the first request the system prefix is served from
    // cache at ~0.1× the input price.
    cache_control: {type: 'ephemeral'},
    system: SYSTEM_PROMPT,
    messages: [{role: 'user', content: userMsg}],
    output_config: {
      format: {type: 'json_schema', schema: OUTPUT_SCHEMA},
    },
  });

  // With output_config.format the model returns a single text block whose
  // content is the JSON document validated against the schema.
  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No text block in response');
  const parsed = JSON.parse(textBlock.text);

  // Log cache effectiveness so the user can see savings accrue.
  const u = response.usage || {};
  const cached = u.cache_read_input_tokens || 0;
  const written = u.cache_creation_input_tokens || 0;
  const fresh = u.input_tokens || 0;
  console.log(
    `    tokens — fresh: ${fresh}, cache write: ${written}, cache read: ${cached}, output: ${u.output_tokens || 0}`,
  );

  return parsed.translations;
}

// ---------- Diff / merge ----------

function levelNeedsWork(sourceLevel, targetLevel) {
  if (!targetLevel) return true;
  if (!Array.isArray(targetLevel.words)) return true;
  if (targetLevel.words.length !== sourceLevel.words.length) return true;
  return targetLevel.words.some(
    w => !w || typeof w.ru !== 'string' || w.ru.length === 0,
  );
}

function findLevel(target, moduleId, levelId) {
  const mod = target.find(m => m.id === moduleId);
  if (!mod) return null;
  return mod.data.find(l => l.id === levelId) || null;
}

// ---------- Main ----------

async function main() {
  const source = await loadJsModule(SOURCE_PATH);

  let target;
  try {
    target = await loadJsModule(TARGET_PATH);
    console.log(`Loaded existing ${TARGET_PATH}`);
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(`No existing ${TARGET_LANG}.js — starting from source skeleton.`);
      target = JSON.parse(JSON.stringify(source));
      // Wipe word translations; titles will be filled in below.
      for (const m of target) for (const l of m.data) l.words = [];
    } else {
      throw e;
    }
  }

  let totalTranslated = 0;
  let totalSkipped = 0;

  for (const sourceModule of source) {
    for (const sourceLevel of sourceModule.data) {
      const targetLevel = findLevel(target, sourceModule.id, sourceLevel.id);

      if (!levelNeedsWork(sourceLevel, targetLevel)) {
        console.log(
          `[skip] Module ${sourceModule.id} / Level ${sourceLevel.id} "${sourceLevel.title}" — already complete (${sourceLevel.words.length} words).`,
        );
        totalSkipped += sourceLevel.words.length;
        continue;
      }

      console.log(
        `[work] Module ${sourceModule.id} / Level ${sourceLevel.id} "${sourceLevel.title}" — ${sourceLevel.words.length} words`,
      );

      const translatedWords = [];
      for (let i = 0; i < sourceLevel.words.length; i += BATCH_SIZE) {
        const batch = sourceLevel.words.slice(i, i + BATCH_SIZE);
        console.log(`  batch ${i}-${i + batch.length - 1}...`);
        let translations;
        try {
          translations = await translateBatch(batch, sourceLevel.title);
        } catch (e) {
          if (e instanceof Anthropic.RateLimitError) {
            console.error('  rate-limited — SDK already retried. Aborting.');
          } else if (e instanceof Anthropic.APIError) {
            console.error(`  API error ${e.status}: ${e.message}`);
          } else {
            console.error('  unexpected error:', e);
          }
          throw e;
        }

        for (const w of batch) {
          const tr = translations[String(w.id)];
          if (typeof tr !== 'string' || !tr.length) {
            throw new Error(
              `Missing translation for id ${w.id} (${w.word}) in level ${sourceLevel.id}`,
            );
          }
          translatedWords.push({
            id: w.id,
            word: w.word,
            ru: tr,
            transcription: w.transcription,
          });
        }
      }

      // Write the level into the target structure in-place.
      if (!findLevel(target, sourceModule.id, sourceLevel.id)) {
        // Module/level missing entirely — clone from source skeleton.
        let mod = target.find(m => m.id === sourceModule.id);
        if (!mod) {
          mod = {id: sourceModule.id, title: sourceModule.title, data: []};
          target.push(mod);
        }
        mod.data.push({
          id: sourceLevel.id,
          title: sourceLevel.title,
          description: sourceLevel.description,
          words: translatedWords,
        });
      } else {
        const lvl = findLevel(target, sourceModule.id, sourceLevel.id);
        lvl.words = translatedWords;
        // Preserve existing title/description if already translated; only
        // fall back to source RU when missing.
        if (!lvl.title) lvl.title = sourceLevel.title;
        if (!lvl.description) lvl.description = sourceLevel.description;
      }

      // Persist after each level so an interruption doesn't lose progress.
      await writeTargetModule(TARGET_PATH, target);
      totalTranslated += translatedWords.length;
      console.log(`  wrote ${translatedWords.length} translations -> ${TARGET_PATH}`);
    }
  }

  console.log('\nDone.');
  console.log(`  translated this run: ${totalTranslated}`);
  console.log(`  already complete:    ${totalSkipped}`);
  console.log(`  output:              ${TARGET_PATH}`);
}

main().catch(err => {
  console.error('\nFatal:', err.message || err);
  process.exit(1);
});
