#!/usr/bin/env node
/*
 * Builds one static page per language from the root templates.
 *
 *   npm install        (once)
 *   npm run build      (after every change to texts, HTML or styles)
 *
 * - Root pages (index.html, support.html) are the English templates and
 *   are re-rendered in place, so running the build twice changes nothing.
 * - Every other language goes to /<lang>/<page>, e.g. /pl/index.html.
 * - Each page gets <html lang/dir>, a translated <title> + description,
 *   a canonical link and hreflang links to all language versions.
 * - sitemap.xml is regenerated with the same hreflang alternates.
 * Settings live in tools/i18n.config.json.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/i18n.config.json"), "utf8"));

// ---------- load dictionary ----------
function loadDict() {
  const src = fs.readFileSync(path.join(ROOT, cfg.dictionary.file), "utf8");
  const noop = () => {};
  const fakeEl = { addEventListener: noop, setAttribute: noop, getAttribute: () => null, dataset: {}, classList: { add: noop, remove: noop, toggle: noop } };
  const sandbox = {
    window: {},
    document: { addEventListener: noop, querySelectorAll: () => [], querySelector: () => null, getElementById: () => null, documentElement: fakeEl, readyState: "loading" },
    navigator: { language: "en", languages: ["en"], userAgent: "" },
    localStorage: { getItem: () => null, setItem: noop },
    location: { href: "", hash: "" },
    IntersectionObserver: function () { return { observe: noop, unobserve: noop }; },
    MutationObserver: function () { return { observe: noop }; },
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(src + "\n;globalThis.__dict = (" + cfg.dictionary.expression + ");", sandbox);
  return sandbox.__dict;
}
const DICT = loadDict();
const LANGS = cfg.languages;            // [{code, dir, locale}]
const DEF = cfg.defaultLang;
const SITE = cfg.site.replace(/\/$/, "");
const PAGES = cfg.pages;                // [{file, titleKey, descKey}]
const LOCALIZED = new Set(PAGES.map((p) => p.file));

const t = (lang, key) => {
  const d = DICT[lang] || {};
  return d[key] !== undefined ? d[key] : (DICT[DEF] || {})[key];
};
const urlOf = (lang, file) =>
  SITE + "/" + (lang === DEF ? "" : lang + "/") + (file === "index.html" ? "" : file);

// ---------- rewrite relative links for pages one folder deep ----------
const SKIP = /^(#|\/|[a-z][a-z0-9+.-]*:|\{)/i;
function relink(value) {
  if (!value || SKIP.test(value.trim())) return value;
  const m = value.match(/^([^?#]*)(.*)$/);
  const p = m[1], rest = m[2];
  if (LOCALIZED.has(p)) return (p === "index.html" ? "./" : p) + rest;
  if (p === "" ) return value;
  return "../" + value;
}
function relinkSrcset(v) {
  return v.split(",").map((part) => {
    const s = part.trim().split(/\s+/);
    s[0] = relink(s[0]);
    return s.join(" ");
  }).join(", ");
}

function render(page, lang) {
  const tpl = fs.readFileSync(path.join(ROOT, page.file), "utf8");
  const $ = cheerio.load(tpl);
  const L = LANGS.find((l) => l.code === lang);

  // drop tags from a previous build (with their indentation) so rebuilding is stable
  $("[data-gen]").each((_, el) => {
    const prev = el.prev;
    if (prev && prev.type === "text" && !prev.data.trim()) $(prev).remove();
    $(el).remove();
  });
  const headEl = $("head")[0];
  while (headEl.lastChild && headEl.lastChild.type === "text" && !headEl.lastChild.data.trim()) $(headEl.lastChild).remove();
  $("html").attr("lang", lang).attr("dir", L.dir || "ltr")
    .attr("data-static-lang", lang).attr("data-page", page.file);
  if (page.file === "index.html" && lang === DEF) $("html").attr("data-x-default", "1");
  else $("html").removeAttr("data-x-default");

  // texts
  $("[data-i18n]").each((_, el) => {
    const v = t(lang, $(el).attr("data-i18n"));
    if (v === undefined) return;
    if (cfg.dictionary.mode === "html") $(el).html(v); else $(el).text(v);
  });
  $("[data-i18n-attr]").each((_, el) => {
    const spec = $(el).attr("data-i18n-attr").trim();
    let pairs = [];
    if (spec.startsWith("{")) pairs = Object.entries(JSON.parse(spec));
    else pairs = spec.split(";").filter(Boolean).map((p) => p.split(":"));
    for (const [attr, key] of pairs) {
      const v = t(lang, key);
      if (v !== undefined) $(el).attr(attr, v);
    }
  });

  // head
  const title = t(lang, page.titleKey), desc = t(lang, page.descKey);
  if (title) { $("title").text(title); $('meta[property="og:title"]').attr("content", title); }
  if (desc) { $('meta[name="description"]').attr("content", desc); $('meta[property="og:description"]').attr("content", desc); }
  $('meta[property="og:url"]').attr("content", urlOf(lang, page.file));
  $('meta[property="og:locale"]').remove();
  const tags = [
    `<meta property="og:locale" content="${L.locale}" data-gen>`,
    `<link rel="canonical" href="${urlOf(lang, page.file)}" data-gen>`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${urlOf(l.code, page.file)}" data-gen>`),
    `<link rel="alternate" hreflang="x-default" href="${urlOf(DEF, page.file)}" data-gen>`,
  ];
  $("head").append("\n  " + tags.join("\n  ") + "\n");

  // links
  if (lang !== DEF) {
    for (const attr of ["href", "src", "action", "poster"]) {
      $(`[${attr}]`).each((_, el) => {
        if ($(el).attr("data-gen") !== undefined) return;
        $(el).attr(attr, relink($(el).attr(attr)));
      });
    }
    $("[srcset]").each((_, el) => $(el).attr("srcset", relinkSrcset($(el).attr("srcset"))));
  }

  const out = lang === DEF ? path.join(ROOT, page.file) : path.join(ROOT, lang, page.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, $.html());
}

// ---------- build ----------
let n = 0;
for (const page of PAGES) for (const l of LANGS) { render(page, l.code); n++; }

// ---------- sitemap ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const page of PAGES) {
  for (const l of LANGS) {
    urls.push(
      `  <url>\n    <loc>${urlOf(l.code, page.file)}</loc>\n    <lastmod>${today}</lastmod>\n` +
      LANGS.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${urlOf(a.code, page.file)}"/>`).join("\n") +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf(DEF, page.file)}"/>\n  </url>`
    );
  }
}
for (const f of cfg.extraSitemapPages || []) {
  urls.push(`  <url>\n    <loc>${SITE}/${f}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);
}
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);

console.log(`Built ${n} pages in ${LANGS.length} languages + sitemap.xml (${urls.length} URLs).`);
