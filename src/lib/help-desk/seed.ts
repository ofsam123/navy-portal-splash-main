import type { KBArticle, Tutorial } from "./types";

export const KB_ARTICLES: KBArticle[] = [
  {
    id: "kb-1",
    title: "Getting started with the DDDP Portal Hub",
    excerpt: "How to choose the right portal and what each destination offers.",
    category: "Getting Started",
    tags: ["portal", "navigation", "overview"],
    type: "guide",
    body: "The Portal Hub connects you to the DDDP Frontend, Backend, and Public Portal. Select the card that matches your role. Each link opens in a new tab so you can return to the hub at any time.",
  },
  {
    id: "kb-2",
    title: "Accessing district development data",
    excerpt: "Where to find official district-level datasets and reports.",
    category: "Data Access",
    tags: ["data", "districts", "reports"],
    type: "article",
    body: "Use the DDDP Frontend for interactive dashboards. The Public Portal publishes datasets intended for citizens and partners. Authorised staff should use the Backend for data management tasks.",
  },
  {
    id: "kb-3",
    title: "User account and permissions FAQ",
    excerpt: "Common questions about roles, login, and access requests.",
    category: "FAQ",
    tags: ["accounts", "permissions", "faq"],
    type: "faq",
    body: "Q: Who can access the Backend?\nA: Only authorised MLGRD and partner administrators.\n\nQ: Do I need an account for the Public Portal?\nA: Many resources are open; some reports may require registration.",
  },
  {
    id: "kb-4",
    title: "DDDP Frontend user manual",
    excerpt: "Navigation, dashboards, exports, and saved views.",
    category: "Manuals",
    tags: ["frontend", "manual", "dashboard"],
    type: "manual",
    body: "After signing in, use the left menu to open District Overview, Indicators, and Reports. Export tables via the download icon. Bookmark frequent views from the star menu.",
  },
  {
    id: "kb-5",
    title: "Submitting a support request",
    excerpt: "How to open tickets and what information to include.",
    category: "Support",
    tags: ["tickets", "support"],
    type: "guide",
    body: "Open Help Desk → Tickets, describe the issue clearly, and pick a category. Include screenshots or error messages when possible. You will receive in-app notifications when status changes.",
  },
  {
    id: "kb-6",
    title: "Data quality and validation",
    excerpt: "Understanding validation rules and correction workflows.",
    category: "Data Access",
    tags: ["validation", "quality"],
    type: "article",
    body: "The platform applies validation rules before publishing district indicators. Backend users can review flagged records and approve corrections through the validation queue.",
  },
];

export const TUTORIALS: Tutorial[] = [
  {
    id: "tut-1",
    title: "How to log in to DDDP Frontend",
    summary: "Step-by-step sign-in for first-time users.",
    hasVideo: true,
    downloadable: true,
    steps: [
      "Open the DDDP Frontend card from the Portal Hub.",
      "Click Sign in and enter your organisation email.",
      "Complete MFA if prompted.",
      "Land on the District Overview dashboard.",
    ],
  },
  {
    id: "tut-2",
    title: "How to export a district report",
    summary: "Download PDF and spreadsheet exports from the frontend.",
    hasVideo: false,
    downloadable: true,
    steps: [
      "Navigate to Reports in the frontend menu.",
      "Filter by district and reporting period.",
      "Click Export and choose PDF or Excel.",
      "Save the file to your device.",
    ],
  },
  {
    id: "tut-3",
    title: "How to submit a help desk ticket",
    summary: "Create and track support requests from this Help Desk.",
    hasVideo: true,
    downloadable: false,
    steps: [
      "Go to Help Desk → Tickets.",
      "Fill in subject, category, and description.",
      "Set priority and submit.",
      "Track status on the same page.",
    ],
  },
  {
    id: "tut-4",
    title: "How to search the knowledge base",
    summary: "Find articles, FAQs, and manuals quickly.",
    hasVideo: false,
    downloadable: false,
    steps: [
      "Open Knowledge Base from the sidebar.",
      "Type keywords in the search box.",
      "Filter by category or tag.",
      "Open an article to read the full guide.",
    ],
  },
];

export const TICKET_CATEGORIES = [
  "Account & access",
  "Data & reports",
  "Technical issue",
  "Training request",
  "Other",
] as const;
