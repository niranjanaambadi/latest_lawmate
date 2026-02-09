// import { Badge } from "@/components/ui/badge"
// import type { CaseStatus } from "@/types/case"
// import { formatCaseStatus } from "@/lib/utils/format"

// interface StatusBadgeProps {
//   status: CaseStatus
// }

// export function StatusBadge({ status }: StatusBadgeProps) {
// //   const variantMap: Record<CaseStatus, "default" | "success" | "warning" | "destructive"> = {
// //     filed: "default",
// //     registered: "primary",
// //     pending: "warning",
// //     disposed: "success",
// //     transferred: "default",
// //   }
//   const variantMap={
//     filed: "default",
//     registered: "primary",    // Now this works!
//     pending: "warning",
//     disposed: "success",
//     transferred: "outline",
//   } as const; // 'as const' makes the mapping read-only and precise

//   return (
//     <Badge variant={variantMap[status]}>
//       {formatCaseStatus(status)}
//     </Badge>
    
//   )
// }
// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { CaseStatus } from '@prisma/client';

const variantMap: Record<CaseStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  FILED: 'default',        // Changed from 'primary'
  REGISTERED: 'success',
  PENDING: 'warning',
  DISPOSED: 'secondary',
  TRANSFERRED: 'outline'
};

const formatCaseStatus = (status: CaseStatus): string => {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
};

interface StatusBadgeProps {
  status: CaseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={variantMap[status]}>
      {formatCaseStatus(status)}
    </Badge>
  );
}
