import { KB_ARTICLES, TUTORIALS } from "./seed";
import type { KBArticle, Tutorial } from "./types";

export function searchArticles(query: string): KBArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = KB_ARTICLES.map((a) => {
    const hay = `${a.title} ${a.excerpt} ${a.body} ${a.category} ${a.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (a.title.toLowerCase().includes(term)) score += 4;
      if (a.tags.some((t) => t.includes(term))) score += 3;
      if (a.category.toLowerCase().includes(term)) score += 2;
      if (hay.includes(term)) score += 1;
    }
    return { article: a, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((x) => x.article);
}

export function searchTutorials(query: string): Tutorial[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter((t) => t.length > 2);

  const scored = TUTORIALS.map((t) => {
    const hay = `${t.title} ${t.summary} ${t.steps.join(" ")}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (t.title.toLowerCase().includes(term)) score += 4;
      if (t.summary.toLowerCase().includes(term)) score += 2;
      if (hay.includes(term)) score += 1;
    }
    return { tutorial: t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map((x) => x.tutorial);
}

type TopicRule = {
  pattern: RegExp;
  text: string;
  search: string;
  escalate?: boolean;
};

const TOPIC_RULES: TopicRule[] = [
  {
    pattern: /forgot|reset\s+password|recover(\s+password)?|password\s+recover|\bpassword\b/,
    text: "Here’s how to recover a forgotten DDDP password, plus related guides:",
    search: "forgot password recovery",
  },
  {
    pattern: /login|sign[\s-]?in|log\s*in/,
    text: "Here’s how to sign in to DDDP. If you’re locked out, try password recovery instead.",
    search: "login sign in",
  },
  {
    pattern: /username|account|permission|access/,
    text: "These articles cover account access and permissions. If you’re locked out, try password recovery or open an Account & access ticket.",
    search: "account permissions access",
  },
  {
    pattern: /performance\s+setup|save\s+performance|indicator\s+setup/,
    text: "Performance Setup lets you pick Year, Quarter, and Indicators for a region before monitoring:",
    search: "performance setup indicators",
  },
  {
    pattern: /performance\s+monitor|assessment\s+summary|start\s+assessment|complete\s+assessment/,
    text: "Here’s guidance on Performance Monitoring and completing assessments:",
    search: "performance monitoring assessment",
  },
  {
    pattern: /performance\s+contract|ohlgs|consolidated\s+performance/,
    text: "Performance Contract (regional, district, or consolidated) works like this:",
    search: "performance contract ohlgs consolidated",
  },
  {
    pattern: /progress\s+report|annual\s+progress|\bapr\b/,
    text: "For RCC Progress Reports and the national APR Dashboard:",
    search: "annual progress report apr rcc",
  },
  {
    pattern: /\brcc\b|regional\s+coordinating|monitoring\s+indicator/,
    text: "RCC monitoring covers indicator setup and regional assessments:",
    search: "rcc monitoring indicators",
  },
  {
    pattern: /\bdpat\b/,
    text: "DPAT covers the national dashboard plus Tracker Capture programs, lists, and timeline progress updates:",
    search: "dpat dashboard tracker timeline progress",
  },
  {
    pattern: /map|coordinate|geo|location\s+pin|set\s+coordinates|event\s+layer|add\s+layer/,
    text: "Here’s how to work with Maps — site coordinates and event layers:",
    search: "maps coordinates event layer style",
  },
  {
    pattern:
      /data\s+visualizer|create\s+a?\s*chart|chart\s+type|save\s+(diagram|chart|map)|main\s+dimensions|app\s+store/,
    text: "Reporting with Data Visualizer and saving diagrams is covered here:",
    search: "data visualizer chart save diagram reporting",
  },
  {
    pattern: /enrolment|enrollment|feedback\s+widget|tracker\s+dashboard|lists\s+tab/,
    text: "The Tracker Dashboard widgets and how to open a registered project:",
    search: "tracker dashboard enrolment profile",
  },
  {
    pattern: /filter|search.*(project|program|tracker|activity)|ongoing|cancelled|terminated/,
    text: "Search and status filters for Tracker Capture lists:",
    search: "search filter lists ongoing completed",
  },
  {
    pattern: /yellow|timeline\s+data|update\s+progress|complete\s+event|progress\s+of/,
    text: "Update DPAT activity progress by completing Timeline Data Entry events:",
    search: "timeline progress complete yellow",
  },
  {
    pattern:
      /bulk\s+load|relationship|tracker\s+capture|register.*(meeting|bill|boundary|capacity|community|complaint|disaster|igf|pwd|school|permit)|meeting\s+program|annual\s+action\s+plan|igf|pwd|sanitation|street\s+naming|audit\s+issue/,
    text: "Tracker and Tracker Capture workflows are covered here:",
    search: "trackers register timeline catalog dashboard",
  },
  {
    pattern: /tracker/,
    text: "Here’s how to find, register, and manage Trackers in DDDP:",
    search: "trackers register catalog dashboard timeline",
  },
  {
    pattern: /export|report|district\s+data|dashboard/,
    text: "These knowledge base articles cover data access, reports, and dashboards:",
    search: "data report district dashboard",
  },
  {
    pattern: /ticket|support|escalat|agent|human|help\s*desk/,
    text: "I can escalate this to our support team. Open the Tickets section to submit a request, or say “create ticket” and I’ll guide you there.",
    search: "support ticket",
    escalate: true,
  },
];

function mergeById<T extends { id: string }>(primary: T[], secondary: T[], limit: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of [...primary, ...secondary]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function formatTutorialHints(tutorials: Tutorial[], heading = "Other related tutorials"): string {
  if (tutorials.length === 0) return "";
  const lines = tutorials.map((t) => `• ${t.title}`).join("\n");
  return `${heading}:\n${lines}`;
}

function formatStepsBlock(tutorial: Tutorial): string {
  const steps = tutorial.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const videoNote = tutorial.hasVideo ? " A short video is available for this tutorial." : "";
  return `Here are the steps — “${tutorial.title}”:\n\n${steps}\n\nOpen the full tutorial below for the video/PDF and to bookmark it.${videoNote}`;
}

export function getBotReply(input: string): {
  text: string;
  articles: KBArticle[];
  tutorials: Tutorial[];
  escalate: boolean;
} {
  const lower = input.toLowerCase();

  if (/^(hello|hi|hey|good\s+(morning|afternoon|evening))\b/.test(lower.trim())) {
    return {
      text: "Hello! I'm your DDDP Knowledge Hub assistant. Ask me “how to log in”, “how to set up performance monitoring”, “how to register a tracker”, or anything about Maps, Data Visualizer, RCC/APR/DPAT, and I’ll walk you through the steps.",
      articles: [],
      tutorials: [],
      escalate: false,
    };
  }

  if (/^(thanks|thank\s+you|thx|cheers)\b/.test(lower.trim())) {
    return {
      text: "You’re welcome! Ask me anything else about DDDP — I’m happy to help.",
      articles: [],
      tutorials: [],
      escalate: false,
    };
  }

  if (/ticket|support|escalat|agent|talk\s+to\s+(a\s+)?human|help\s*desk/.test(lower)) {
    return {
      text: "I can escalate this to our support team. Open the Tickets section to submit a request, or say “create ticket” and I’ll guide you there.",
      articles: searchArticles("support ticket"),
      tutorials: searchTutorials("support ticket"),
      escalate: true,
    };
  }

  let articles = searchArticles(input);
  let tutorials = searchTutorials(input);

  const rule = TOPIC_RULES.find((r) => r.pattern.test(lower));
  if (rule) {
    articles = mergeById(articles, searchArticles(rule.search), 5);
    tutorials = mergeById(tutorials, searchTutorials(rule.search), 4);
  }

  if (tutorials.length > 0) {
    const [top, ...rest] = tutorials;
    const parts = [formatStepsBlock(top)];
    if (rest.length > 0) parts.push(formatTutorialHints(rest, "Related Learning Center tutorials"));
    if (articles.length > 0)
      parts.push("Related knowledge articles are linked below — click one to open it.");
    return {
      text: parts.join("\n\n"),
      articles,
      tutorials,
      escalate: false,
    };
  }

  if (articles.length > 0) {
    const [top, ...rest] = articles;
    const parts: string[] = [];
    if (rule) parts.push(rule.text);
    parts.push(`${top.title}\n${top.body}`);
    if (rest.length > 0) {
      parts.push("More related knowledge articles are linked below — click one to open it.");
    }
    return {
      text: parts.join("\n\n"),
      articles,
      tutorials,
      escalate: Boolean(rule?.escalate),
    };
  }

  if (rule) {
    return {
      text: rule.text,
      articles: [],
      tutorials: [],
      escalate: Boolean(rule.escalate) || true,
    };
  }

  return {
    text: "I couldn’t find a confident answer in the Knowledge Hub. Try asking “how to log in”, “how to register a tracker”, “Data Visualizer”, “Maps”, or “password” — or open a support ticket.",
    articles: [],
    tutorials: [],
    escalate: true,
  };
}
