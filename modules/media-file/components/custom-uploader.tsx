'use client'

import React, {DependencyList, useContext, useEffect, useRef, useState} from "react";
import {MediaFile, MediaKey} from "@/modules/media-file/types/media-types";
import {Slot} from "@radix-ui/react-slot";
import {apiFetcher} from "@/modules/apis/utils/api-fetcher";

const CustomFileUploaderContext = React.createContext<{
    isUploading: boolean;
    upload: () => void;
    disabled: boolean;
} | null>(null)

export function CustomFileUploader({onUploading, onUploaded, onError, mediaKey, children, middleware, disabled = false, ...props}: Omit<React.ComponentProps<"div">, "children"> & {
    onUploading?: () => void;
    onUploaded?: (file: MediaFile) => void;
    onError?: () => void;
    mediaKey?: MediaKey | null;
    children: (state: { uploading: boolean, progress: number, dragging: boolean }) => React.ReactNode;
    deps?: DependencyList;
    middleware?: (callback: () => void) => void;
    disabled?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [previewName, setPreviewName] = useState('')
    const [dragging, setDragging] = useState(false)
    const dragCounter = useRef(0)

    const handleFiles = async (files: FileList | null) => {
        if (!files || !files[0]) return
        const file = files[0]
        setPreviewName(file.name)
        setUploading(true)
        setProgress(0)
        onUploading?.()

        const formData = new FormData()
        formData.append('file', file)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', apiFetcher.getEndpoint('/v1/media-files/upload'))

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100)
                setProgress(percent)
            }
        }

        xhr.onload = () => {
            setUploading(false)
            try {
                const res = JSON.parse(xhr.responseText)
                onUploaded && onUploaded(res.data)
            } catch (e) {
                onError?.()
                console.log(e)
            }
        }

        xhr.onerror = () => {
            setUploading(false)
            onError?.()
        }

        xhr.send(formData)
    }

    useEffect(() => {
        if (disabled) {
            dragCounter.current = 0
            setDragging(false)
        }
    }, [disabled])

    return (
        <CustomFileUploaderContext.Provider value={{
            isUploading: uploading,
            upload: () => inputRef.current?.click(),
            disabled: disabled,
        }}>
            <div
                onDrop={(e) => {
                    e.preventDefault()
                    dragCounter.current = 0
                    setDragging(false)

                    if (disabled) return

                    handleFiles(e.dataTransfer.files)
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                }}
                onDragEnter={(e) => {
                    e.preventDefault()

                    if (disabled) return

                    dragCounter.current += 1
                    setDragging(true)
                }}
                onDragLeave={(e) => {
                    e.preventDefault()

                    if (disabled) return

                    dragCounter.current -= 1
                    if (dragCounter.current === 0) {
                        setDragging(false)
                    }
                }}
                {...props}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={inputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                    accept={mediaKey?.extension?.split(",").map(e => "." + e).join(",") ?? undefined}
                />

                {children({uploading, progress, dragging})}
            </div>
        </CustomFileUploaderContext.Provider>
    )

    // return (
    //     <div
    //         onClick={() => inputRef.current?.click()}
    //         onDrop={(e) => {
    //             e.preventDefault()
    //             handleFiles(e.dataTransfer.files)
    //         }}
    //         onDragOver={(e) => e.preventDefault()}
    //         className="border-2 border-dashed border-gray-400 p-6 rounded-md text-center cursor-pointer"
    //     >
    //         <input
    //             type="file"
    //             className="hidden"
    //             ref={inputRef}
    //             onChange={(e) => handleFiles(e.target.files)}
    //         />
    //
    //         {uploading ? (
    //             <div>
    //                 <p>{previewName}</p>
    //                 <div className="w-full h-2 bg-gray-200 rounded mt-2">
    //                     <div
    //                         className="h-2 bg-blue-500 rounded"
    //                         style={{ width: `${progress}%` }}
    //                     ></div>
    //                 </div>
    //                 <p className="text-sm text-gray-500 mt-1">{progress}%</p>
    //             </div>
    //         ) : (
    //             <p>{previewName || 'برای آپلود کلیک یا فایل را درگ کن'}</p>
    //         )}
    //     </div>
    // )
}

export function CustomFileUploaderTrigger({asChild = false, ...props}: {
    asChild?: boolean;
    disabled?: boolean;
} & React.ComponentProps<"div">) {
    const Comp = asChild ? Slot : "div"
    const ctx = useContext(CustomFileUploaderContext)

    return (
        <Comp
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                if (ctx?.disabled) return

                ctx?.upload?.()
            }}
            {...props}
        />
    )
}