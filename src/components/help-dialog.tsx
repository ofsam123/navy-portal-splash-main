import { Globe, LayoutDashboard, Server } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const portalGuides = [
  {
    icon: LayoutDashboard,
    title: "DDDP Frontend",
    destination: "dddpgh.aoinnovations.org",
    summary: "The main application experience for working with district development data.",
    details: [
      "Opens the latest DDDP frontend in a new tab.",
      "Use dashboards, reports, and district-level views to explore and analyse data.",
      "Best for day-to-day users who need interactive access to platform features.",
    ],
  },
  {
    icon: Server,
    title: "DDDP Backend",
    destination: "dddp.gov.gh",
    summary: "The administrative portal for managing and configuring the platform.",
    details: [
      "Opens the official DDDP backend portal in a new tab.",
      "Manage data, users, permissions, and system configuration.",
      "Intended for authorised staff and administrators responsible for platform operations.",
    ],
  },
  {
    icon: Globe,
    title: "Public Portal",
    destination: "dddp.aoinnovations.org",
    summary: "The public-facing entry point for published district development information.",
    details: [
      "Opens the public DDDP portal in a new tab.",
      "Access openly published district development data and resources.",
      "Suitable for citizens, partners, and anyone browsing official public information.",
    ],
  },
] as const;

type HelpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[oklch(0.05_0.05_265/0.35)] backdrop-blur-[1px]"
        className="glass-dialog max-h-[90vh] max-w-lg rounded-2xl border-0 p-0 gap-0 overflow-hidden shadow-none sm:rounded-2xl"
      >
        <DialogHeader className="relative z-10 shrink-0 space-y-2 px-6 pt-6 pb-4 pr-12 text-left">
          <DialogTitle className="text-xl font-semibold text-foreground">Help</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Learn how the DDDP Portal Hub works and where each link takes you.
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 max-h-[min(58vh,520px)] overflow-y-auto px-6 pb-6 space-y-5">
          <section className="contact-detail-row rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground">About this system</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The District Development Data Platform (DDDP) Portal Hub is a central gateway that connects
              you to the right official service. Instead of searching across multiple sites, choose the
              destination that matches your role—whether you need the interactive frontend, administrative
              backend, or the public portal.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Each card on the home page opens its portal in a new browser tab so you can keep this hub
              open for quick reference.
            </p>
          </section>

          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Portal destinations
            </h3>
            <div className="space-y-3">
              {portalGuides.map(({ icon: Icon, title, destination, summary, details }) => (
                <article key={title} className="contact-detail-row rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                      <p className="text-xs text-accent/90">{destination}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{summary}</p>
                    </div>
                  </div>
                  <ul className="mt-3 list-disc space-y-1.5 border-t border-border/30 pt-3 pl-5 marker:text-accent">
                    {details.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-muted-foreground pl-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
