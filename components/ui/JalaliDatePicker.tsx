'use client'

import {useEffect, useState} from 'react'
import PersianDate from '@alireza-ab/persian-date'
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/form/input";
import {ArrowUpIcon, ChevronDownIcon, ChevronUpIcon} from "lucide-react";

const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
    'مرداد', 'شهریور', 'مهر', 'آبان',
    'آذر', 'دی', 'بهمن', 'اسفند'
]

// تابع اصلاح‌شده برای محاسبه ایندکس اولین روز هفته شمسی
function firstWeekDay(jYear: number, jMonth: number): number {
    // ایجاد یک شی PersianDate برای اولین روز ماه
    const pd = new PersianDate([jYear, jMonth, 1], 'jalali');
    // تبدیل آن به تاریخ میلادی
    const gregDate = pd.toDate();
    // گرفتن روز هفته به فرمت جاوااسکریپت (0 = یکشنبه, 6 = شنبه)
    const jsDay = gregDate.getDay();

    // تبدیل روز جاوااسکریپت به روز شمسی (0 = شنبه, 6 = جمعه)
    const persianDayIndex = (jsDay + 1) % 7;
    return persianDayIndex;
}

export interface JalaliCalendarProps {
    value?: PersianDate | null;
    onChange?: (value: PersianDate | null) => void;
    type?: 'date' | 'datetime';
    timeType?: 'hour' | 'minute' | 'second';
}

export default function JalaliCalendar({
                                           value,
                                           onChange,
                                           type = 'date',
                                           timeType = 'minute',
                                       }: JalaliCalendarProps) {
    const today = new PersianDate(undefined, 'jalali')
    const date = value ?? today
    const [year, setYear] = useState(date.year())
    const [month, setMonth] = useState(date.month())
    const [selected, setSelected] = useState<PersianDate | null>(null)
    const [mode, setMode] = useState<'day' | 'month' | 'year'>('day')
    const [time, setTime] = useState({
        hour: date.hour(),
        minute: date.minute(),
        second: date.second(),
    });

    useEffect(() => {
        if (!value) {
            return
        }

        const date = value ?? new PersianDate(undefined, 'jalali')

        setYear(date.year())
        setMonth(date.month())
        setSelected(value)
        setTime({
            hour: date.hour(),
            minute: date.minute(),
            second: date.second(),
        })
    }, [value])

    const handleTimeChange = (unit: 'hour' | 'minute' | 'second', newValue: number) => {
        if (unit === 'hour') {
            newValue = Math.min(Math.max(newValue, 0), 23)
        } else if (unit === 'minute') {
            newValue = Math.min(Math.max(newValue, 0), 59)
        } else if (unit === 'second') {
            newValue = Math.min(Math.max(newValue, 0), 59)
        }

        const newTime = {...time, [unit]: newValue};
        setTime(newTime);
        if (selected) {
            const newDate = new PersianDate([
                selected.year(),
                selected.month(),
                selected.date(),
                newTime.hour,
                newTime.minute,
                newTime.second,
            ], 'jalali');
            onChange?.(newDate);
        }
    };

    const handleTimeIncrement = (unit: 'hour' | 'minute' | 'second', increment: boolean) => {
        let hour = time.hour
        let minute = time.minute
        let second = time.second

        if (unit == 'hour') {
            hour += increment ? 1 : -1
        } else if (unit == 'minute') {
            minute += increment ? 1 : -1
        } else if (unit == 'second') {
            second += increment ? 1 : -1
        }

        if (second < 0) {
            second = 60 + second
            minute--
        } else if (second > 59) {
            second = second - 60
            minute++
        }

        if (minute < 0) {
            minute = 60 + minute
            hour--
        } else if (minute > 59) {
            minute = minute - 60
            hour++
        }

        if (hour < 0) {
            hour = 24 + hour
        } else if (hour > 23) {
            hour = hour - 24
        }

        const newTime = {hour, minute, second};
        setTime(newTime);
        if (selected) {
            const newDate = new PersianDate([
                selected.year(),
                selected.month(),
                selected.date(),
                newTime.hour,
                newTime.minute,
                newTime.second,
            ], 'jalali');
            onChange?.(newDate);
        }
    };

    const handleSelect = (date: PersianDate | null): void => {
        if (type === 'datetime' && date) {
            const newDateWithTime = new PersianDate([
                date.year(),
                date.month(),
                date.date(),
                time.hour,
                time.minute,
                time.second,
            ], 'jalali');
            setSelected(newDateWithTime);
            onChange?.(newDateWithTime);
        } else {
            setSelected(date);
            onChange?.(date);
        }
    };

    const [startYearRange, setStartYearRange] = useState(date.year() - (date.year() % 12));

    const totalDays = PersianDate.getDaysInMonth('jalali', year, month)
    const firstDayIndex = firstWeekDay(year, month)

    const daysArray = Array.from({length: firstDayIndex}, () => 0)
        .concat(Array.from({length: totalDays}, (_, i) => i + 1))

    const yearsRange = Array.from({length: 12}, (_, i) => startYearRange + i);

    function handleMonthChange(newMonth: number) {
        setMonth(newMonth)
        setMode('day')
    }

    function handleYearChange(newYear: number) {
        setYear(newYear)
        setMode('month')
    }

    function handlePrevious() {
        const prev = new PersianDate([year, month, 1], 'jalali').subMonth(1)
        setYear(prev.year());
        setMonth(prev.month())
    }

    function handleNext() {
        const next = new PersianDate([year, month, 1], 'jalali').addMonth(1)
        setYear(next.year());
        setMonth(next.month())
    }

    function handleYearRangePrevious() {
        setStartYearRange(startYearRange - 12);
    }

    function handleYearRangeNext() {
        setStartYearRange(startYearRange + 12);
    }

    return (
        <div className="w-80 md:w-96 p-4 border rounded-2xl bg-white shadow-xl shadow-slate-500/10" dir="rtl">
            {mode === 'day' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handlePrevious}
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5l7 7-7 7"></path>
                            </svg>
                        </Button>
                        <div className="flex gap-4 cursor-pointer select-none">
                            <span
                                onClick={() => setMode('month')}
                                className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                                {months[month - 1]}
                            </span>
                            <span
                                onClick={() => setMode('year')}
                                className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                                {year}
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleNext}
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-sm font-medium mb-2">
                        {weekDays.map((d, i) => <div key={i} className="text-gray-500">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        {daysArray.map((day, i) => {
                            const isSelected = day && selected?.year() === year && selected.month() === month && selected.date() === day
                            const isToday = day && today.year() === year && today.month() === month && today.date() === day

                            return (
                                <Button
                                    key={i}
                                    type="button"
                                    disabled={day === 0}
                                    variant={day === 0 ? 'ghost' : (isSelected ? 'default' : (isToday ? 'soft-primary' : 'ghost'))}
                                    onClick={() => day && handleSelect(new PersianDate([year, month, day], 'jalali'))}
                                >
                                    {day || ''}
                                </Button>
                            )
                        })}
                    </div>

                    {selected && (
                        <>
                            {type === 'datetime' && (
                                <>
                                    <hr className="my-4"/>
                                    <div className="mt-2 text-sm flex justify-center">
                                        <div className="flex items-center gap-2" dir="ltr">
                                            <div className="flex flex-col items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    icon={<ChevronUpIcon />}
                                                    onClick={() => handleTimeIncrement('hour', true)}
                                                />
                                                <Input
                                                    inputMode="numeric"
                                                    value={time.hour.toString()}
                                                    setValue={newValue => handleTimeChange('hour', newValue ? parseInt(newValue) : 0)}
                                                    className="w-12"
                                                    inputClassName="text-center"
                                                    min="0"
                                                    max="23"
                                                    displayValue={v => v.length == 1 ? '0' + v : v}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    icon={<ChevronDownIcon />}
                                                    onClick={() => handleTimeIncrement('hour', false)}
                                                />
                                            </div>
                                            {timeType !== 'hour' && (
                                                <>
                                                    <span className="text-2xl">:</span>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            icon={<ChevronUpIcon />}
                                                            onClick={() => handleTimeIncrement('minute', true)}
                                                        />
                                                        <Input
                                                            inputMode="numeric"
                                                            value={time.minute.toString()}
                                                            setValue={newValue => handleTimeChange('minute', parseInt(newValue))}
                                                            className="w-12"
                                                            inputClassName="text-center"
                                                            min="0"
                                                            max="59"
                                                            displayValue={v => v.length == 1 ? '0' + v : v}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            icon={<ChevronDownIcon />}
                                                            onClick={() => handleTimeIncrement('minute', false)}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {timeType === 'second' && (
                                                <>
                                                    <span className="text-2xl">:</span>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            icon={<ChevronUpIcon />}
                                                            onClick={() => handleTimeIncrement('second', true)}
                                                        />
                                                        <Input
                                                            inputMode="numeric"
                                                            value={time.second.toString()}
                                                            setValue={newValue => handleTimeChange('second', parseInt(newValue))}
                                                            className="w-12"
                                                            inputClassName="text-center"
                                                            min="0"
                                                            max="59"
                                                            displayValue={v => v.length == 1 ? '0' + v : v}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            icon={<ChevronDownIcon />}
                                                            onClick={() => handleTimeIncrement('second', false)}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="mt-4 pt-4 border-t text-sm flex justify-between items-center text-gray-700">
                                <div>انتخاب‌شده: <b
                                    className="font-bold text-gray-900">{`${selected.year()}/${selected.month()}/${selected.date()}`}</b>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost-destructive"
                                    onClick={() => handleSelect(null)}
                                >
                                    حذف انتخاب
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}

            {mode === 'month' && (
                <>
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        {months.map((m, i) => (
                            <Button
                                key={i}
                                type="button"
                                variant={month === i + 1 ? 'default' : 'ghost'}
                                size="lg"
                                onClick={() => handleMonthChange(i + 1)}
                            >
                                {m}
                            </Button>
                        ))}
                    </div>
                    <hr className="my-4"/>
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        className="w-full"
                        onClick={() => setMode('day')}
                    >
                        بازگشت
                    </Button>
                </>
            )}

            {mode === 'year' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleYearRangePrevious}
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5l7 7-7 7"></path>
                            </svg>
                        </Button>
                        <span className="font-semibold text-lg">{startYearRange} تا {startYearRange + 11}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleYearRangeNext}
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center mb-2 h-80 overflow-y-auto custom-scrollbar">
                        {yearsRange.map((y) => (
                            <Button
                                key={y}
                                type="button"
                                variant={year === y ? 'default' : 'ghost'}
                                size="lg"
                                className="h-full"
                                onClick={() => handleYearChange(y)}
                            >
                                {y}
                            </Button>
                        ))}
                    </div>
                    <hr className="my-4"/>
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        className="w-full"
                        onClick={() => setMode('day')}
                    >
                        بازگشت
                    </Button>
                </>
            )}
        </div>
    )
}
