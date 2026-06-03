import { Globe, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CONTACT_EMAIL = "client.service@mlgrd.gov.gh";
const CONTACT_WEBSITE = "https://mlgrd.gov.gh/";

const contactDetails = [
  {
    icon: Phone,
    label: "Phone",
    hint: "Mon–Fri, 8am–5pm",
    value: "+233 302 932 573",
    href: "tel:+233302932573",
  },
  {
    icon: Mail,
    label: "Email",
    hint: "We reply within 24h",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MapPin,
    label: "Address",
    hint: "BOX",
    value: "P.O. Box M50, Accra, Ghana",
  },
  {
    icon: Globe,
    label: "Website",
    hint: "Visit our website",
    value: "mlgrd.gov.gh",
    href: CONTACT_WEBSITE,
    external: true,
  },
] as const;

type ContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-[oklch(0.05_0.05_265/0.35)] backdrop-blur-[1px]"
        className="glass-dialog max-w-md rounded-2xl border-0 p-0 gap-0 overflow-hidden shadow-none sm:rounded-2xl"
      >
        <DialogHeader className="relative z-10 space-y-2 px-6 pt-6 pb-4 pr-12 text-left">
          <DialogTitle className="text-xl font-semibold text-foreground">Contact us</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Ministry of Local Government, Decentralisation and Rural Development (MLGRD)
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 space-y-3 px-6 pb-6">
          {contactDetails.map(({ icon: Icon, label, hint, value, ...item }) => {
            const content = (
              <>
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground/80">{hint}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
                </div>
              </>
            );

            if ("href" in item && item.href) {
              return (
                <a
                  key={label}
                  href={item.href}
                  {...("external" in item && item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="contact-detail-row group flex gap-3 rounded-xl p-3 outline-none transition-colors hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={label} className="contact-detail-row flex gap-3 rounded-xl p-3">
                {content}
              </div>
            );
          })}
        </div>

        <DialogFooter className="relative z-10 flex-col gap-2 border-t border-border/40 bg-black/10 px-6 py-4 sm:flex-col sm:space-x-0">
          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <a href={`mailto:${CONTACT_EMAIL}`}>Send email</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
