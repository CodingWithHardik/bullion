import { cn } from "cn";
import { ReactNode } from "react";

export function Panel({ title, meta, className, children }: { title?: string; meta?: string; className?: string; children: ReactNode }) {
    return (
        <section className={
            cn(
                "min-w-0 rounded-2xl border bg-white/3 border-white/10 p-4 md:p-5 2xl:p-7",
                className
            )
        }>
            {
                title && (
                    <div className="gap-2 justify-between items-baseline flex mb-3">
                        <h2 className="2xl:text-base text-white/70 tracking-wider uppercase font-semibold text-sm">
                            {title}
                        </h2>
                        {meta && <span className="text-xs 2xl:text-sm text-muted-foreground">{meta}</span>}
                    </div>
                )
            }
            {children}
        </section>
    )
}