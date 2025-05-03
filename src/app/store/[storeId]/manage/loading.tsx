
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function StoreManageLoading() {
  return (
    <div className="container mx-auto py-10 space-y-8 animate-pulse">
      <Skeleton className="h-8 w-32 mb-2" /> {/* Back button */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" /> {/* Title */}
        <Skeleton className="h-6 w-1/2" /> {/* Subtitle */}
      </div>

       {/* Products Section Skeleton */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
             {/* Table Skeleton */}
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" /> {/* Table Header */}
                <Skeleton className="h-12 w-full" /> {/* Table Row */}
                <Skeleton className="h-12 w-full" /> {/* Table Row */}
                <Skeleton className="h-12 w-full" /> {/* Table Row */}
             </div>
        </CardContent>
      </Card>

      {/* Offers Section Skeleton (Conditional based on logic in main page, simplified here) */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
        </CardContent>
      </Card>
    </div>
  );
}
