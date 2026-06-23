import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { TUTORIALS } from "./seed";
import type {
  ChatMessage,
  HelpDeskState,
  Notification,
  ThreadMessage,
  Ticket,
  UserProfile,
  UserRole,
} from "./types";

const STORAGE_KEY = "dddp-help-desk-v1";

const defaultState: HelpDeskState = {
  user: { name: "Client", email: "", role: "client" },
  tickets: [],
  thread: [],
  notifications: [
    {
      id: "welcome",
      type: "system",
      title: "Welcome to Help Desk",
      body: "Search the knowledge base, chat with the assistant, or open a ticket anytime.",
      read: false,
      at: new Date().toISOString(),
    },
    {
      id: "edu-messaging-update",
      type: "educational",
      title: "Messaging update: Client support thread",
      body: "We've refreshed internal messaging. Watch a short guide on contacting admin and tracking replies.",
      read: false,
      at: new Date().toISOString(),
      recipientRole: "client",
      tutorialId: "tut-3",
      videoUrl: TUTORIALS.find((t) => t.id === "tut-3")?.videoUrl,
      ctaLabel: "Watch guide",
    },
    {
      id: "edu-admin-dashboard",
      type: "educational",
      title: "Admin tip: Broadcast system updates",
      body: "Use the dashboard to send educational alerts with instructional videos when features change.",
      read: false,
      at: new Date().toISOString(),
      recipientRole: "admin",
      tutorialId: "tut-1",
      videoUrl: TUTORIALS.find((t) => t.id === "tut-1")?.videoUrl,
      ctaLabel: "Preview client video",
    },
  ],
  chat: [
    {
      id: "bot-0",
      role: "bot",
      text: "Hi! I’m the DDDP assistant. Ask me about portals, data access, accounts, or support tickets.",
      at: new Date().toISOString(),
    },
  ],
  kbViews: {},
};

let memoryState: HelpDeskState = loadState();
const listeners = new Set<() => void>();

function migrateRole(role: string): UserRole {
  if (role === "admin") return "admin";
  return "client";
}

function migrateMessageFrom(from: string): ThreadMessage["from"] {
  if (from === "admin" || from === "agent") return "admin";
  return "client";
}

function normalizeState(parsed: Partial<HelpDeskState>): HelpDeskState {
  const merged = { ...defaultState, ...parsed };
  merged.user = {
    ...merged.user,
    role: migrateRole(merged.user.role as string),
    name:
      merged.user.name === "Visitor"
        ? "Client"
        : merged.user.name,
  };
  merged.thread = merged.thread.map((m) => ({
    ...m,
    from: migrateMessageFrom((m as ThreadMessage & { from: string }).from),
  }));
  merged.tickets = merged.tickets.map((t) => ({
    ...t,
    submittedBy: t.submittedBy === "Visitor" ? "Client" : (t.submittedBy ?? "Client"),
  }));
  merged.notifications = merged.notifications.map((n) => ({
    ...n,
    title: n.title.replace(/Visitor/g, "Client"),
    body: n.body.replace(/visitor/g, "client").replace(/Visitor/g, "Client"),
    recipientRole: n.recipientRole
      ? migrateRole(n.recipientRole as string)
      : n.recipientRole,
  }));
  return merged as HelpDeskState;
}

function loadState(): HelpDeskState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return normalizeState(JSON.parse(raw) as Partial<HelpDeskState>);
  } catch {
    return defaultState;
  }
}

function persist(next: HelpDeskState) {
  memoryState = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return memoryState;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function notificationForRole(
  notification: Notification,
  role: UserRole,
): boolean {
  return !notification.recipientRole || notification.recipientRole === role;
}

type HelpDeskContextValue = {
  state: HelpDeskState;
  setUser: (patch: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status">) => Ticket;
  updateTicketStatus: (id: string, status: Ticket["status"]) => void;
  sendThreadMessage: (text: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "at">) => void;
  pushNotification: (n: Omit<Notification, "id" | "at" | "read">) => void;
  broadcastEducationalAlert: (tutorialId: string, body?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  recordKbView: (articleId: string) => void;
  unreadCount: number;
  isAdmin: boolean;
};

const HelpDeskContext = createContext<HelpDeskContextValue | null>(null);

export function HelpDeskProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => defaultState);

  const setUser = useCallback((patch: Partial<UserProfile>) => {
    persist({ ...getSnapshot(), user: { ...getSnapshot().user, ...patch } });
  }, []);

  const setRole = useCallback((role: UserRole) => {
    persist({ ...getSnapshot(), user: { ...getSnapshot().user, role } });
  }, []);

  const pushNotification = useCallback((n: Omit<Notification, "id" | "at" | "read">) => {
    const note: Notification = { ...n, id: uid("n"), read: false, at: new Date().toISOString() };
    persist({ ...getSnapshot(), notifications: [note, ...getSnapshot().notifications] });

    const { user } = getSnapshot();
    if (
      n.type === "educational" &&
      notificationForRole(note, user.role) &&
      typeof window !== "undefined"
    ) {
      toast(n.title, {
        description: n.body,
        duration: 8000,
      });
    }
  }, []);

  const broadcastEducationalAlert = useCallback(
    (tutorialId: string, body?: string) => {
      const tutorial = TUTORIALS.find((t) => t.id === tutorialId);
      if (!tutorial) return;

      pushNotification({
        type: "educational",
        title: `System update: ${tutorial.title}`,
        body:
          body ??
          `A new feature guide is available. Watch the short video to learn what's changed.`,
        recipientRole: "client",
        tutorialId: tutorial.id,
        videoUrl: tutorial.videoUrl,
        ctaLabel: "Watch tutorial",
      });

      toast.success("Educational alert sent to all clients", {
        description: tutorial.title,
      });
    },
    [pushNotification],
  );

  const addTicket = useCallback(
    (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status" | "assignee">) => {
      const { user } = getSnapshot();
      const now = new Date().toISOString();
      const created: Ticket = {
        ...ticket,
        id: uid("ticket"),
        status: "open",
        createdAt: now,
        updatedAt: now,
        submittedBy: ticket.submittedBy || user.name,
        submittedEmail: ticket.submittedEmail || user.email || undefined,
        assignee: "Admin",
      };
      persist({ ...getSnapshot(), tickets: [created, ...getSnapshot().tickets] });
      pushNotification({
        type: "ticket",
        title: "New support request",
        body: `${created.submittedBy} submitted: "${created.subject}"`,
        recipientRole: "admin",
      });
      return created;
    },
    [pushNotification],
  );

  const updateTicketStatus = useCallback(
    (id: string, status: Ticket["status"]) => {
      const tickets = getSnapshot().tickets.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t,
      );
      persist({ ...getSnapshot(), tickets });
      const ticket = tickets.find((t) => t.id === id);
      if (ticket) {
        pushNotification({
          type: "ticket",
          title: "Ticket updated",
          body: `"${ticket.subject}" is now ${status.replace("_", " ")}.`,
          recipientRole: "client",
        });
      }
    },
    [pushNotification],
  );

  const sendThreadMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const { user } = getSnapshot();
      const from: ThreadMessage["from"] = user.role === "admin" ? "admin" : "client";
      const msg: ThreadMessage = {
        id: uid("m"),
        from,
        text: trimmed,
        at: new Date().toISOString(),
      };
      persist({
        ...getSnapshot(),
        thread: [...getSnapshot().thread, msg],
      });
      if (from === "client") {
        pushNotification({
          type: "message",
          title: "Client message",
          body: `${user.name} sent a message — open Messaging to reply.`,
          recipientRole: "admin",
        });
      } else {
        pushNotification({
          type: "message",
          title: "Admin reply sent",
          body: "Your response was delivered to the client.",
          recipientRole: "client",
        });
      }
    },
    [pushNotification],
  );

  const addChatMessage = useCallback((msg: Omit<ChatMessage, "id" | "at">) => {
    const entry: ChatMessage = { ...msg, id: uid("c"), at: new Date().toISOString() };
    persist({ ...getSnapshot(), chat: [...getSnapshot().chat, entry] });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    persist({
      ...getSnapshot(),
      notifications: getSnapshot().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const { user, notifications } = getSnapshot();
    persist({
      ...getSnapshot(),
      notifications: notifications.map((n) =>
        notificationForRole(n, user.role) ? { ...n, read: true } : n,
      ),
    });
  }, []);

  const recordKbView = useCallback((articleId: string) => {
    const kbViews = { ...getSnapshot().kbViews, [articleId]: (getSnapshot().kbViews[articleId] ?? 0) + 1 };
    persist({ ...getSnapshot(), kbViews });
  }, []);

  const unreadCount = useMemo(
    () =>
      state.notifications.filter((n) => !n.read && notificationForRole(n, state.user.role)).length,
    [state.notifications, state.user.role],
  );

  const isAdmin = state.user.role === "admin";

  const value = useMemo(
    () => ({
      state,
      setUser,
      setRole,
      addTicket,
      updateTicketStatus,
      sendThreadMessage,
      addChatMessage,
      pushNotification,
      broadcastEducationalAlert,
      markNotificationRead,
      markAllNotificationsRead,
      recordKbView,
      unreadCount,
      isAdmin,
    }),
    [
      state,
      setUser,
      setRole,
      addTicket,
      updateTicketStatus,
      sendThreadMessage,
      addChatMessage,
      pushNotification,
      broadcastEducationalAlert,
      markNotificationRead,
      markAllNotificationsRead,
      recordKbView,
      unreadCount,
      isAdmin,
    ],
  );

  return <HelpDeskContext.Provider value={value}>{children}</HelpDeskContext.Provider>;
}

export function useHelpDesk() {
  const ctx = useContext(HelpDeskContext);
  if (!ctx) throw new Error("useHelpDesk must be used within HelpDeskProvider");
  return ctx;
}
