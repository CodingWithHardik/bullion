"use client";

import { cn } from "@/lib/utils";
import { League_Spartan } from "next/font/google";
import { StartButton } from "@/components/elements/StartButton";
import Image from "next/image";
import { useState } from "react";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["700"],
});

export default function Footer({ buttonVisible = false }: { buttonVisible?: boolean }) {
  const [buttonVisibility, setButtonVisibility] = useState(buttonVisible)

  return (
    <footer>
      <div className="px-7 md:px-10">
        <div className="flex flex-col py-10 lg:flex-row lg:items-center lg:justify-between gap-10">
        <div className="flex flex-col items-start justify-start gap-y-5">
          <a href="#" className="flex items-center gap-x-2.5">
            <Image
                src="/BULLION_DARK.png"
                width={64}
                height={80}
                alt="Bullion logo"
                className="w-auto"
            />
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
              Bullion
            </h1>
          </a>
          <p className="tracking-tight text-neutral-900 dark:text-white">
            Discover stocks, make your move and see how your market instincts stack up with Bullion
          </p>
          <p className="text-sm tracking-tight text-neutral-500 sm:text-center dark:text-neutral-400">
            All rights reserved.
          </p>
        </div>
        {
          buttonVisibility ? (
            <div>
              <StartButton />
            </div>
          ) : null
        }
      </div>
      </div>
      <p
        className={cn(
          "z-20 uppercase font-medium text-[21.25vw] leading-[.9] font-display text-center text-canopy text-gray-500 blur-xs select-none overflow-hidden",
          leagueSpartan.className,
        )}
      >
        BULLION
      </p>
    </footer>
  );
}
