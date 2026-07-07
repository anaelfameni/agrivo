import { Skeleton, SkeletonKpi, SkeletonRow } from "@/components/ui/skeleton";

/**
 * Squelette de chargement de l'espace /app : silhouette du dashboard (bandeau, 4 KPI, liste)
 * plutôt qu'un spinner — la page paraît déjà là. Pulsation coupée en reduced-motion.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Chargement de votre espace">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonKpi />
        <SkeletonKpi />
        <SkeletonKpi />
        <SkeletonKpi />
      </div>
      <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
        <Skeleton className="h-3.5 w-40" />
        <div className="mt-3 flex flex-col divide-y divide-black/[0.04]">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    </div>
  );
}
