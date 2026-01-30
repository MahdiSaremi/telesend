'use client'

import {createContext, useContext} from "react";
import {UseFormReturn} from "react-hook-form";
import {FormMeta} from "@/modules/form/types/form-meta";

export interface FormContext {
    form: UseFormReturn<any, any, any>;
    loading: boolean;
    setLoading: (value: boolean) => void;
    processing: boolean;
    addProcess: (name: string) => void;
    removeProcess: (name: string) => void;
    disabled: boolean;
    meta?: FormMeta;
}

export const FormReactContext = createContext<FormContext | null>(null)

export const useFormContext = () => useContext(FormReactContext)
