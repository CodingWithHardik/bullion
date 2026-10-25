"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StartButton } from "@/components/elements/StartButton";

export default function Navbars() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors",
          scrolled
            ? "backdrop-blur-md bg-transparent text-white"
            : "bg-background text-white",
        )}
        aria-label="Primary"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center lg:hidden">
            <div className="flex items-center">
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((v) => !v)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="sr-only">
                  {open ? "Close sidebar" : "Open sidebar"}
                </span>
                <div className="relative h-6 w-6" aria-hidden="true">
                  <span
                    className={cn(
                      "absolute left-0 right-0 top-1 block h-0.5 w-6 origin-center rounded transition-all duration-200",
                      open ? "top-2 rotate-45" : "",
                    )}
                    style={{ backgroundColor: "currentColor" }}
                  />
                  <span
                    className={cn(
                      "absolute left-0 right-0 top-2 block h-0.5 w-6 origin-center rounded transition-all duration-200",
                      open ? "opacity-0" : "opacity-100",
                    )}
                    style={{ backgroundColor: "currentColor" }}
                  />
                  <span
                    className={cn(
                      "absolute left-0 right-0 top-3 block h-0.5 w-6 origin-center rounded transition-all duration-200",
                      open ? "top-2 -rotate-45" : "",
                    )}
                    style={{ backgroundColor: "currentColor" }}
                  />
                </div>
              </button>
            </div>
            <div className="flex items-center justify-center">
              <Logo />
            </div>
            <div aria-hidden className="flex items-center justify-end" />
          </div>
          <div className="hidden h-20 items-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <div aria-hidden />
            <div className="flex items-center justify-center">
              <Logo />
            </div>
            <div className="flex items-center justify-end">
              <StartButton />
            </div>
          </div>
        </div>
      </header>

      <div className="h-20" aria-hidden />

      {open ? (
        <div
          className="fixed inset-x-0 top-20 bottom-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-background backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-screen translate-x-0 bg-background text-card-foreground backdrop-blur-xl shadow-xl ring-1 overflow-y-auto",
              "animate-in slide-in-from-left duration-200",
              "bg-background/60 backdrop-blur-md",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full justify-center px-4 pt-6 pb-4">
              <StartButton onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="shrink-0 text-balance text-lg font-semibold tracking-tight hover:opacity-90"
      aria-label="Go to homepage"
    >
      <Image
        src="/BULLION_DARK.png"
        width={64}
        height={80}
        alt="Bullion logo"
        className="w-auto"
      />
    </Link>
  );
}