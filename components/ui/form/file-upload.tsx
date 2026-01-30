'use client'

import {MediaFile, MediaKey} from "@/modules/media-file/types/media-types";
import {CustomFileUploader, CustomFileUploaderTrigger} from "@/modules/media-file/components/custom-uploader";
import {cn} from "@/lib/utils";
import {PencilIcon, TrashIcon, UploadIcon, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {InputContainer} from "@/modules/form/components/form-base";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import * as React from "react";
import {FormProperty} from "@/modules/form/types/form-property";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";

export function FileUpload({className, mediaKey, placeholder, ...props}: {
    className?: string;
    placeholder?: string | React.ReactNode;
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    mediaKey?: MediaKey | null;
} & FormProperty<MediaFile | null>) {
    const used = useFormProperty<MediaFile | null>(props, {defaultValue: null})
    const media = used.value as MediaFile | null
    const ctx = used.property.context
    const name = used.property.name

    return (
        <InputContainer used={used}>
            <CustomFileUploader
                onUploading={() => {
                    if (ctx && name) {
                        ctx.addProcess(name)
                    }
                }}
                onUploaded={file => {
                    used.setValue(file as any)

                    if (ctx && name) {
                        ctx.removeProcess(name)
                    }
                }}
                onError={() => {
                    if (ctx && name) {
                        ctx.removeProcess(name)
                    }
                }}
                mediaKey={mediaKey ?? ctx?.meta?.mediaKeys?.[name ?? '']}
                disabled={used.disabled}
            >
                {({uploading, progress, dragging}) => (
                    <CustomFileUploaderTrigger>
                        <div
                            className={cn(
                                "border rounded-md py-3 px-4 text-sm transition-all flex items-center gap-2 relative overflow-hidden h-10 text-muted-foreground",
                                !used.disabled && "hover:text-slate-700 cursor-pointer group",
                                used.disabled && "opacity-40",
                                used.error && "border-destructive focus:border-destructive/5! focus:ring-destructive/50!",
                            )}
                        >
                            <UploadIcon size={16} className="group-hover:text-primary transition-all"/>
                            {uploading && `در حال بارگذاری... ${progress}%`}
                            {!uploading && media && (
                                <div className="flex grow items-center">
                                    {media.display_name}
                                    <Button asChild size="sm" variant="link">
                                        <a href={media.url} target="_blank"
                                           onClick={e => e.stopPropagation()}>(دانلود)</a>
                                    </Button>
                                    <Button size="sm" variant="unstyled" className="ms-auto -me-3" onClick={e => {
                                        e.stopPropagation()
                                        used.setValue(null as any)
                                    }}>
                                        <XIcon/>
                                    </Button>
                                </div>
                            )}
                            {!uploading && !media && (placeholder ?? "بارگیری فایل...")}
                            {uploading && <div className="absolute bottom-0 h-0.5 left-0 right-0 flex justify-end">
                                <div className="h-full bg-primary" style={{width: `${progress}%`}}/>
                            </div>}
                            {dragging && <div className="absolute inset-0 bg-slate-100/70 flex items-center justify-center text-primary">
                                برای آپلود رها کنید...
                            </div>}
                        </div>
                    </CustomFileUploaderTrigger>
                )}
            </CustomFileUploader>
        </InputContainer>
    )
}

export function AvatarUpload({className, mediaKey, placeholder, ...props}: {
    className?: string;
    placeholder?: string | React.ReactNode;
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    mediaKey?: MediaKey | null;
} & FormProperty<MediaFile | null>) {
    const used = useFormProperty<MediaFile | null>(props, {defaultValue: null})
    const media = used.value as MediaFile | null
    const ctx = used.property.context
    const name = used.property.name

    return (
        <InputContainer used={used}>
            <CustomFileUploader
                onUploading={() => {
                    if (ctx && name) {
                        ctx.addProcess(name)
                    }
                }}
                onUploaded={(file) => {
                    used.setValue(file)

                    if (ctx && name) {
                        ctx.removeProcess(name)
                    }
                }}
                onError={() => {
                    if (ctx && name) {
                        ctx.removeProcess(name)
                    }
                }}
                className="h-full w-full"
                mediaKey={mediaKey ?? ctx?.meta?.mediaKeys?.[name ?? '']}
                disabled={used.disabled}
            >
                {({uploading, progress, dragging}) => (
                    <>
                        <Avatar
                            className={cn(
                                "w-full h-auto aspect-square relative transition-all",
                                used.disabled && "pointer-events-none opacity-80",
                                used.error && "border border-destructive",
                            )}
                        >
                            <AvatarImage src={uploading ? undefined : media?.url}/>
                            <AvatarFallback>{uploading ? null : placeholder}</AvatarFallback>
                            {uploading && <div
                                className="bg-slate-300/60 absolute inset-x-0 bottom-0 flex justify-center items-center text-white"
                                style={{height: `${progress}%`}}
                            >
                            </div>}
                            {uploading && <div
                                className="absolute inset-0 flex flex-col gap-2 justify-center items-center text-primary"
                            >
                                <span className="text-xl">{progress}%</span>
                                <span className="text-xs">در حال بارگذاری</span>
                            </div>}
                            {dragging && <div
                                className="bg-slate-900/60 absolute inset-0 flex justify-center items-center text-white">
                                <div className="flex flex-col items-center gap-3">
                                    <UploadIcon size={32} />
                                    برای بارگذاری رها کنید
                                </div>
                            </div>}
                        </Avatar>
                        <div className="grid grid-cols-2 mt-3 gap-2">
                            <CustomFileUploaderTrigger asChild>
                                <Button
                                    variant="soft"
                                    disabled={used.disabled || uploading}
                                    icon={<PencilIcon />}
                                >
                                    ویرایش
                                </Button>
                            </CustomFileUploaderTrigger>
                            <Button
                                variant="soft"
                                onClick={e => {
                                    used.setValue(null as any)
                                }}
                                disabled={used.disabled || uploading || used.value === null || used.value === undefined}
                                icon={<TrashIcon />}
                            >
                                حذف
                            </Button>
                        </div>
                    </>
                )}
            </CustomFileUploader>
        </InputContainer>
    )
}

export function ImageUpload({className, mediaKey, placeholder, ...props}: {
    className?: string;
    placeholder?: string | React.ReactNode;
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    mediaKey?: MediaKey | null;
} & FormProperty<MediaFile | null>) {
    const used = useFormProperty<MediaFile | null>(props, {defaultValue: null})
    const media = used.value as MediaFile | null
    const ctx = used.property.context
    const name = used.property.name

    return (
        <InputContainer used={used}>
            <CustomFileUploader
                onUploading={() => {
                    if (ctx && name) {
                        ctx.addProcess(name)
                    }
                }}
                onUploaded={(file) => {
                    used.setValue(file)

                    if (ctx && name) {
                        ctx.removeProcess(name)
                    }
                }}
                onError={() => {
                    if (ctx && name) {
                        ctx.removeProcess(name)
                    }
                }}
                className="h-full w-full"
                mediaKey={mediaKey ?? ctx?.meta?.mediaKeys?.[name ?? '']}
            >
                {({uploading, progress, dragging}) => (
                    <>
                        <div
                            className={cn(
                                "w-full h-auto aspect-square relative transition-all rounded-xl overflow-hidden",
                                used.disabled && "pointer-events-none opacity-80",
                                used.error && "border border-destructive",
                                className,
                            )}
                        >
                            <div className="absolute inset-0 bg-slate-100">{uploading ? null : placeholder}</div>
                            {!uploading && media?.url && <img src={media.url} alt="Form Image" className="absolute inset-0"/>}
                            {uploading && <div
                                className="bg-slate-300/60 absolute inset-x-0 bottom-0 flex justify-center items-center text-white"
                                style={{height: `${progress}%`}}
                            >
                            </div>}
                            {uploading && <div
                                className="absolute inset-0 flex flex-col gap-2 justify-center items-center text-primary"
                            >
                                <span className="text-xl">{progress}%</span>
                                <span className="text-xs">در حال بارگذاری</span>
                            </div>}
                            {dragging && <div
                                className="bg-slate-900/60 absolute inset-0 flex justify-center items-center text-white">
                                <div className="flex flex-col items-center gap-3">
                                    <UploadIcon size={32} />
                                    برای بارگذاری رها کنید
                                </div>
                            </div>}
                        </div>
                        <div className="grid grid-cols-2 mt-3 gap-2">
                            <CustomFileUploaderTrigger asChild>
                                <Button
                                    variant="soft"
                                    disabled={uploading || used.disabled}
                                    icon={<PencilIcon />}
                                >
                                    ویرایش
                                </Button>
                            </CustomFileUploaderTrigger>
                            <Button
                                variant="soft"
                                onClick={e => {
                                    used.setValue(null as any)
                                }}
                                disabled={uploading || used.disabled || used.value === null || used.value === undefined}
                                icon={<TrashIcon />}
                            >
                                حذف
                            </Button>
                        </div>
                    </>
                )}
            </CustomFileUploader>
        </InputContainer>
    )
}
