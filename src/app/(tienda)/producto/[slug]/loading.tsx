import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[520px] sm:grid sm:max-w-[900px] sm:grid-cols-2 sm:gap-9 sm:px-6 sm:pt-6 md:px-8">
      <Skeleton className="aspect-square w-full rounded-none sm:rounded-2xl" />
      <div className="space-y-3 px-[18px] pt-5 sm:px-0">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-4 h-13 w-full rounded-xl" />
      </div>
    </div>
  );
}
