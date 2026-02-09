// src/components/cases/case-list.tsx
'use client';

import { useCases, deleteCase, transferCase } from '@/lib/api/useCases';
import { CaseFilters } from '@/types/case';
import { useState } from 'react';
import { toast } from 'sonner';

export function CaseList() {
  const [filters, setFilters] = useState<CaseFilters>({
    status: 'all',
    page: 1,
    perPage: 20,
  });

  const { cases, pagination, isLoading, error, mutate } = useCases(filters);

  const handleDelete = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;

    try {
      await deleteCase(caseId);
      toast.success('Case deleted successfully');
      mutate(); // Refresh the list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete case');
    }
  };

  const handleTransfer = async (caseId: string, reason: string) => {
    try {
      await transferCase(caseId, reason);
      toast.success('Case transferred successfully');
      mutate(); // Refresh the list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to transfer case');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {cases.map((caseItem) => (
        <div key={caseItem.id}>
          <h3>{caseItem.caseNumber || caseItem.efilingNumber}</h3>
          <p>{caseItem.petitionerName} vs {caseItem.respondentName}</p>
          {/* ... render case details ... */}
        </div>
      ))}
    </div>
  );
}