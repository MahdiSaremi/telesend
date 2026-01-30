'use client'

import {Editor, EditorContent, useEditor} from "@tiptap/react";
import {StarterKit} from "@tiptap/starter-kit";
import {cn} from "@/lib/utils";
import {InputContainer} from "@/modules/form/components/form-base";
import React, {useEffect, useState} from "react";
import {FormProperty} from "@/modules/form/types/form-property";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";
import {
    ArrowDownIcon,
    ChevronDownIcon, Code2Icon, CodeIcon, ListIcon, ListOrderedIcon, QuoteIcon,
    Redo2Icon,
    SeparatorHorizontalIcon,
    SpaceIcon,
    ThumbsDownIcon,
    Undo2Icon
} from "lucide-react";
import {Select} from "@/components/ui/form/select";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

interface HtmlEditorToolbar {
    default?: boolean;
    paragraph?: boolean;
    h1?: boolean;
    h2?: boolean;
    h3?: boolean;
    h4?: boolean;
    h5?: boolean;
    h6?: boolean;
    bold?: boolean;
    italic?: boolean;
    strike?: boolean;
    code?: boolean;
    list?: boolean;
    orderedList?: boolean;
    codeBlock?: boolean;
    quote?: boolean;
    hr?: boolean;
    breakLine?: boolean;
    undo?: boolean;
    redo?: boolean;
}

export const defaultHtmlStyle = cn([
    "[&_h1]:text-4xl [&_h1]:mb-2",
    "[&_h2]:text-3xl [&_h2]:mb-2",
    "[&_h3]:text-2xl [&_h3]:mb-2",
    "[&_h4]:text-[1.375rem] [&_h4]:mb-2",
    "[&_h5]:text-xl [&_h5]:mb-2",
    "[&_h6]:text-lg [&_h6]:mb-2",
    "[&_p_code]:text-slate-700 [&_p_code]:bg-slate-200 [&_p_code]:rounded-lg [&_p_code]:px-1",
    "[&_ul_li]:list-disc [&_ul_li]:ms-4",
    "[&_ol_li]:list-decimal [&_ol_li]:ms-4",
    "[&_pre]:text-slate-800 [&_pre]:bg-slate-100 [&_pre]:rounded-lg [&_pre]:px-4 [&_pre]:py-2",
    "[&_blockquote]:ps-2 [&_blockquote]:relative [&_blockquote]:before:content-['_'] [&_blockquote]:before:absolute [&_blockquote]:before:start-0 [&_blockquote]:before:h-full [&_blockquote]:before:w-0.75 [&_blockquote]:before:bg-primary [&_blockquote]:before:rounded-lg",
    "[&_hr]:my-4",
])

export function HtmlEditor({className, placeholder, toolbar, htmlStyle, ...props}: {
    className?: string;
    toolbar?: HtmlEditorToolbar;
    htmlStyle?: string;
} & Omit<React.ComponentProps<"input">, "value"> & FormProperty<string>) {
    const used = useFormProperty<string>(props, {defaultValue: ""})
    // const ctx = context ?? useFormContext()
    // const value = ctx?.form?.watch(name)
    const [editorValue, setEditorValue] = useState<string | null | undefined>(() => used.value)
    const [updatedValue, setUpdatedValue] = useState(() => used.value)

    const editor = useEditor({
        extensions: [StarterKit],
        content: updatedValue || "",
        onUpdate: e => {
            used.setValue(e.editor.getHTML())
            setEditorValue(e.editor.getHTML())
        },
        immediatelyRender: false,
    }, [updatedValue])

    useEffect(() => {
        if (used.value !== editorValue) {
            setUpdatedValue(used.value)
            setEditorValue(used.value)
        }
    }, [used.value]);

    return (
        <InputContainer used={used}>
            <div
                className={cn(
                    "dark:bg-input/30 border-input flex min-h-80 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color] md:text-sm",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    "flex flex-col resize-y",
                    used.error && "ring-destructive/20 dark:ring-destructive/40 border-destructive",
                    used.disabled && "opacity-40",
                    className,
                )}
            >
                {editor && <EditorMenuBar
                    editor={editor}
                    toolbar={toolbar}
                    disabled={used.disabled}
                    error={!!used.error}
                />}
                <div className="relative grow flex flex-col">
                    {(!used.value || used.value === "<p></p>") && <p className="absolute text-muted-foreground">{placeholder}</p>}
                    {editor && <EditorContent
                        editor={editor}
                        className={cn(
                            "grow-me-and-my-children",
                            used.disabled && "pointer-events-none",
                            htmlStyle ?? defaultHtmlStyle,
                        )}
                        readOnly={used.disabled}
                    />}
                </div>
            </div>
        </InputContainer>
    )
}

function EditorMenuBar({editor, toolbar, disabled = false, error = false}: {
    editor: Editor;
    toolbar?: HtmlEditorToolbar;
    disabled?: boolean;
    error?: boolean;
}) {
    const tools = {
        paragraph: toolbar?.paragraph ?? toolbar?.default ?? true,
        h1: toolbar?.h1 ?? toolbar?.default ?? true,
        h2: toolbar?.h2 ?? toolbar?.default ?? true,
        h3: toolbar?.h3 ?? toolbar?.default ?? true,
        h4: toolbar?.h4 ?? toolbar?.default ?? true,
        h5: toolbar?.h5 ?? toolbar?.default ?? true,
        h6: toolbar?.h6 ?? toolbar?.default ?? true,
        bold: toolbar?.bold ?? toolbar?.default ?? true,
        italic: toolbar?.italic ?? toolbar?.default ?? true,
        strike: toolbar?.strike ?? toolbar?.default ?? true,
        code: toolbar?.code ?? toolbar?.default ?? true,
        list: toolbar?.list ?? toolbar?.default ?? true,
        orderedList: toolbar?.orderedList ?? toolbar?.default ?? true,
        codeBlock: toolbar?.codeBlock ?? toolbar?.default ?? true,
        quote: toolbar?.quote ?? toolbar?.default ?? true,
        hr: toolbar?.hr ?? toolbar?.default ?? true,
        breakLine: toolbar?.breakLine ?? toolbar?.default ?? true,
        undo: toolbar?.undo ?? toolbar?.default ?? true,
        redo: toolbar?.redo ?? toolbar?.default ?? true,
    }

    const [hOpen, setHOpen] = useState(false)

    return (
        <div className={cn("control-group py-2 w-full", disabled && "pointer-events-none")}>
            <div className="flex flex-wrap gap-2">
                {(tools.paragraph || tools.h1 || tools.h2 || tools.h3 || tools.h4 || tools.h5 || tools.h6) && <DropdownMenu open={hOpen} onOpenChange={setHOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "px-2 py-1 rounded-md cursor-pointer bg-primary text-primary-foreground flex items-center justify-between gap-2 h-8 w-24"
                            )}
                        >
                            {editor.isActive('paragraph') ? "پاراگراف" : (
                                editor.isActive('heading', {level: 1}) ? "تیتر 1" : (
                                    editor.isActive('heading', {level: 2}) ? "تیتر 2": (
                                        editor.isActive('heading', {level: 3}) ? "تیتر 3" : (
                                            editor.isActive('heading', {level: 4}) ? "تیتر 4" : (
                                                editor.isActive('heading', {level: 5}) ? "تیتر 5" : (
                                                    editor.isActive('heading', {level: 6}) ? "تیتر 6" : "هیچکدام"
                                                )
                                            )
                                        )
                                    )
                                )
                            )}
                            <ChevronDownIcon size={16} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <div className="flex flex-col">
                            {tools.paragraph && <button
                                onClick={() => {
                                    editor.chain().focus().setParagraph().run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('paragraph') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                پاراگراف
                            </button>}
                            {tools.h1 && <button
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({level: 1}).run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('heading', {level: 1}) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                تیتر 1
                            </button>}
                            {tools.h2 && <button
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({level: 2}).run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('heading', {level: 2}) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                تیتر 2
                            </button>}
                            {tools.h3 && <button
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({level: 3}).run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('heading', {level: 3}) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                تیتر 3
                            </button>}
                            {tools.h4 && <button
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({level: 4}).run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('heading', {level: 4}) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                تیتر 4
                            </button>}
                            {tools.h5 && <button
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({level: 5}).run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('heading', {level: 5}) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                تیتر 5
                            </button>}
                            {tools.h6 && <button
                                onClick={() => {
                                    editor.chain().focus().toggleHeading({level: 6}).run()
                                    setHOpen(false)
                                }}
                                className={cn(
                                    "px-2 py-2 cursor-pointer",
                                    editor.isActive('heading', {level: 6}) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-slate-800'
                                )}
                            >
                                تیتر 6
                            </button>}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>}
                {tools.bold && <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <b>B</b>
                </button>}
                {tools.italic && <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    }
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <i>I</i>
                </button>}
                {tools.strike && <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('strike') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <s>S</s>
                </button>}
                {tools.code && <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleCode()
                            .run()
                    }
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('code') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <CodeIcon size={18}/>
                </button>}
                {tools.list && <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <ListIcon size={18}/>
                </button>}
                {tools.orderedList && <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <ListOrderedIcon size={18}/>
                </button>}
                {tools.codeBlock && <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('codeBlock') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <Code2Icon size={18}/>
                </button>}
                {tools.quote && <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : 'bg-muted text-slate-800'
                    )}
                >
                    <QuoteIcon size={18}/>
                </button>}
                {tools.hr && <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        'bg-muted text-slate-800',
                    )}
                >
                    <SeparatorHorizontalIcon size={18}/>
                </button>}
                {tools.breakLine && <button
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    className={cn(
                        "px-2 py-1 rounded-md cursor-pointer text-lg size-8 flex items-center justify-center",
                        'bg-muted text-slate-800',
                    )}
                >
                    <ArrowDownIcon size={18}/>
                </button>}
                {tools.undo && <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .undo()
                            .run()
                    }
                    className="px-2 py-1 rounded-md cursor-pointer bg-muted text-slate-800 text-lg size-8 flex items-center justify-center disabled:opacity-40"
                >
                    <Undo2Icon size={18}/>
                </button>}
                {tools.redo && <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .redo()
                            .run()
                    }
                    className="px-2 py-1 rounded-md cursor-pointer bg-muted text-slate-800 text-lg size-8 flex items-center justify-center disabled:opacity-40"
                >
                    <Redo2Icon size={18}/>
                </button>}
            </div>
            <hr className={cn("mt-2 -mx-3", error && "border-red-500")}/>
        </div>
    )
}
