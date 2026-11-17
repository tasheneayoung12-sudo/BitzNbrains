import { Pencil } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export function AdminEditButton({ pageKey, label }: { pageKey: string; label: string }) {
  const { auth, viewMode, openInlineEdit } = useSite();
  if (!auth.authenticated || auth.user?.role !== 'owner' || viewMode !== 'admin') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openInlineEdit(pageKey, label)}
      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0E1033] bg-[#FF2E93] px-3 py-1.5 text-xs font-bold text-white shadow-[0_2px_0_#0E1033] hover:bg-[#D1006F] whitespace-nowrap"
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      Edit {label}
    </button>
  );
}
