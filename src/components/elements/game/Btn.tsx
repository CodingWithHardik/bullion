import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { variants } from "./variants"

export function Btn({ variant = "ghost", className, ...props }: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
    return (
        <button
            type="button"
            className={cn(
                "min-h-11 items-center rounded-lg font-semibold transition tabular-nums text-sm px-3 justify-center inline-flex",
                "active:scale-[.97] disabled:pointer-events-none disabled:opacity-35",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/70",
                "2xl:min-h-14 2xl:px-5 2xl:text-lg",
                variants[variant]
            )}
            {...props}
        />
    )
}