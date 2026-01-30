'use client'

import {useEffect, useRef} from "react";

export function ScreenContainer({children}: {
    children?: React.ReactNode;
}) {
    const containerElement = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!containerElement.current || !window.visualViewport) return

        const callback = () => {
            containerElement.current!.style.height = window.visualViewport!.height + "px"
        }

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
