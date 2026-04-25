import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./app"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/tanstack-query"
import { ThemeProvider } from "./stores/theme"

const rootElement = document.getElementById("root") as HTMLDivElement

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
