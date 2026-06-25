import { useMemo, useState, useEffect, type FormEvent } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  Download,
  GraduationCap,
  MessageSquare,
  Search,
  Send,
  Ticket,
  Users,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getBotReply } from "@/lib/help-desk/chatbot";
import { runGlobalSearch } from "@/lib/help-desk/search";
import { KB_ARTICLES, TICKET_CATEGORIES, TUTORIALS } from "@/lib/help-desk/seed";
import { notificationForRole, useHelpDesk } from "@/lib/help-desk/store";
import type { HelpSection, KBArticle, Notification, TicketPriority, TicketStatus, UserRole } from "@/lib/help-desk/types";
import { cn } from "@/lib/utils";
import { TutorialPlayer } from "@/components/help-desk/tutorial-player";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DashboardSection() {
  const { state, isAdmin, broadcastEducationalAlert } = useHelpDesk();
  const open = state.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const closed = state.tickets.filter((t) => t.status === "closed" || t.status === "resolved").length;
  const kbTotal = Object.values(state.kbViews).reduce((a, b) => a + b, 0);
  const clientMessages = state.thread.filter((m) => m.from === "client").length;
  const topArticles = Object.entries(state.kbViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, views]) => ({ article: KB_ARTICLES.find((a) => a.id === id), views }))
    .filter((x) => x.article);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard"
        description={
          isAdmin
            ? "Receive and manage client tickets, messages, and platform activity."
            : "Find answers in the knowledge hub, chat with the assistant, or reach admin support."
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open tickets" value={String(open)} />
        <Stat label="Closed tickets" value={String(closed)} />
        {isAdmin ? (
          <Stat label="Client messages" value={String(clientMessages)} />
        ) : (
          <Stat label="KB article views" value={String(kbTotal)} />
        )}
        <Stat label="Unread alerts" value={String(state.notifications.filter((n) => !n.read).length)} />
      </div>
      {isAdmin && open > 0 && (
        <Panel>
          <h3 className="text-sm font-semibold text-foreground mb-3">Incoming requests</h3>
          <ul className="space-y-2">
            {state.tickets
              .filter((t) => t.status === "open" || t.status === "in_progress")
              .slice(0, 5)
              .map((t) => (
                <li key={t.id} className="text-sm">
                  <span className="text-foreground font-medium">{t.subject}</span>
                  <span className="text-muted-foreground"> — from {t.submittedBy}</span>
                </li>
              ))}
          </ul>
        </Panel>
      )}
      <Panel>
        <h3 className="text-sm font-semibold text-foreground mb-3">Popular knowledge base articles</h3>
        {topArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No views yet. Browse the Knowledge Base to get started.</p>
        ) : (
          <ul className="space-y-2">
            {topArticles.map(({ article, views }) => (
              <li key={article!.id} className="flex justify-between text-sm text-muted-foreground">
                <span className="text-foreground">{article!.title}</span>
                <span>{views} views</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel>
        <h3 className="text-sm font-semibold text-foreground mb-3">Response time (demo)</h3>
        <p className="text-sm text-muted-foreground">
          Average first response: <span className="text-foreground font-medium">under 4 hours</span> on
          business days. Live analytics connect when your organisation enables the backend API.
        </p>
      </Panel>
      {isAdmin && (
        <Panel>
          <h3 className="text-sm font-semibold text-foreground mb-2">Educational alerts</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Notify clients about system updates or new features. Alerts can include short instructional
            videos from the Learning Center.
          </p>
          <div className="flex flex-wrap gap-2">
            {TUTORIALS.filter((t) => t.hasVideo && t.videoUrl).map((tutorial) => (
              <Button
                key={tutorial.id}
                type="button"
                size="sm"
                className="help-desk-action-btn"
                onClick={() =>
                  broadcastEducationalAlert(
                    tutorial.id,
                    `We've updated the platform. Watch "${tutorial.title}" to see what's new.`,
                  )
                }
              >
                <Video className="h-3.5 w-3.5 mr-1.5" />
                Alert: {tutorial.title}
              </Button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

export function ClientHomeSection({
  onNavigate,
}: {
  onNavigate: (section: HelpSection) => void;
}) {
  const { state } = useHelpDesk();
  const [videoAlert, setVideoAlert] = useState<Notification | null>(null);
  const latestEducational = state.notifications.find(
    (n) =>
      n.type === "educational" &&
      !n.read &&
      notificationForRole(n, state.user.role) &&
      n.videoUrl,
  );

  const quickLinks = [
    {
      label: "Knowledge Base",
      desc: "Articles, manuals, FAQs, and guides",
      section: "knowledge" as const,
      icon: BookOpen,
    },
    {
      label: "How-To Center",
      desc: "Step-by-step tutorials and training",
      section: "learning" as const,
      icon: GraduationCap,
    },
    {
      label: "AI Assistant",
      desc: "Get instant answers from our chatbot",
      section: "chatbot" as const,
      icon: Bot,
    },
    {
      label: "Contact Support",
      desc: "Open a ticket or message admin",
      section: "tickets" as const,
      icon: Ticket,
    },
  ];

  return (
    <div className="space-y-10 pb-8">
      {latestEducational && (
        <Alert className="max-w-3xl mx-auto border-accent/30 bg-accent/5">
          <GraduationCap className="h-4 w-4" />
          <AlertTitle>{latestEducational.title}</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{latestEducational.body}</span>
            <div className="flex gap-2 shrink-0">
              {latestEducational.videoUrl && (
                <Button
                  type="button"
                  size="sm"
                  className="help-desk-action-btn"
                  onClick={() => setVideoAlert(latestEducational)}
                >
                  <Video className="h-3.5 w-3.5 mr-1.5" />
                  {latestEducational.ctaLabel ?? "Watch video"}
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                className="help-desk-action-btn"
                onClick={() => onNavigate("notifications")}
              >
                View alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="help-desk-hero max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          DDDP Knowledge Hub
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          How can we help you today?
        </h2>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Search documentation, follow tutorials, or reach our support team — all in one place.
          Use the search bar at the top from any page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
        {quickLinks.map(({ label, desc, section, icon: Icon }) => (
          <button
            key={section}
            type="button"
            onClick={() => onNavigate(section)}
            className="help-desk-quick-link group"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.45_0.14_250/0.1)] text-accent">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <h3 className="text-sm font-semibold text-foreground mb-3">Popular topics</h3>
        <ul className="help-desk-panel divide-y divide-[var(--help-border)] overflow-hidden">
          {KB_ARTICLES.slice(0, 4).map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onNavigate("knowledge")}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[oklch(0.45_0.14_250/0.05)] transition-colors"
              >
                <span className="font-medium text-foreground">{a.title}</span>
                <span className="block text-muted-foreground text-xs mt-0.5">{a.excerpt}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {videoAlert?.videoUrl && (
        <TutorialPlayer
          open={!!videoAlert}
          onOpenChange={(open) => !open && setVideoAlert(null)}
          title={videoAlert.title}
          description={videoAlert.body}
          videoUrl={videoAlert.videoUrl}
        />
      )}
    </div>
  );
}

export function GlobalSearchSection({
  query,
  onOpenArticle,
}: {
  query: string;
  onOpenArticle?: () => void;
}) {
  const { recordKbView } = useHelpDesk();
  const [selected, setSelected] = useState<KBArticle | null>(null);
  const results = useMemo(() => runGlobalSearch(query), [query]);

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="-ml-2">
          ← Back to search results
        </Button>
        <article className="help-desk-panel p-5 md:p-6">
          <Badge variant="secondary" className="mb-2">
            {selected.category}
          </Badge>
          <h2 className="text-xl font-semibold text-foreground">{selected.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {selected.body}
          </p>
        </article>
      </div>
    );
  }

  const total = results.articles.length + results.tutorials.length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Search results"
        description={
          query.trim()
            ? `Showing matches for “${query.trim()}” across the knowledge hub.`
            : "Type in the search bar above to find articles and tutorials."
        }
      />

      {!query.trim() ? (
        <p className="text-sm text-muted-foreground">
          Use the global search in the header — it works on every page and tab.
        </p>
      ) : total === 0 ? (
        <p className="text-sm text-muted-foreground help-desk-panel p-4">
          No results found. Try different keywords or open Support to ask admin.
        </p>
      ) : (
        <>
          {results.articles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Knowledge Base ({results.articles.length})
              </h3>
              <ul className="help-desk-panel divide-y divide-[var(--help-border)] overflow-hidden">
                {results.articles.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        recordKbView(a.id);
                        setSelected(a);
                        onOpenArticle?.();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[oklch(0.72_0.15_230/0.06)] transition-colors"
                    >
                      <span className="font-medium text-foreground">{a.title}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{a.excerpt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.tutorials.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                How-To Tutorials ({results.tutorials.length})
              </h3>
              <ul className="space-y-3">
                {results.tutorials.map((t) => (
                  <li key={t.id} className="help-desk-panel p-4">
                    <p className="font-medium text-foreground">{t.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.summary}</p>
                    <ol className="mt-3 list-decimal list-inside text-sm text-muted-foreground space-y-1">
                      {t.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function KnowledgeBaseSection({ initialQuery = "" }: { initialQuery?: string }) {
  const { recordKbView } = useHelpDesk();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<KBArticle | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const categories = useMemo(
    () => ["all", ...new Set(KB_ARTICLES.map((a) => a.category))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return KB_ARTICLES.filter((a) => {
      const matchCat = category === "all" || a.category === category;
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q));
      return matchCat && matchQ;
    });
  }, [query, category]);

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="-ml-2">
          ← Back to articles
        </Button>
        <article className="help-desk-panel p-5 md:p-6">
          <Badge variant="secondary" className="mb-2">
            {selected.category}
          </Badge>
          <h2 className="text-xl font-semibold text-foreground">{selected.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {selected.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Knowledge Base"
        description="Articles, manuals, guides, FAQs, and searchable documentation."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles, tags, FAQs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-background/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ul className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden help-desk-panel">
        {filtered.length === 0 ? (
          <li className="p-6 text-sm text-muted-foreground">No articles match your search.</li>
        ) : (
          filtered.map((article) => (
            <li key={article.id}>
              <button
                type="button"
                onClick={() => {
                  recordKbView(article.id);
                  setSelected(article);
                }}
                className="w-full text-left px-4 py-3 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{article.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{article.excerpt}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize">
                    {article.type}
                  </Badge>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function LearningCenterSection({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ title: string; summary: string; url: string } | null>(
    null,
  );

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const filtered = TUTORIALS.filter(
    (t) =>
      !query.trim() ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.summary.toLowerCase().includes(query.toLowerCase()) ||
      t.steps.some((s) => s.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        title="How-To Learning Center"
        description='Search "How To" tutorials, videos, and downloadable training materials.'
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder='Search how-to content…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-background/50"
        />
      </div>
      <ul className="space-y-3">
        {filtered.map((tut) => (
          <li key={tut.id} className="help-desk-panel">
            <button
              type="button"
              className="w-full text-left p-4"
              onClick={() => setExpanded(expanded === tut.id ? null : tut.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{tut.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tut.summary}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {tut.hasVideo && (
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <Video className="h-3.5 w-3.5" /> Video
                    </span>
                  )}
                  {tut.downloadable && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </span>
                  )}
                </div>
              </div>
            </button>
            {expanded === tut.id && (
              <div className="border-t border-border/30 px-4 pb-4 pt-3 space-y-3">
                {tut.hasVideo && tut.videoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    className="help-desk-action-btn"
                    onClick={() =>
                      setActiveVideo({ title: tut.title, summary: tut.summary, url: tut.videoUrl! })
                    }
                  >
                    <Video className="h-3.5 w-3.5 mr-1.5" />
                    Watch tutorial{tut.videoDuration ? ` (${tut.videoDuration})` : ""}
                  </Button>
                )}
                <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                  {tut.steps.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </li>
        ))}
      </ul>

      {activeVideo && (
        <TutorialPlayer
          open={!!activeVideo}
          onOpenChange={(open) => !open && setActiveVideo(null)}
          title={activeVideo.title}
          description={activeVideo.summary}
          videoUrl={activeVideo.url}
        />
      )}
    </div>
  );
}

export function ChatbotSection({ onGoTickets }: { onGoTickets: () => void }) {
  const { state, addChatMessage } = useHelpDesk();
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    addChatMessage({ role: "user", text });
    setInput("");
    const reply = getBotReply(text);
    addChatMessage({
      role: "bot",
      text: reply.text,
      articleIds: reply.articles.map((a) => a.id),
    });
    if (reply.escalate) onGoTickets();
  };

  return (
    <div className="space-y-4 flex flex-col h-[min(70vh,640px)]">
      <SectionHeader
        title="AI Chatbot"
        description="Answers common questions, searches the knowledge base, and escalates to support."
      />
      <div className="help-desk-panel flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.chat.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                msg.role === "user"
                  ? "ml-auto bg-accent/20 text-foreground"
                  : "bg-muted/30 text-muted-foreground",
              )}
            >
              <p>{msg.text}</p>
              {msg.articleIds && msg.articleIds.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-border/30 pt-2">
                  {msg.articleIds.map((id) => {
                    const a = KB_ARTICLES.find((x) => x.id === id);
                    return a ? (
                      <li key={id} className="text-xs text-accent">
                        → {a.title}
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about portals, data, accounts…"
            className="bg-background/50"
          />
          <Button type="button" size="icon" onClick={send} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TicketsSection() {
  const { state, addTicket, updateTicketStatus, isAdmin } = useHelpDesk();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(TICKET_CATEGORIES[0]);
  const [priority, setPriority] = useState<TicketPriority>("medium");

  const visibleTickets = isAdmin
    ? state.tickets
    : state.tickets.filter(
        (t) =>
          t.submittedBy === state.user.name ||
          (!!state.user.email && t.submittedEmail === state.user.email),
      );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    addTicket({
      subject,
      description,
      category,
      priority,
      submittedBy: state.user.name,
      submittedEmail: state.user.email || undefined,
    });
    setSubject("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Help Desk / Ticketing"
        description={
          isAdmin
            ? "Receive client support requests, assign priority, and update ticket status."
            : "Submit a support request and track its status."
        }
      />
      {!isAdmin && (
      <form onSubmit={submit} className="help-desk-panel p-4 md:p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">New support request</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>
        </div>
        <Button type="submit">Submit ticket</Button>
      </form>
      )}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {isAdmin ? "All client tickets" : "Your tickets"}
        </h3>
        {visibleTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "No client tickets yet." : "No tickets yet."}
          </p>
        ) : (
          <ul className="divide-y divide-border/40 border border-border/40 rounded-xl help-desk-panel overflow-hidden">
            {visibleTickets.map((t) => (
              <li key={t.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{t.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAdmin && <span className="text-foreground/80">{t.submittedBy} · </span>}
                    {t.category} · {t.priority} · {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin ? (
                  <Select value={t.status} onValueChange={(v) => updateTicketStatus(t.id, v as TicketStatus)}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="capitalize w-fit">
                    {t.status.replace("_", " ")}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function MessagingSection() {
  const { state, sendThreadMessage, isAdmin } = useHelpDesk();
  const [text, setText] = useState("");

  const isOwnMessage = (from: "client" | "admin") =>
    (isAdmin && from === "admin") || (!isAdmin && from === "client");

  return (
    <div className="space-y-4 flex flex-col h-[min(70vh,640px)]">
      <SectionHeader
        title="Internal Messaging"
        description={
          isAdmin
            ? "Receive client messages and reply as admin."
            : "Send messages to admin support. Replies appear in this thread."
        }
      />
      <div className="help-desk-panel flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.thread.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "No client messages yet."
                : "No messages yet. Ask admin a question to get started."}
            </p>
          ) : (
            state.thread.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  isOwnMessage(m.from)
                    ? "ml-auto bg-accent/20 text-foreground"
                    : "bg-muted/30 text-muted-foreground",
                )}
              >
                <p className="text-xs opacity-70 mb-1">
                  {m.from === "client" ? "Client" : "Admin"}
                  {isOwnMessage(m.from) ? " (you)" : ""}
                </p>
                <p>{m.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border/40 p-3 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (sendThreadMessage(text), setText(""))}
            placeholder={isAdmin ? "Reply to client…" : "Message admin…"}
            className="bg-background/50"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => {
              sendThreadMessage(text);
              setText("");
            }}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsSection() {
  const { state, markNotificationRead, markAllNotificationsRead } = useHelpDesk();
  const [videoAlert, setVideoAlert] = useState<Notification | null>(null);

  const visibleNotifications = state.notifications.filter((n) =>
    notificationForRole(n, state.user.role),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          title="Notifications & alerts"
          description="In-app alerts for tickets, messages, system updates, and educational guides with videos."
        />
        <Button size="sm" className="help-desk-action-btn" onClick={markAllNotificationsRead}>
          Mark all read
        </Button>
      </div>
      <ul className="divide-y divide-border/40 border border-border/40 rounded-xl help-desk-panel overflow-hidden">
        {visibleNotifications.length === 0 ? (
          <li className="p-6 text-sm text-muted-foreground">No notifications.</li>
        ) : (
          visibleNotifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "px-4 py-3",
                !n.read && "bg-accent/5",
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => markNotificationRead(n.id)}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{n.title}</p>
                    {n.type === "educational" && (
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                        Guide
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {new Date(n.at).toLocaleString()} · {n.type}
                  </p>
                </div>
                {n.type === "educational" && n.videoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    className="help-desk-action-btn shrink-0"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setVideoAlert(n);
                    }}
                  >
                    <Video className="h-3.5 w-3.5 mr-1.5" />
                    {n.ctaLabel ?? "Watch video"}
                  </Button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
      <p className="text-xs text-muted-foreground">
        Educational alerts help clients learn new features. Admins can broadcast updates with
        instructional videos from the dashboard.
      </p>

      {videoAlert?.videoUrl && (
        <TutorialPlayer
          open={!!videoAlert}
          onOpenChange={(open) => !open && setVideoAlert(null)}
          title={videoAlert.title}
          description={videoAlert.body}
          videoUrl={videoAlert.videoUrl}
        />
      )}
    </div>
  );
}

export function UsersSection() {
  const { state, setUser, setRole, isAdmin } = useHelpDesk();

  const roles: { id: UserRole; label: string; desc: string }[] = [
    {
      id: "client",
      label: "Client",
      desc: "Access the knowledge hub, AI chatbot, submit tickets, and message admin.",
    },
    {
      id: "admin",
      label: "Admin",
      desc: "Receive client tickets and messages, update status, reply to clients, and send educational alerts.",
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Account & role"
        description="Clients use self-service tools. Admins receive and manage support requests."
      />
      <Panel>
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground capitalize">{state.user.role}</span>
          {isAdmin ? " — you can manage incoming client requests." : " — browse help resources or contact admin."}
        </p>
      </Panel>
      <form
        className="help-desk-panel p-4 md:p-5 space-y-4 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            value={state.user.name}
            onChange={(e) => setUser({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            value={state.user.email}
            onChange={(e) => setUser({ email: e.target.value })}
          />
        </div>
      </form>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Switch role (demo)</h3>
        <p className="text-xs text-muted-foreground">
          In production, clients and admins would sign in separately. Use this to preview each experience.
        </p>
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              setRole(r.id);
              if (r.id === "admin") setUser({ name: "Admin" });
              else if (state.user.name === "Admin") setUser({ name: "Client" });
            }}
            className={cn(
              "help-desk-panel w-full text-left p-4 transition-colors",
              state.user.role === r.id && "ring-1 ring-accent/50",
            )}
          >
            <p className="font-medium text-foreground">{r.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getNavItems(isAdmin: boolean) {
  if (isAdmin) {
    return ADMIN_NAV_ITEMS;
  }
  return CLIENT_NAV_ITEMS;
}

export const CLIENT_NAV_ITEMS: { id: HelpSection; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "knowledge", label: "Knowledge Base" },
  { id: "learning", label: "Learning Center" },
  { id: "chatbot", label: "AI Assistant" },
  { id: "tickets", label: "Support" },
  { id: "messages", label: "Messages" },
  { id: "notifications", label: "Alerts" },
  { id: "users", label: "Account" },
];

export const ADMIN_NAV_ITEMS: { id: HelpSection; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "tickets", label: "Tickets" },
  { id: "messages", label: "Messages" },
  { id: "notifications", label: "Alerts" },
  { id: "users", label: "Account" },
];

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("help-desk-panel p-4 md:p-5", className)}>{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="help-desk-panel p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}
