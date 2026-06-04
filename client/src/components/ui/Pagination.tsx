import ReactPaginate, { ReactPaginateProps } from "react-paginate";

type PageChangeEvent = Parameters<
  NonNullable<ReactPaginateProps["onPageChange"]>
>[0];

export function Pagination({
  totalPage,
  handlePageClick,
  currentPage = 1,
}: {
  totalPage: number;
  handlePageClick: (e: PageChangeEvent) => void;
  currentPage?: number;
}) {
  return (
    <ReactPaginate
      breakLabel="..."
      nextLabel=">"
      previousLabel="<"
      onPageChange={handlePageClick}
      forcePage={currentPage - 1}
      pageRangeDisplayed={3}
      pageCount={totalPage}
      renderOnZeroPageCount={null}
      className="flex justify-center items-center gap-2 select-none py-4"
      pageClassName="list-none"
      pageLinkClassName="flex items-center justify-center w-9 h-9 rounded-lg border border-brand-border bg-brand-surface text-slate-300 font-medium transition-all hover:bg-brand-border hover:text-white cursor-pointer select-none text-sm"
      activeLinkClassName="!bg-brand-accent !text-brand-bg !border-brand-accent font-bold neon-glow"
      previousClassName="list-none"
      previousLinkClassName="flex items-center justify-center w-9 h-9 rounded-lg border border-brand-border bg-brand-surface text-slate-300 font-medium transition-all hover:bg-brand-border hover:text-white cursor-pointer select-none text-sm"
      nextClassName="list-none"
      nextLinkClassName="flex items-center justify-center w-9 h-9 rounded-lg border border-brand-border bg-brand-surface text-slate-300 font-medium transition-all hover:bg-brand-border hover:text-white cursor-pointer select-none text-sm"
      breakClassName="list-none flex items-center justify-center w-9 h-9"
      breakLinkClassName="text-brand-muted select-none text-sm"
      disabledClassName="opacity-40 pointer-events-none cursor-not-allowed"
      disableInitialCallback
    />
  );
}
