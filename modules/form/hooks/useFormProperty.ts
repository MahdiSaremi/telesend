import {FormInputUsed, FormProperty} from "@/modules/form/types/form-property";
import {FormContext, useFormContext} from "@/modules/form/context/FormContext";
import {useEffect, useRef, useState} from "react";

export function useFormProperty<V = any>(property: FormProperty<V>, {value, setValue, defaultValue: defaultValueIn}: {
    defaultValue: V;
    value?: V;
    setValue?: (value: V) => void;
}): FormInputUsed<V> {
    let {attachForm, context, name} = property

    const defaultFormContext = useFormContext()
    const [defaultValue, setDefaultValue] = useState(() =>
        value !== undefined ? value :
            property.value !== undefined ? property.value :
                property.defaultValue !== undefined ? property.defaultValue : defaultValueIn
    )

    if (attachForm ?? true) {
        context ??= defaultFormContext
    }

    if (!setValue) {
        [value, setValue] = property.setValue ? [property.value, property.setValue] : [defaultValue, setDefaultValue]
    }

    const latestValue = useRef(value);

    useEffect(() => {
        latestValue.current = value
    }, [value]);

    useEffect(() => {
        if (!context || !name) return;

        // context.form.register(name)

        let formValue = context.form.getValues(name)
        if (formValue === undefined && (defaultValueIn !== undefined || property.defaultValue !== undefined)) {
            formValue = property.defaultValue !== undefined ? property.defaultValue : defaultValueIn
            setValue(formValue)
            latestValue.current = formValue
            context.form.setValue(name, formValue)
        } else if (formValue !== undefined) {
            setValue(formValue)
            latestValue.current = formValue
        }

        // return () => context.form.unregister(name)
    }, [context?.form, name])

    useEffect(() => {
        if (!context || !name) return;

        if (latestValue.current !== context.form.getValues(name)) {
            context.form.setValue(name, latestValue.current)
        }
    }, [context?.form, name, value])

    useEffect(() => {
        if (!context || !name) return

        const subscription = context.form.watch((values, info) => {
            if (info.name == name) {
                if (values[name] === undefined && (defaultValueIn !== undefined || property.defaultValue !== undefined)) {
                    values[name] = property.defaultValue !== undefined ? property.defaultValue : defaultValueIn
                } else if (values[name] !== value) {
                    setValue(values[name])
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [context?.form, name])

    return {
        property,
        // @ts-ignore
        value,
        setValue,
        disabled: property.disabled || context?.disabled || context?.loading || false,
        error: property.error ?? (name ? (context?.form.formState.errors[name]?.message as string | undefined) : undefined),
        releaseProps: props => {
            const keys = [
                "name",
                "label",
                "labelAction",
                "context",
                "attachForm",
                "disabled",
                "error",
                "value",
                "setValue",
                "withoutContainer",
                "defaultValue",
                "containerClassName",
            ]

            const result = {...props} as any
            for (const key of Object.keys(props)) {
                if (keys.includes(key)) {
                    delete result[key]
                }
            }
            return result
        },
    } satisfies FormInputUsed<V>
}
