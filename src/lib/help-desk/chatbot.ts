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
    pattern: /forgot|reset\s+password|recover(\s+password)?|password\s+recover/,
    text: "Here’s how to recover a forgotten DDDP password, plus related guides:",
    search: "forgot password recovery",
  },
  {
    pattern: /login|sign[\s-]?in|username|account|permission|access|password/,
    text: "These articles cover signing in and account access. If you’re locked out, try password recovery or open an Account & access ticket.",
    search: "login account permissions password",
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
    pattern: /data\s+visualizer|create\s+a?\s*chart|chart\s+type|save\s+(diagram|chart|map)|main\s+dimensions|app\s+store/,
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
    pattern: /bulk\s+load|relationship|tracker\s+capture|register.*(meeting|bill|boundary|capacity|community|complaint|disaster|igf|pwd|school|permit)|meeting\s+program|annual\s+action\s+plan|igf|pwd|sanitation|street\s+naming|audit\s+issue/,
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

function formatTutorialHints(tutorials: Tutorial[]): string {
  if (tutorials.length === 0) return "";
  const lines = tutorials.map((t) => `• ${t.title}`).join("\n");
  return `\n\nRelated Learning Center tutorials:\n${lines}`;
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
      text: "Hello! I can help with DDDP login, Performance Setup, Trackers, Maps, Data Visualizer, and more. Ask a question or search our Knowledge Hub and Learning Center.",
      articles: [],
      tutorials: [],
      escalate: false,
    };
  }

  if (/how\s+to|tutorial|learn|training|walkthrough|step[\s-]?by[\s-]?step/.test(lower)) {
    const tutorials = searchTutorials(input);
    const articles = searchArticles(input);
    if (tutorials.length > 0 || articles.length > 0) {
      return {
        text:
          tutorials.length > 0
            ? `I found these how-to tutorials in the Learning Center:${formatTutorialHints(tutorials)}\n\nRelated knowledge articles are listed below.`
            : "I found these related knowledge articles. Check the Learning Center for step-by-step tutorials.",
        articles,
        tutorials,
        escalate: false,
      };
    }
  }

  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(lower)) {
      const articles = mergeById(searchArticles(input), searchArticles(rule.search), 5);
      const tutorials = mergeById(searchTutorials(input), searchTutorials(rule.search), 4);
      return {
        text: `${rule.text}${formatTutorialHints(tutorials)}`,
        articles,
        tutorials,
        escalate: Boolean(rule.escalate) || articles.length === 0,
      };
    }
  }

  const articles = searchArticles(input);
  const tutorials = searchTutorials(input);
  if (articles.length > 0 || tutorials.length > 0) {
    return {
      text: `I found these resources that may answer your question:${formatTutorialHints(tutorials)}`,
      articles,
      tutorials,
      escalate: false,
    };
  }

  return {
    text: "I couldn’t find a confident answer in the Knowledge Hub. Try keywords like “Data Visualizer”, “Maps”, “Timeline”, or “password” — or open a support ticket.",
    articles: [],
    tutorials: [],
    escalate: true,
  };
}
