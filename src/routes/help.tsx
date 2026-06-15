import { createFileRoute } from "@tanstack/react-router";

import { HelpDeskApp } from "@/components/help-desk/help-desk-app";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Desk & Knowledge Hub | DDDP" },
      {
        name: "description",
        content:
          "DDDP Help Desk and Knowledge Hub — documentation, tutorials, AI assistant, ticketing, and messaging.",
      },
    ],
  }),
  component: HelpDeskPage,
});

function HelpDeskPage() {
  return <HelpDeskApp />;
}
