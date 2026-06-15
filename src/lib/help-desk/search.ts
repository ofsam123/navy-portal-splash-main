import { KB_ARTICLES, TUTORIALS } from "./seed";
import type { KBArticle, Tutorial } from "./types";

export type GlobalSearchResults = {
  articles: KBArticle[];
  tutorials: Tutorial[];
};

export function runGlobalSearch(query: string): GlobalSearchResults {
  const q = query.trim().toLowerCase();
  if (!q) return { articles: [], tutorials: [] };

  const articles = KB_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)),
  );

  const tutorials = TUTORIALS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.steps.some((s) => s.toLowerCase().includes(q)),
  );

  return { articles, tutorials };
}
