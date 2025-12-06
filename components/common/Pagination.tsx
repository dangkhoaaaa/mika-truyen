'use client';

import { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Update input when currentPage changes externally
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      setPageInput((currentPage - 1).toString());
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      setPageInput((currentPage + 1).toString());
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPageInput(currentPage.toString());
    }
  };

  return (
    <div className="flex justify-center items-center space-x-4 mt-8 mb-6 flex-wrap gap-2">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="bg-netflix-gray/50 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-netflix-red transition font-semibold"
      >
        Trước
      </button>
      <span className="text-white text-lg font-medium px-4">
        Trang {currentPage} / {totalPages}
      </span>
      <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
        <span className="text-white text-sm">Đến trang:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={handlePageInputChange}
          className="w-16 px-2 py-1 rounded bg-netflix-gray/50 text-white text-center border border-gray-600 focus:border-netflix-red focus:outline-none"
        />
        <button
          type="submit"
          className="bg-netflix-red text-white px-4 py-1 rounded hover:bg-red-700 transition font-semibold"
        >
          Đi
        </button>
      </form>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="bg-netflix-gray/50 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-netflix-red transition font-semibold"
      >
        Sau
      </button>
    </div>
  );
};

export default Pagination;

