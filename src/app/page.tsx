"use client"
import Footer from "@/blocks/Footer";
import Navbars from "@/blocks/Navbar";
import { StockVelocity } from "@/blocks/StockVelocity";
import CubeHero from "@/components/elements/CubeHero";
import { StartButton } from "@/components/elements/StartButton";
import MicroSlats from "@/components/MicroSlats";
import { MovePreview } from "@/components/MovePreview";
import { PickPreview } from "@/components/PickPreview";
import { TrackPreview } from "@/components/TrackPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "cn";
import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    question: "What is Bullion?",
    answer:
      "Bullion is a stock trading game. At start you get $10,000 in virtual cash and three minutes to buy and sell stocks while prices move on a live feed.",
  },
  {
    question: "Is this real money?",
    answer:
      "No Bullion uses virtual cash only. You can't deposit, withdraw, or lose real money",
  },
  {
    question: "How do I buy and sell?",
    answer:
      "Pick a stock, then shoose a dollar amount to buy or a percentage of your position to sell. You can buy partial shares",
  },
  {
    question: "Is there a fee?",
    answer: "Yes there is a 0.1% fee applies to every buy and sell",
  },
  {
    question: "How is my rank decided?",
    answer: "Your rank depends on your return when the round ends.",
  },
];

const STEPS = [
  {
    title: "Pick a stock",
    text: "Browse real market stocks live prices and find the onces your gut likes",
    preview: <PickPreview/>
  },
  {
    title: "Make your move",
    text: "Buy or sell with virtual money No risk just your instincts",
    preview: <MovePreview/>
  },
  {
    title: "Trade your portfolio",
    text: "Follow your holdings and returns as the market moves all in one place",
    preview: <TrackPreview/>
  },
]

export default function Home() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbars buttonVisible={true} />
      <StockVelocity />
      <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-16 md:gap-32 px-6 py-16 md:flex-row md:justify-between">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Let Your Instincts Trade
          </h1>
          <p className="mt-5 text-lg text-gray-600">
            Discover stocks, make your move and see how your market instincts
            stack up with Bullion
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <StartButton />
          </div>
        </div>

        <CubeHero
          src="/stock.png"
          className="block h-48 w-48 shrink-0 sm:h-64 sm:w-64 md:h-96 md:w-96"
        />
      </section>
      <StockVelocity />
      <section
        id="usages"
        ref={ref}
        className="bg-black px-5 py-20 text-white md:px-6 md:py[120px]"
      >
        <div className="pointer-events-none">
          <div className="relative mx-auto mb-16 max-w-190 text-center">
            <span className="mb-5 inline-block rounded-full border border-white/8 px-3.5 py-1.5 text-[13px] uppercase tracking-[0.08em] text-red-400">
              How it works
            </span>
            <h2 className="mb-4 text-[clamp(32px, 5vw, 52px)] font-bold leading-[1.1] tracking-[-0.03em] [text-warp:balance]">
              Three Steps tp your first trade
            </h2>
          </div>
          <div className="relative mx-auto max-w-120 md:max-w-280">
            <ol className="relative m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
              {STEPS.map(({ title, text, preview }, i) => (
                <li 
                  key={title}
                  style={{ transitionDelay: `${i*120}ms` }}
                  className={
                    cn(
                      "relative rounded-3xl border border-white/8 bg-block px-6 pb-7 pt-8 transition-[opacity,transform,border-color] duration-700 ease-out hover:border-[#e86a6a]/40 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
                      visible ? "transition-y-0 opacity-100" : "translate-y-6 opacity-0"
                    )
                  }
                >
                  <span className="relative x-[1] mx-auto mb-6 grid h-10 w-10 place-items-center rounded-full bg-linear-to-b from-[#e84545] to-[#e84545] font-bold shadow-[0_0_0_6px_#0a0a0a,0_6px_20px_rgba(220,53,53,0,.35)]">
                    {i + 1}
                  </span>
                  {preview}
                  <h3 className="mb-2 text-[22px] font-semibold tracking-[-0.01em]">
                    {title}
                  </h3>
                  <p className="text-[15px] leading-[1.55] text-gray-400">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section id="faq">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto space-y-4 py-6 text-center">
            <h2 className="mx-auto font-bold mb-2 max-w-3xl text-[42px] tracking-tighter text-balance">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion className="mx-auto w-full max-w-2xl">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <div className="relative h-16 w-full mx-auto overflow-hidden">
        <MicroSlats
          preset="swell"
          color="#ef4444"
          glintColor="#ffffff"
          backgroundColor="#0a0a0a"
          slatWidth={10}
          slatHeight={25}
          gap={3}
          roundness={0.75}
          interactive
          cursorStrength={1}
          cursorSize={40}
          swirl={0}
          trail={1.4}
          lean={0}
          intro
          scale={1.5}
          speed={0.6}
          direction={250}
          chop={0.55}
          stretch={0}
          glint={0.7}
          contrast={1.25}
          perspective={0.55}
          fog={0.55}
          introDuration={1.5}
          paused={false}
        />
      </div>
      <Footer buttonVisible={true} />
    </>
  );
}
