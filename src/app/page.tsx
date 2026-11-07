import Footer from "@/blocks/Footer";
import Navbars from "@/blocks/Navbar";
import { StockVelocity } from "@/blocks/StockVelocity";
import CubeHero from "@/components/elements/CubeHero";
import { StartButton } from "@/components/elements/StartButton";
import MicroSlats from "@/components/MicroSlats";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Bullion?",
    answer:
      "Bullion is a stock trading game. At start you get $10,000 in virtual cash and tree minutes to buy and sell stocks while prices move on a live feed.",
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

export default function Home() {
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
