import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const initialSeed = path.join(root, "supabase", "migrations", "20260721143500_devotional_catalog_seed_v1.sql");
const writeNew = process.argv.includes("--write-new");
const requestedVersion = Number(process.env.DEVOTIONAL_CONTENT_VERSION ?? 1);

if (!Number.isInteger(requestedVersion) || requestedVersion < 1) {
  throw new Error("DEVOTIONAL_CONTENT_VERSION must be a positive integer");
}

if (writeNew && requestedVersion <= 1) {
  throw new Error("Set DEVOTIONAL_CONTENT_VERSION to a value greater than 1 when publishing a new migration");
}

function migrationTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

const output = writeNew
  ? path.join(root, "supabase", "migrations", `${migrationTimestamp()}_devotional_catalog_seed_v${requestedVersion}.sql`)
  : initialSeed;

function compileModule(relativePath, requireMap = {}) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const localRequire = (request) => {
    if (request in requireMap) return requireMap[request];
    if (request.endsWith(".json")) {
      const target = request.startsWith("@/")
        ? path.join(root, "src", request.slice(2))
        : path.resolve(path.dirname(filename), request);
      return JSON.parse(fs.readFileSync(target, "utf8"));
    }
    if (request.startsWith("@/") || request.startsWith("./")) return {};
    return require(request);
  };
  vm.runInNewContext(compiled, {
    exports: module.exports,
    module,
    require: localRequire,
  }, { filename });
  return module.exports;
}

function dollarJson(value) {
  const json = JSON.stringify(value);
  if (json.includes("$catalog$")) throw new Error("Unexpected seed delimiter in content");
  return `$catalog$${json}$catalog$::jsonb`;
}

const baseModule = compileModule("src/data/devotionalPlans.ts");
const basePlans = baseModule.devotionalPlans;
if (!Array.isArray(basePlans) || basePlans.length === 0) throw new Error("No devotional plans found");

const localizedModule = compileModule("src/features/i18n/localizedContent.ts", {
  "@/data/devotionalPlans": baseModule,
});
const localizePlan = localizedModule.localizePlan;
if (typeof localizePlan !== "function") throw new Error("localizePlan export not found");

const locales = ["es", "en", "fr", "pt"];
const planRows = basePlans.map((plan, index) => ({
  content_version: requestedVersion,
  icon: plan.icon,
  id: plan.id,
  sort_order: index + 1,
  status: "published",
  tone: plan.tone,
}));
const planTranslations = [];
const dayRows = [];
const dayTranslations = [];

for (const basePlan of basePlans) {
  for (const locale of locales) {
    const plan = localizePlan(basePlan, locale);
    planTranslations.push({
      description: plan.description,
      locale,
      plan_id: plan.id,
      subtitle: plan.subtitle,
      title: plan.title,
    });
    for (const day of plan.days) {
      if (locale === "es") dayRows.push({ day_number: day.day, plan_id: plan.id });
      dayTranslations.push({
        day_number: day.day,
        locale,
        plan_id: plan.id,
        practice: day.practice,
        prayer: day.prayer,
        question: day.question,
        reference: day.reference,
        reflection: day.reflection,
        title: day.title,
        verse: day.verse,
      });
    }
  }
}

const sql = `-- Generated from the reviewed local editorial package. Do not edit by hand.
with rows as (
  select * from jsonb_to_recordset(${dollarJson(planRows)}) as x(
    id text, tone text, icon text, status text, sort_order integer, content_version integer
  )
)
insert into public.devotional_plans (id, tone, icon, status, sort_order, content_version, published_at)
select id, tone, icon, status, sort_order, content_version, timezone('utc', now()) from rows
on conflict (id) do update set
  tone = excluded.tone,
  icon = excluded.icon,
  status = excluded.status,
  sort_order = excluded.sort_order,
  content_version = excluded.content_version,
  published_at = coalesce(public.devotional_plans.published_at, excluded.published_at),
  updated_at = timezone('utc', now());

with rows as (
  select * from jsonb_to_recordset(${dollarJson(planTranslations)}) as x(
    plan_id text, locale text, title text, subtitle text, description text
  )
)
insert into public.devotional_plan_translations (plan_id, locale, title, subtitle, description)
select plan_id, locale, title, subtitle, description from rows
on conflict (plan_id, locale) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description;

with rows as (
  select * from jsonb_to_recordset(${dollarJson(dayRows)}) as x(plan_id text, day_number smallint)
)
insert into public.devotional_plan_days (plan_id, day_number)
select plan_id, day_number from rows
on conflict (plan_id, day_number) do nothing;

with rows as (
  select * from jsonb_to_recordset(${dollarJson(dayTranslations)}) as x(
    plan_id text, day_number smallint, locale text, title text, verse text, reference text,
    reflection text, question text, prayer text, practice text
  )
)
insert into public.devotional_plan_day_translations (
  plan_id, day_number, locale, title, verse, reference, reflection, question, prayer, practice
)
select plan_id, day_number, locale, title, verse, reference, reflection, question, prayer, practice from rows
on conflict (plan_id, day_number, locale) do update set
  title = excluded.title,
  verse = excluded.verse,
  reference = excluded.reference,
  reflection = excluded.reflection,
  question = excluded.question,
  prayer = excluded.prayer,
  practice = excluded.practice;
`;

if (writeNew) {
  if (fs.existsSync(output)) throw new Error(`Migration already exists: ${path.relative(root, output)}`);
  fs.writeFileSync(output, sql, "utf8");
  console.log(`Generated ${path.relative(root, output)} (${planRows.length} plans, ${dayTranslations.length} localized days)`);
} else {
  if (!fs.existsSync(initialSeed)) throw new Error("Initial devotional seed migration is missing");
  const existing = fs.readFileSync(initialSeed, "utf8");
  if (existing !== sql) {
    throw new Error("Reviewed devotional source differs from the applied seed. Publish a new migration with DEVOTIONAL_CONTENT_VERSION=<next> npm run content:devotional:publish");
  }
  console.log(`Verified ${path.relative(root, initialSeed)} (${planRows.length} plans, ${dayTranslations.length} localized days)`);
}
