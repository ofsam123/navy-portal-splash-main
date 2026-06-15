export type UserRole = "visitor" | "admin";

export type HelpSection =
  | "home"
  | "search"
  | "dashboard"
  | "knowledge"
  | "learning"
  | "chatbot"
  | "tickets"
  | "messages"
  | "notifications"
  | "users";

export type ArticleType = "article" | "manual" | "faq" | "guide";

export type KBArticle = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  type: ArticleType;
};

export type Tutorial = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  hasVideo: boolean;
  downloadable: boolean;
};

export type TicketPriority = "low" | "medium" | "high";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type Ticket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  submittedBy: string;
  submittedEmail?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  at: string;
  articleIds?: string[];
};

export type ThreadMessage = {
  id: string;
  from: "visitor" | "admin";
  text: string;
  at: string;
};

export type Notification = {
  id: string;
  type: "ticket" | "message" | "system";
  title: string;
  body: string;
  read: boolean;
  at: string;
};

export type UserProfile = {
  name: string;
  email: string;
  role: UserRole;
};

export type HelpDeskState = {
  user: UserProfile;
  tickets: Ticket[];
  thread: ThreadMessage[];
  notifications: Notification[];
  chat: ChatMessage[];
  kbViews: Record<string, number>;
};
