'use client'

import JalaliCalendar from "@/components/ui/JalaliDatePicker";
import PersianDate from "@alireza-ab/persian-date";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import {FormProperty} from "@/modules/form/types/form-property";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";
import {Input} from "@/components/ui/form/input";
import {InputContainer} from "@/modules/form/components/form-base";

export function DatePicker({inputClassName, type = 'date', timeType = 'minute', ...props}: {
    className?: string;
    inputClassName?: string;
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    type?: 'date' | 'datetime';
    timeType?: 'hour' | 'minute' | 'second';
} & Omit<React.ComponentProps<"input">, "value" | "defaultValue"> & FormProperty<PersianDate | null>) {
    const used = useFormProperty<PersianDate | null>(props, {defaultValue: null})
    const ctx = used.property.context
    const name = used.property.name
    const selectedDate = used.value

    const getInputValue = () => {
        if (!selectedDate) {
            return ''
        }

        const year = selectedDate.year();
        const month = String(selectedDate.month()).padStart(2, '0');
        const day = String(selectedDate.date()).padStart(2, '0');
        const hour = String(selectedDate.hour()).padStart(2, '0');
        const minute = String(selectedDate.minute()).padStart(2, '0');
        const second = String(selectedDate.second()).padStart(2, '0');

        if (type === 'datetime') {
            if (timeType === 'second') {
                return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
            } else if (timeType === 'minute') {
                return `${year}/${month}/${day} ${hour}:${minute}`;
            } else if (timeType === 'hour') {
                return `${year}/${month}/${day} ${hour}`;
            }
        } else if (type === 'date') {
            return `${year}/${month}/${day}`;
        }

        return '';
    }

    return (
        <InputContainer used={used}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Input
                        {...used.releaseProps(props)}
                        attachForm={false}
                        displayValue={getInputValue()}
                        inputClassName={cn("text-start", inputClassName)}
                        type="input"
                        name={name}
                        disabled={used.disabled}
                        error={used.error}
                        readOnly
                        withoutContainer
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="mt-4">
                    <JalaliCalendar
                        value={selectedDate}
                        onChange={used.setValue}
                        type={type}
                        timeType={timeType}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </InputContainer>
    )
}
