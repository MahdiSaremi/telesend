'use client'

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import * as React from "react";
import {UseCrudIndexProps} from "@/modules/crud/hooks/useCrudIndex";

export function Paginate({page, lastPage, setPage, ...props}: {
    page: number;
    lastPage: number;
    setPage: (page: number) => void;
} & React.ComponentProps<"nav">) {
    let all = []
    for (let i = Math.max(1, page - 2); i <= Math.min(lastPage, page + 2); i++) {
        all.push(i)
    }

    const handlePage = (page: number) => {
        return (e: any) => {
            e.preventDefault()
            if (page >= 1 && page <= lastPage) {
                setPage(page)
            }
        }
    }

    return (
        <Pagination {...props}>
            <div className="text-xs text-muted-foreground self-center me-4">
                <span className="lg:hidden">
                    صفحه
                    {` ${page} `}
                    از
                    {` ${lastPage} `}
                </span>
            </div>
            <PaginationContent dir="ltr">
                <PaginationItem>
                    <PaginationPrevious href="#" onClick={handlePage(page - 1)}/>
                </PaginationItem>
                {page >= 4 && (
                    <>
                        <PaginationItem className="hidden lg:block">
                            <PaginationLink href="#" isActive={1 == page} onClick={handlePage(1)}>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem className="hidden lg:block">
                            <PaginationEllipsis/>
                        </PaginationItem>
                    </>
                )}
                {all.map((i) => (
                    <PaginationItem key={i} className="hidden lg:block">
                        <PaginationLink href="#" isActive={i == page} onClick={handlePage(i)}>{i}</PaginationLink>
                    </PaginationItem>
                ))}
                {lastPage - page >= 3 && (
                    <>
                        <PaginationItem className="hidden lg:block">
                            <PaginationEllipsis/>
                        </PaginationItem>
                        <PaginationItem className="hidden lg:block">
                            <PaginationLink href="#" isActive={lastPage == page} onClick={handlePage(lastPage)}>{lastPage}</PaginationLink>
                        </PaginationItem>
                    </>
                )}
                <PaginationItem>
                    <PaginationNext href="#" onClick={handlePage(page + 1)}/>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export function PaginateCrud({crud}: {
    crud: UseCrudIndexProps;
}) {
    return (
        <Paginate page={crud.page} lastPage={crud.lastPage} setPage={crud.setPage} />
    )
}