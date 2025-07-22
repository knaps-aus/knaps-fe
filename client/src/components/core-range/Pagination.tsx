import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Props {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({ page, pageCount, onPageChange }: Props) {
  return (
    <Pagination className="my-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="cursor-pointer"
            onClick={() => onPageChange(Math.max(0, page - 1))}
          />
        </PaginationItem>
        <PaginationItem className="flex items-center px-3 text-sm">
          Page {page + 1} of {pageCount}
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            className="cursor-pointer"
            onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
