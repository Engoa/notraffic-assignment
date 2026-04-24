import type { AppTheme } from "@/types/theme"
import { Button } from "@/components/ui/button"
import { SunMediumIcon, MoonStarIcon } from "lucide-react"
import { type FC, type ReactNode } from "react"

type AppLayoutProps = {
  children: ReactNode
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
}

export const AppLayout: FC<AppLayoutProps> = ({
  children,
  theme,
  setTheme,
}) => {
  return (
    <div className="flex h-dvh flex-col justify-center gap-4 p-4 sm:flex-row-reverse">
      <Button
        size="icon-lg"
        className="ml-auto"
        variant="outline"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "dark" ? <SunMediumIcon /> : <MoonStarIcon />}
      </Button>

      {children}
    </div>
  )
}
