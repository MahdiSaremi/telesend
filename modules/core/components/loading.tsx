import {LoaderCircleIcon} from "lucide-react";
import * as React from "react";
import {cn} from "@/lib/utils";

export function LoadableArea({loading, children}: {
    loading: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="relative">
            <div className={cn(loading && "opacity-50")}>
                {children}
            </div>
            {loading && <div className="absolute inset-0 flex items-center justify-center pb-8">
                <LoaderCircleIcon className="animate-spin" />
            </div>}
        </div>
    )
}