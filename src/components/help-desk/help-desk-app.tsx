import { Link } from "@tanstack/react-router";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";

import { ContactDialog } from "@/components/contact-dialog";
import {
  ChatbotSection,
  DashboardSection,
  GlobalSearchSection,
  KnowledgeBaseSection,
  LearningCenterSection,
  MessagingSection,
  getNavItems,
  NotificationsSection,
  TicketsSection,
  UsersSection,
  VisitorHomeSection,
} from "@/components/help-desk/help-desk-sections";
import { HelpDeskProvider, useHelpDesk } from "@/lib/help-desk/store";
import { useHelpDeskTheme } from "@/lib/help-desk/theme";
import type { HelpSection, UserRole } from "@/lib/help-desk/types";
import { cn } from "@/lib/utils";
import coatOfArms from "@/assets/ghana-coat-of-arms.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function HelpDeskShell() {
  const [section, setSection] = useState<HelpSection>("home");
  const [globalQuery, setGlobalQuery] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const { state, setRole, setUser, unreadCount, isAdmin } = useHelpDesk();
  const { isDark, toggle: toggleTheme } = useHelpDeskTheme();
  const navItems = getNavItems(isAdmin);

  const runSearch = (query: string) => {
    setGlobalQuery(query);
    if (query.trim()) setSection("search");
  };

  const switchRole = (role: UserRole) => {
    setRole(role);
    if (role === "admin") {
      setUser({ name: "Admin" });
      setSection("dashboard");
    } else {
      if (state.user.name === "Admin") setUser({ name: "Visitor" });
      setSection("home");
    }
    setMobileNav(false);
  };

  const goTickets = () => {
    setSection("tickets");
    setMobileNav(false);
  };

  const navigate = (next: HelpSection) => {
    setSection(next);
    setMobileNav(false);
  };

  const renderSection = () => {
    switch (section) {
      case "home":
        return (
          <VisitorHomeSection onNavigate={navigate} />
        );
      case "search":
        return <GlobalSearchSection query={globalQuery} />;
      case "dashboard":
        return <DashboardSection />;
      case "knowledge":
        return <KnowledgeBaseSection initialQuery={globalQuery} />;
      case "learning":
        return <LearningCenterSection initialQuery={globalQuery} />;
      case "chatbot":
        return <ChatbotSection onGoTickets={goTickets} />;
      case "tickets":
        return <TicketsSection />;
      case "messages":
        return <MessagingSection />;
      case "notifications":
        return <NotificationsSection />;
      case "users":
        return <UsersSection />;
      default:
        return isAdmin ? <DashboardSection /> : (
          <VisitorHomeSection onNavigate={navigate} />
        );
    }
  };

  return (
    <>
      <div
        className={cn(
          "help-desk-shell min-h-screen w-full flex flex-col",
          isDark ? "help-desk-dark" : "help-desk-light",
        )}
      >
        <header className="help-desk-header sticky top-0 z-30">
          <div className="flex flex-col gap-3 px-4 py-3 md:px-6 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 shrink-0">
                <img
                  src={coatOfArms}
                  alt=""
                  className="h-9 w-9 object-contain shrink-0"
                  aria-hidden
                />
                <div className="min-w-0 hidden sm:block">
                  <p className="help-desk-brand-sub text-xs uppercase tracking-wider truncate">
                    DDDP Support
                  </p>
                  <h1 className="help-desk-brand-title text-sm md:text-base font-semibold truncate">
                    Help Desk & Knowledge Hub
                  </h1>
                </div>
              </div>

              <form
                className="flex flex-1 max-w-md mx-auto gap-2 min-w-0"
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch(globalQuery);
                }}
              >
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    value={globalQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setGlobalQuery(v);
                      if (v.trim()) setSection("search");
                    }}
                    placeholder="Search anything…"
                    className="help-desk-global-search pl-9 h-9 text-sm"
                    aria-label="Global search"
                  />
                </div>
                <Button type="submit" size="sm" className="h-9 shrink-0 px-3">
                  Search
                </Button>
              </form>

              <div className="flex items-center gap-1.5 shrink-0 text-sm">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="help-desk-theme-toggle"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDark ? "Light mode" : "Dark mode"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <div
                  className="hidden lg:flex items-center rounded-full help-desk-role-toggle p-0.5 text-xs"
                  role="group"
                  aria-label="Switch role"
                >
                  <button
                    type="button"
                    onClick={() => switchRole("visitor")}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-medium transition-colors",
                      !isAdmin ? "help-desk-role-active" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Visitor
                  </button>
                  <button
                    type="button"
                    onClick={() => switchRole("admin")}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-medium transition-colors",
                      isAdmin ? "help-desk-role-active" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Admin
                  </button>
                </div>
                <Link to="/" className="help-desk-nav-link hidden xl:inline text-xs">
                  Hub
                </Link>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="help-desk-nav-link hidden xl:inline text-xs"
                >
                  Contact
                </button>
                <button
                  type="button"
                  className="md:hidden p-2 text-muted-foreground"
                  onClick={() => setMobileNav((o) => !o)}
                  aria-label="Toggle menu"
                >
                  {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <nav
              aria-label="Help desk sections"
              className={cn(mobileNav ? "block" : "hidden md:block")}
            >
              <div className="flex flex-wrap gap-1">
                {navItems.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigate(id)}
                    className={cn(
                      "help-desk-nav-link text-xs md:text-sm",
                      section === id && "is-active",
                    )}
                  >
                    {label}
                    {id === "notifications" && unreadCount > 0 && (
                      <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent/20 px-1 text-[10px] text-accent">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {renderSection()}
        </main>

        <footer className="help-desk-footer py-4 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://aoholdings.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent hover:underline"
          >
            AO Holdings
          </a>{" "}
          © {new Date().getFullYear()}
        </footer>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}

export function HelpDeskApp() {
  return (
    <HelpDeskProvider>
      <HelpDeskShell />
    </HelpDeskProvider>
  );
}
