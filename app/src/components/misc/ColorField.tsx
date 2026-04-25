import { PaintbrushVerticalIcon } from "lucide-react"
import { Field, FieldContent, FieldLabel } from "../ui/field"
import { cn } from "@/utils/cn"

type ColorFieldProps = {
  color: string
  id: string
  label: string
  onChange: (color: string) => void
  disabled?: boolean
}

export const ColorField = ({
  color,
  id,
  label,
  onChange,
  disabled,
}: ColorFieldProps) => {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <label
            className={cn(
              "relative flex size-11 items-center justify-center overflow-hidden rounded-full border bg-background",
              !disabled && "cursor-pointer"
            )}
            htmlFor={id}
          >
            <input
              disabled={disabled}
              className="size-14 opacity-0"
              id={id}
              onChange={(event) => onChange(event.target.value.toUpperCase())}
              type="color"
              value={color}
            />

            <span
              className="absolute size-8 rounded-full"
              style={{ backgroundColor: color }}
            />
          </label>

          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <PaintbrushVerticalIcon className="text-muted-foreground" />
            <span className="truncate font-mono">{color}</span>
          </div>
        </div>
      </FieldContent>
    </Field>
  )
}
