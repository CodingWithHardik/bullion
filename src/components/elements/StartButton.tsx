import { cn } from "cn";
import Link from "next/link";

type RegisterButtonProps = {
  onNavigate?: () => void;
};

export function StartButton({ onNavigate }: RegisterButtonProps) {
  return (
    <Link
      href="/game"
      onClick={onNavigate}
      aria-label="Register"
      className={cn(
        "h-11 px-6 text-base bg-linear-30 from-red-800 via-red-400 to-red-600 rounded-4xl font-bold",
        "inline-flex items-center justify-center text-white transition-opacity hover:opacity-90",
      )}
    >
      Start Game
    </Link>
  );
}