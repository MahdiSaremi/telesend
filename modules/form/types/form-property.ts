import {FormContext} from "@/modules/form/context/FormContext";

export interface FormProperty<V = any> {
    name?: string;
    label?: string | React.ReactNode;
    labelAction?: string | React.ReactNode;
    context?: FormContext | null;
    attachForm?: boolean;
    disabled?: boolean;
    error?: string | React.ReactNode;
    value?: V;
    setValue?: (value: V) => void;
    defaultValue?: V;
    withoutContainer?: boolean;
    containerClassName?: string;
}

export interface FormInputUsed<V = any> {
    property: FormProperty<V>;
    value: V;
    setValue: (value: V) => void;
    disabled: boolean;
    error?: string | React.ReactNode;
    releaseProps: <T extends object & FormProperty>(props: T) => Omit<T, keyof FormProperty>;
}
