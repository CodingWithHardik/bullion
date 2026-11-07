import { ReactNode } from "react";

export function Overlay({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-x-0 bottom-0 top-20 x-40 overflow-y-auto bg-background/85 backdrop-blur-md">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950/90 p-6 text-center text-white shadow-2xl animate-in fade-in zoom-in-95 sm:p-8 2xl:max-w-2xl 2xl:p-12">
                    {children}
                </div>
            </div>
        </div>
    )
}