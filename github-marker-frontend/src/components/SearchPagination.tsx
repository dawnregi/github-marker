import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

type SearchPaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  totalPages?: number;
  showPageNumbers?: boolean;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function SearchPagination({ 
  currentPage, 
  onPageChange,
  isLoading = false,
  totalPages,
  showPageNumbers = false,
  hasPrev,
  hasNext
}: SearchPaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  const isPrevDisabled = hasPrev !== undefined ? !hasPrev : currentPage === 1;
  const isNextDisabled = hasNext !== undefined ? !hasNext : false;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            aria-disabled={isPrevDisabled || isLoading}
            className={
              isPrevDisabled || isLoading
                ? "pointer-events-none opacity-60 text-muted-foreground/70"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
        
        {showPageNumbers && totalPages ? (
          <>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((pageNum) => {
                if (totalPages <= 7) return true;
                if (pageNum === 1 || pageNum === totalPages) return true;
                if (pageNum >= currentPage - 1 && pageNum <= currentPage + 1) return true;
                return false;
              })
              .map((pageNum, index, array) => {
                const showEllipsisBefore = index > 0 && pageNum - array[index - 1] > 1;
                return (
                  <>
                    {showEllipsisBefore && (
                      <PaginationItem key={`ellipsis-${pageNum}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                );
              })}
          </>
        ) : (
          <PaginationItem>
            <PaginationLink isActive>
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        )}
        
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            aria-disabled={isNextDisabled || isLoading}
            className={
              isNextDisabled || isLoading
                ? "pointer-events-none opacity-60 text-muted-foreground/70"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
