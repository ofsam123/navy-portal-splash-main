import { KB_ARTICLES } from "./seed";
import type { KBArticle } from "./types";

export function searchArticles(query: string): KBArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return KB_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)),
  ).slice(0, 5);
}

export function getBotReply(input: string): { text: string; articles: KBArticle[]; escalate: boolean } {
  const lower = input.toLowerCase();

  if (/hello|hi|hey/.test(lower)) {
    return {
      text: "Hello! I can search our knowledge base, suggest guides, or help you open a support ticket. What do you need?",
      articles: [],
      escalate: false,
    };
  }

  if (/ticket|support|escalat|agent|human/.test(lower)) {
    return {
      text: "I can escalate this to our support team. Open the Tickets section to submit a request, or say “create ticket” and I’ll guide you there.",
      articles: searchArticles("support"),
      escalate: true,
    };
  }

  if (/login|sign in|password|account/.test(lower)) {
    const articles = searchArticles("account login permissions");
    return {
      text: "Here are articles about accounts and access. If this doesn’t help, submit a ticket under Account & access.",
      articles,
      escalate: articles.length === 0,
    };
  }

  if (/data|report|district|export/.test(lower)) {
    const articles = searchArticles("data report district");
    return {
      text: "These knowledge base articles cover data access and reports:",
      articles,
      escalate: false,
    };
  }

  const articles = searchArticles(input);
  if (articles.length > 0) {
    return {
      text: "I found these articles that may answer your question:",
      articles,
      escalate: false,
    };
  }

  return {
    text: "I couldn’t find a confident answer. Would you like to message support or create a ticket?",
    articles: [],
    escalate: true,
  };
}
