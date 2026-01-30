import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/form/input";
import {SearchIcon} from "lucide-react";
import React from "react";

export function Table({columns, rows, empty}: {
    columns?: Array<{
        title?: string;
        hiddenTitle?: string;
        className?: string;
        visible?: boolean;
    }>;
    rows: Array<{
        key?: string | number;
        data: Array<{
            value?: string | React.ReactNode;
            className?: string;
        }>;
        className?: string;
    }>;
    empty?: string | React.ReactNode;
}) {
    return (
        <div className="relative overflow-x-auto">
            {(rows.length > 0 || !empty) && <table className="w-full text-sm text-muted-foreground">
                <thead className="text-xs text-slate-700">
                {columns && <tr>
                    {columns.map((column, index) => column.visible !== false && (
                        <th scope="col" className={cn("px-6 py-3", column.className)} key={index}>
                            {column.title}
                            {column.hiddenTitle && <span className="sr-only">{column.hiddenTitle}</span>}
                        </th>
                    ))}
                </tr>}
                </thead>
                <tbody>
                {rows.map((row, index) => (
                    <tr className={cn("border-b dark:border-slate-700 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600", row.className)}
                        key={row.key ?? index}>
                        {row.data.map((column, index) => columns?.[index]?.visible !== false && (
                            <td className={cn("px-6 py-4", column.className)} key={index}>
                                {column.value}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>}

            {empty && rows.length == 0 && (
                <div className="w-full text-muted-foreground text-center text-sm py-8">
                    {empty}
                </div>
            )}
        </div>
    )
}

export function TableOptions({search, onSearching, actions}: {
    search?: string;
    onSearching?: (value: string) => void;
    actions?: React.ReactNode;
}) {
    return (
        <div className="flex gap-4 flex-wrap">
            {onSearching && <div className="grow">
                <Input
                    className="w-full max-w-96"
                    icon={SearchIcon}
                    placeholder="جستجو کنید..."
                    value={search}
                    setValue={onSearching}
                />
            </div>}
            <div className="ms-auto flex flex-wrap gap-4 justify-end">
                {actions}
            </div>
        </div>
    )
}
