'use client'

import {useEffect, useRef} from "react";

export function ScreenContainer({children, resizeUsing}: {
    children?: React.ReactNode;
    resizeUsing?: (def: () => void) => void;
}) {
    const containerElement = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!containerElement.current || !window.visualViewport) return

        const callbackDefault = () => {
            containerElement.current!.style.height = window.visualViewport!.height + "px"
        }

        const callback = resizeUsing ? (() => resizeUsing(callbackDefault)) : callbackDefault

        callback()

        window.visualViewport.addEventListener("resize", callback)
        return () => window.visualViewport?.removeEventListener("resize", callback)
    }, [containerElement])

    return (
        <div className="h-screen overflow-hidden" ref={containerElement}>
            {children}
        </div>
    )
}
