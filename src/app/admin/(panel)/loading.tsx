import { Skeleton } from "@/components/ui/skeleton";

export default function PanelLoading() {
  return (
    <>
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3.5 md:px-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid gap-3.5 p-4 sm:grid-cols-2 md:p-6 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    </>
  );
}
