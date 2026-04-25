import { Toaster } from "sonner"
import { AppLayout } from "./components/misc/AppLayout"
import { Polygons } from "./pages/Polygons"
import { useThemeStore } from "./stores/theme"

export const App = () => {
  const { setTheme, theme } = useThemeStore()

  return (
    <AppLayout setTheme={setTheme} theme={theme}>
      <Polygons />
      <Toaster closeButton position="top-right" richColors theme={theme} />
    </AppLayout>
  )
}
