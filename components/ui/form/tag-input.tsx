import * as React from "react"
import {cn} from "@/lib/utils"
import {motion, AnimatePresence} from "motion/react"
import {FormProperty} from "@/modules/form/types/form-property";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";
import {InputContainer} from "@/modules/form/components/form-base";

export function TagInput({className, inputClassName, placeholder, prefix, suffix, ...props}: {
    className?: string
    inputClassName?: string
    placeholder?: string
    prefix?: React.ReactNode
    suffix?: React.ReactNode
} & FormProperty<string[]>) {
    const used = useFormProperty<string[]>(props, {defaultValue: []})
    const [inputValue, setInputValue] = React.useState("")

    const addTag = (tag: string) => {
        const normalized = tag.trim()
        if (!normalized) return
        if (used.value.includes(normalized)) return

        used.setValue([...used.value, normalized])
        setInputValue("")
    }

    const removeTag = (index: number) => {
        used.setValue(used.value.filter((_, i) => i !== index))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key == "Tab") {
            e.preventDefault()
            addTag(inputValue)
        }

        if (e.key === "Backspace" && !inputValue && used.value.length) {
            removeTag(used.value.length - 1)
        }
    }

    return (
        <InputContainer used={used}>
            <div
                className={cn(
                    "dark:bg-input/30 border-input flex min-h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    "flex flex-wrap items-center gap-2",
                    "has-[:disabled]:opacity-40",
                    used.error && "border-destructive",
                    className,
                )}
            >
                {prefix && <div className="border-e pe-2 text-muted-foreground">{prefix}</div>}

                {/* tags */}
                <AnimatePresence>
                    {used.value.map((tag, index) => (
                        <motion.span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.8, y: 10}}
                            transition={{duration: 0.1}}
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="text-muted-foreground hover:text-foreground"
                                disabled={used.disabled}
                            >
                                ×
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>

                {/* input */}
                <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={used.value.length === 0 ? placeholder : ""}
                    className={cn(
                        "flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm",
                        inputClassName,
                    )}
                    onBlur={() => addTag(inputValue)}
                    disabled={used.disabled}
                />

                {suffix && <div className="border-s ps-2 text-muted-foreground">{suffix}</div>}
            </div>
        </InputContainer>
    )
}
