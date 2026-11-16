import arrowLeftIcon from '../assets/icons/arrow-left-bold.svg';
import arrowRightIcon from '../assets/icons/arrow-right-bold.svg';

function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pageCount || nextPage === page) return;
    onChange(nextPage);
  };

  return (
    <nav
      aria-label="Catalogue pagination"
      className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6"
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        <img src={arrowLeftIcon} alt="" className="h-4 w-4" />
        Previous
      </button>

      <p className="text-sm text-gray-600" aria-live="polite">
        Page {page} of {pageCount}
      </p>

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= pageCount}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <img src={arrowRightIcon} alt="" className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default Pagination;
