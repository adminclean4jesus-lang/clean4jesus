import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const initialSeed = path.join(root, "supabase", "migrations", "20260721181600_daily_devotional_seed_v1.sql");
const writeNew = process.argv.includes("--write-new");
const requestedVersion = Number(process.env.DAILY_DEVOTIONAL_CONTENT_VERSION ?? 1);

if (!Number.isInteger(requestedVersion) || requestedVersion < 1) {
  throw new Error("DAILY_DEVOTIONAL_CONTENT_VERSION must be a positive integer");
}
if (writeNew && requestedVersion <= 1) {
  throw new Error("Set DAILY_DEVOTIONAL_CONTENT_VERSION above 1 when publishing new content");
}

function migrationTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function dollarJson(value) {
  const json = JSON.stringify(value);
  if (json.includes("$daily$")) throw new Error("Unexpected seed delimiter in content");
  return `$daily$${json}$daily$::jsonb`;
}

const locales = ["es", "en", "fr", "pt"];
const sources = {
  es: readJson("src/data/devotionals.json"),
  en: readJson("src/data/translations/devotionals.en.json"),
  fr: readJson("src/data/translations/devotionals.fr.json"),
  pt: readJson("src/data/translations/devotionals.pt.json"),
};
const required = ["id", "title", "verse", "reference", "reflection", "question", "prayer", "theme", "practice"];
const baseIds = sources.es.map((item) => item.id);

for (const locale of locales) {
  if (!Array.isArray(sources[locale]) || sources[locale].length !== baseIds.length) {
    throw new Error(`Locale ${locale} must contain ${baseIds.length} devotionals`);
  }
  for (const [index, item] of sources[locale].entries()) {
    if (item.id !== baseIds[index]) throw new Error(`Locale ${locale} has an unexpected id at position ${index + 1}`);
    for (const key of required) {
      if (typeof item[key] !== "string" || item[key].trim().length === 0) {
        throw new Error(`Locale ${locale}, ${item.id}: ${key} is required`);
      }
    }
    if (item.reflection.trim().length < 80) throw new Error(`Locale ${locale}, ${item.id}: reflection is too short`);
  }
}

const devotionalRows = sources.es.map((item, index) => ({
  content_version: requestedVersion,
  id: item.id,
  rotation_order: index + 1,
  status: "published",
  theme: item.theme,
}));
const translationRows = locales.flatMap((locale) => sources[locale].map((item) => ({
  devotional_id: item.id,
  locale,
  practice: item.practice,
  prayer: item.prayer,
  question: item.question,
  reference: item.reference,
  reflection: item.reflection,
  title: item.title,
  verse: item.verse,
})));

const sql = `-- Generated from reviewed daily devotional content. Do not edit by hand.
with rows as (
  select * from jsonb_to_recordset(${dollarJson(devotionalRows)}) as x(
    id text, theme text, status text, rotation_order integer, content_version integer
  )
)
insert into public.daily_devotionals (id, theme, status, rotation_order, content_version, published_at)
select id, theme, status, rotation_order, content_version, timezone('utc', now()) from rows
on conflict (id) do update set
  theme = excluded.theme,
  status = excluded.status,
  rotation_order = excluded.rotation_order,
  content_version = excluded.content_version,
  published_at = coalesce(public.daily_devotionals.published_at, excluded.published_at),
  updated_at = timezone('utc', now());

with rows as (
  select * from jsonb_to_recordset(${dollarJson(translationRows)}) as x(
    devotional_id text, locale text, title text, verse text, reference text,
    reflection text, question text, prayer text, practice text
  )
)
insert into public.daily_devotional_translations (
  devotional_id, locale, title, verse, reference, reflection, question, prayer, practice
)
select devotional_id, locale, title, verse, reference, reflection, question, prayer, practice from rows
on conflict (devotional_id, locale) do update set
  title = excluded.title,
  verse = excluded.verse,
  reference = excluded.reference,
  reflection = excluded.reflection,
  question = excluded.question,
  prayer = excluded.prayer,
  practice = excluded.practice;
`;

const output = writeNew
  ? path.join(root, "supabase", "migrations", `${migrationTimestamp()}_daily_devotional_seed_v${requestedVersion}.sql`)
  : initialSeed;

if (writeNew) {
  if (fs.existsSync(output)) throw new Error(`Migration already exists: ${path.relative(root, output)}`);
  fs.writeFileSync(output, sql, "utf8");
  console.log(`Generated ${path.relative(root, output)} (${devotionalRows.length} devotionals, ${translationRows.length} translations)`);
} else if (!fs.existsSync(initialSeed)) {
  fs.writeFileSync(initialSeed, sql, "utf8");
  console.log(`Generated ${path.relative(root, initialSeed)} (${devotionalRows.length} devotionals, ${translationRows.length} translations)`);
} else if (fs.readFileSync(initialSeed, "utf8") !== sql) {
  throw new Error("Reviewed daily content differs from the applied seed. Publish a new migration with DAILY_DEVOTIONAL_CONTENT_VERSION=<next> npm run content:daily:publish");
} else {
  console.log(`Verified ${path.relative(root, initialSeed)} (${devotionalRows.length} devotionals, ${translationRows.length} translations)`);
}
