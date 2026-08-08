import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage?: number;
  page?: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  page,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange
}: PaginationProps) => {
  const activePage = currentPage || page || 1;

  if (totalPages <= 1) return null;

  const startItem = totalItems ? (activePage - 1) * itemsPerPage + 1 : undefined;
  const endItem = totalItems ? Math.min(activePage * itemsPerPage, totalItems) : undefined;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          {totalItems && (
            <p className="text-sm text-slate-400">
              Showing <span className="font-medium text-slate-200">{startItem}</span> to <span className="font-medium text-slate-200">{endItem}</span> of{' '}
              <span className="font-medium text-slate-200">{totalItems}</span> results
            </p>
          )}
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(activePage - 1)}
              disabled={activePage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-700 bg-slate-800 text-sm font-medium text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-slate-700 bg-slate-900 text-sm font-medium text-slate-200">
              Page {activePage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(activePage + 1)}
              disabled={activePage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-700 bg-slate-800 text-sm font-medium text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
