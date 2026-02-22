// src/components/Pagination.tsx

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="pp-pagination" aria-label="ترقيم المنتجات">
      {/* Previous */}
      <button
        className="pp-pag-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="الصفحة السابقة"
      >
        &#x2039; السابق
      </button>

      {/* Pages */}
      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pp-pag-ellipsis">…</span>
        ) : (
          <button
            key={page}
            className={`pp-pag-btn${currentPage === page ? ' active' : ''}`}
            onClick={() => onPageChange(page as number)}
            aria-label={`الانتقال إلى الصفحة ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        className="pp-pag-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="الصفحة التالية"
      >
        التالي &#x203A;
      </button>
    </nav>
  );
};
