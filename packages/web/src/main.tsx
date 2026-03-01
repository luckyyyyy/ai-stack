import "./index.css";

import { httpBatchLink } from "@trpc/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import i18n from "./lib/i18n";
import { trpc } from "./lib/trpc";

const getWorkspaceFromPath = () => {
  if (typeof window === "undefined") return undefined;
  const match = window.location.pathname.match(/^\/dashboard\/([^/]+)/);
  return match?.[1];
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_URL || "/trpc",
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "include" });
      },
      headers() {
        const workspaceSlug = getWorkspaceFromPath();
        return {
          ...(workspaceSlug ? { "x-workspace-id": workspaceSlug } : {}),
          "x-lang": i18n.resolvedLanguage ?? i18n.language ?? "zh",
        };
      },
    }),
  ],
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App trpcClient={trpcClient} />
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>,
);
