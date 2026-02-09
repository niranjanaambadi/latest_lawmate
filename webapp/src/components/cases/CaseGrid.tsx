// src/components/cases/CaseGrid.tsx
'use client';

import { Case } from '@/types/case';
import { CaseCard } from './CaseCard';
import { PaginatedResponse } from '@/types/api';

interface CaseGridProps {
  data: PaginatedResponse<Case>;
}

export function CaseGrid({ data }: CaseGridProps) {
  if (!data.items || data.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No cases found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.items.map((caseItem: Case) => (
        <CaseCard key={caseItem.id} case={caseItem} />
      ))}
    </div>
  );
}