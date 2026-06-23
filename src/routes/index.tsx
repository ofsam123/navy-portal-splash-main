import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { ArrowUpRight, Globe, LucideLayoutDashboard, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import coatOfArms from "@/assets/ghana-coat-of-arms.png";
import { ContactDialog } from "@/components/contact-dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DDDP Portal Hub" },
      { name: "description", content: "Quick access to the DDDP frontend, backend, and public portal." },
    ],
  }),
  component: Index,
});

const cards = [
  {
    title: "DDDP Frontend",
    description: "Access the latest DDDP frontend experience.",
    href: "https://dddpgh.aoinnovations.org/",
    icon: LucideLayoutDashboard,
  },
  {
    title: "DDDP Backend",
    description: "Manage, Configure and do extensive analysis on DDDP.",
    href: "https://dddp.gov.gh/",
    icon: Server,
  },
  {
    title: "Public Portal",
    description: "Visit the official public DDDP portal.",
    // href: "https://dddppublicportal.aoholdings.net/",
    href: "https://dddp.aoinnovations.org/",
    icon: Globe,
  },
];

const navLinks = [
  { label: "Help", to: "/help" },
  { label: "Contact", action: "contact" as const },
] as const;

function Index() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
    <main
      className={cn(
        "h-screen w-screen overflow-hidden flex flex-col items-center justify-center px-6 py-10 relative",
        contactOpen && "pointer-events-none",
      )}
      style={{ background: "var(--gradient-bg)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full blur-3xl opacity-30"
          style={{ background: "var(--color-accent)" }}
        />
        <span className="energy-line" style={{ top: "18%", left: 0, ["--dur" as never]: "9s", ["--delay" as never]: "0s", ["--rot" as never]: "-4deg", ["--drift" as never]: "12px", ["--peak" as never]: 0.45 }} />
        <span className="energy-line" style={{ top: "38%", left: 0, ["--dur" as never]: "11s", ["--delay" as never]: "2.5s", ["--rot" as never]: "3deg", ["--drift" as never]: "-18px", ["--peak" as never]: 0.35 }} />
        <span className="energy-line" style={{ top: "58%", left: 0, ["--dur" as never]: "8s", ["--delay" as never]: "5s", ["--rot" as never]: "-2deg", ["--drift" as never]: "8px", ["--peak" as never]: 0.4 }} />
        <span className="energy-line" style={{ top: "78%", left: 0, ["--dur" as never]: "12s", ["--delay" as never]: "1.2s", ["--rot" as never]: "5deg", ["--drift" as never]: "-10px", ["--peak" as never]: 0.3 }} />
        <span className="energy-line" style={{ top: "8%", left: 0, ["--dur" as never]: "10s", ["--delay" as never]: "6s", ["--rot" as never]: "2deg", ["--drift" as never]: "6px", ["--peak" as never]: 0.25 }} />
      </div>

      <img
        src={coatOfArms}
        alt="Ghana Coat of Arms"
        className="absolute top-4 left-4 md:top-6 md:left-6 z-20 h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg"
      />

      <nav
        aria-label="Site navigation"
        className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-3 md:gap-4 text-sm tracking-wide"
      >
        {navLinks.map((link, index) => (
          <Fragment key={link.label}>
            {index > 0 && (
              <span aria-hidden className="text-muted-foreground/40 select-none">
                |
              </span>
            )}
            {"to" in link ? (
              <Link to={link.to} className="top-nav-link font-medium">
                {link.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="top-nav-link font-medium"
              >
                {link.label}
              </button>
            )}
          </Fragment>
        ))}
      </nav>

      <header className="relative z-10 text-center max-w-3xl mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/40 backdrop-blur text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 animate-breathe">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Welcome
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.05]">
          District Development Data Platform <span className="text-accent">(DDDP)</span>
        </h1>
        
        {/* <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          District Development Data Plaform </p> */}
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          This portal serves as a centralized platform that brings district development data services into one place, 
          allowing users to easily access appropriate official data Nationwide.
        </p>
      </header>

      <section className="relative z-10 grid w-full max-w-5xl gap-5 md:gap-6 grid-cols-1 md:grid-cols-3">
        {cards.map(({ title, description, href, icon: Icon }) => (
          <a
            key={title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="portal-card group relative z-0 flex flex-col justify-between rounded-2xl p-6 md:p-7 min-h-[200px] outline-none hover:-translate-y-1 focus-visible:-translate-y-1"
          >
            <div className="relative z-10 flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-accent/10 text-accent border border-accent/20 backdrop-blur-sm">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:text-accent group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1" />
            </div>
            <div className="relative z-10 mt-8">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
              {/* <p className="mt-3 text-xs text-muted-foreground/80">Opens in new window</p> */}
            </div>
          </a>
        ))}
      </section>

      <footer className="relative z-10 mt-10 text-xs text-muted-foreground tracking-wide">
        Powered by{" "}
        <a
          href="https://aoholdings.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm"
        >
          AO Holdings
        </a>{" "}
        © {new Date().getFullYear()}
      </footer>
    </main>

    <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
