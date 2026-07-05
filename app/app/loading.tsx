import { Logo } from "@/components/ui/logo";

export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-stone-400">
        <span className="glow-pulse">
          <Logo size={28} showWord={false} />
        </span>
        <span className="text-sm">Chargement…</span>
      </div>
    </div>
  );
}
