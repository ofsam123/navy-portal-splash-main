import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

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
  user: { name: "Visitor", email: "", role: "visitor" },
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

function normalizeState(parsed: Partial<HelpDeskState>): HelpDeskState {
  const merged = { ...defaultState, ...parsed };
  if ((merged.user.role as string) === "agent") {
    merged.user = { ...merged.user, role: "admin" };
  }
  merged.thread = merged.thread.map((m) =>
    (m as ThreadMessage & { from: string }).from === "agent"
      ? { ...m, from: "admin" as const }
      : m,
  );
  merged.tickets = merged.tickets.map((t) => ({
    ...t,
    submittedBy: t.submittedBy ?? "Visitor",
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

type HelpDeskContextValue = {
  state: HelpDeskState;
  setUser: (patch: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status">) => Ticket;
  updateTicketStatus: (id: string, status: Ticket["status"]) => void;
  sendThreadMessage: (text: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, "id" | "at">) => void;
  pushNotification: (n: Omit<Notification, "id" | "at" | "read">) => void;
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
  }, []);

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
      const from: ThreadMessage["from"] = user.role === "admin" ? "admin" : "visitor";
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
      if (from === "visitor") {
        pushNotification({
          type: "message",
          title: "Visitor message",
          body: `${user.name} sent a message — open Messaging to reply.`,
        });
      } else {
        pushNotification({
          type: "message",
          title: "Admin reply sent",
          body: "Your response was delivered to the visitor.",
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
    persist({
      ...getSnapshot(),
      notifications: getSnapshot().notifications.map((n) => ({ ...n, read: true })),
    });
  }, []);

  const recordKbView = useCallback((articleId: string) => {
    const kbViews = { ...getSnapshot().kbViews, [articleId]: (getSnapshot().kbViews[articleId] ?? 0) + 1 };
    persist({ ...getSnapshot(), kbViews });
  }, []);

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
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
