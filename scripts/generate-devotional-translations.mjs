import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.cwd();
const languages = ["en", "fr", "pt"];
const separator = "__C4J_FIELD_SPLIT_7341__";
const outputDirectory = path.join(root, "src", "data", "translations");

async function loadPlans() {
  const sourcePath = path.join(root, "src", "data", "devotionalPlans.ts");
  const source = await fs.readFile(sourcePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function (exports, module) { ${compiled}\n})(module.exports, module);`, { module });
  return module.exports.devotionalPlans;
}

async function translateText(text, target, attempt = 0) {
  if (!text) return text;
  const query = new URLSearchParams({ client: "gtx", sl: "es", tl: target, dt: "t", q: text });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`);
  if (!response.ok) {
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
      return translateText(text, target, attempt + 1);
    }
    throw new Error(`Translation request failed (${target}): ${response.status}`);
  }
  const payload = await response.json();
  return payload[0].map((part) => part[0]).join("");
}

async function translateFields(fields, target) {
  const translated = await translateText(fields.join(`\n${separator}\n`), target);
  const parts = translated.split(separator).map((value) => value.trim());
  if (parts.length === fields.length) return parts;
  return Promise.all(fields.map((field) => translateText(field, target)));
}

async function translatePlan(plan, target) {
  const [title, subtitle, description] = await translateFields(
    [plan.title, plan.subtitle, plan.description],
    target,
  );
  const days = [];
  for (const day of plan.days) {
    const [dayTitle, verse, reflection, question, prayer, practice] = await translateFields(
      [day.title, day.verse, day.reflection, day.question, day.prayer, day.practice],
      target,
    );
    days.push({
      day: day.day,
      title: dayTitle,
      verse,
      reference: day.reference,
      reflection,
      question,
      prayer,
      practice,
    });
  }
  return { title, subtitle, description, days };
}

async function translateDevotionals(devotionals, target) {
  const result = [];
  for (const devotional of devotionals) {
    const [title, verse, reflection, question, prayer, theme, practice] = await translateFields(
      [
        devotional.title,
        devotional.verse,
        devotional.reflection,
        devotional.question,
        devotional.prayer,
        devotional.theme,
        devotional.practice,
      ],
      target,
    );
    result.push({ ...devotional, title, verse, reflection, question, prayer, theme, practice });
  }
  return result;
}

await fs.mkdir(outputDirectory, { recursive: true });
const plans = await loadPlans();
const devotionals = JSON.parse(await fs.readFile(path.join(root, "src", "data", "devotionals.json"), "utf8"));

for (const language of languages) {
  const translatedPlans = {};
  for (const plan of plans) {
    translatedPlans[plan.id] = await translatePlan(plan, language);
  }
  const translatedDevotionals = await translateDevotionals(devotionals, language);
  await fs.writeFile(
    path.join(outputDirectory, `devotionalPlans.${language}.json`),
    `${JSON.stringify(translatedPlans, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(outputDirectory, `devotionals.${language}.json`),
    `${JSON.stringify(translatedDevotionals, null, 2)}\n`,
  );
}

console.log("Generated devotional translation drafts for en, fr, and pt.");
