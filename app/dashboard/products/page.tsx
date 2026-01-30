'use client'

import {Container, DashCard, DashHeader} from "@/modules/core/components/base-layout";
import {Table} from "@/modules/core/components/table";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {EyeIcon, PencilIcon, PlusIcon, SearchIcon} from "lucide-react";
import {routes} from "@/configs/routes";
import {useCrudIndex} from "@/modules/crud/hooks/useCrudIndex";
import apis, {ApiResult} from "@/configs/apis";
import {LoadableArea} from "@/modules/core/components/loading";
import {useState} from "react";
import {PaginateCrud} from "@/modules/core/components/pagination";
import {formatToman} from "@/modules/core/utils/formats";
import {Select} from "@/components/ui/form/select";
import {MultiSelect} from "@/components/ui/form/multi-select";
import {InputLabel} from "@/modules/form/components/form-base";
import {FormButton} from "@/modules/form/components/form-button";
import {Input} from "@/components/ui/form/input";

export default function () {
    const [items, setItems] = useState<ApiResult<typeof apis.shop.products.index>>([])

    const crud = useCrudIndex({
        load: () => ({
            api: apis.shop.products.index(),
            onSuccess: (data) => {
                setItems(data)
            },
            onError: () => {
                setItems([
                    {
                        id: 1,
                        title: "تست یک",
                        image: {
                            uuid: "1",
                            size: 1,
                            display_name: "test.png",
                            url: "https://statics.basalam.com/public-45/users/588Azw/11-25/GEZZlHKh8NGi5x7GW2Z2SDlFBHnt4egMhrs8oRugRma4q6Hau5.jpg_800X800X70.jpg",
                        },
                        price: 500000,
                        sell_count: 91,
                    },
                ])
            }
        }),
    })

    return (
        <Container className="py-6">
            <DashHeader
                title="محصولات"
                actions={
                    <Button asChild>
                        <Link href={routes.shop.dashboard.services.create}>
                            <PlusIcon/>
                            ایجاد محصول جدید
                        </Link>
                    </Button>
                }
            />
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-3 2xl:col-span-1">
                    <DashCard>
                        <div className="flex flex-col gap-4">
                            <Input
                                label="جستجو"
                                icon={SearchIcon}
                                placeholder="جستجو کنید..."
                                value={crud.search ?? ''}
                                setValue={crud.setSearch}
                            />
                            <Select
                                name="order"
                                label="مرتب سازی"
                                items={[
                                    {id: "z", label: "جدیدترین"},
                                    {id: "a", label: "قدیمی ترین"},
                                    {id: "b", label: "بیشترین قیمت"},
                                    {id: "c", label: "کمترین قیمت"},
                                    {id: "d", label: "بیشترین فروش"},
                                    {id: "e", label: "کمترین فروش"},
                                ]}
                            />
                            <Select
                                name="f1"
                                label="موجودی"
                                items={[
                                    {id: "e", label: "بدون فیلتر"},
                                    {id: "a", label: "موجود"},
                                    {id: "b", label: "ناموجود"},
                                    {id: "c", label: "در حال اتمام"},
                                ]}
                            />
                            <Select
                                name="f2"
                                label="فعال بودن"
                                items={[
                                    {id: "e", label: "بدون فیلتر"},
                                    {id: "a", label: "فعال"},
                                    {id: "b", label: "غیرفعال"},
                                ]}
                            />
                            <Select
                                name="f3"
                                label="تخفیف"
                                items={[
                                    {id: "e", label: "بدون فیلتر"},
                                    {id: "a", label: "با تخفیف"},
                                    {id: "b", label: "بدون تخفیف"},
                                ]}
                            />
                            <MultiSelect
                                name="f4"
                                label="نوع محصول"
                                items={[
                                    {id: "a", label: "فیزیکی"},
                                    {id: "b", label: "دیجیتال"},
                                    {id: "c", label: "خدمات"},
                                ]}
                            />
                            <InputLabel
                                label="بازه قیمت"
                            >
                                <div className="flex gap-2 items-center">
                                    <Input
                                        name="from_price"
                                        prefix="از"
                                        suffix="تومان"
                                    />
                                    <Input
                                        name="to_price"
                                        prefix="تا"
                                        suffix="تومان"
                                    />
                                </div>
                            </InputLabel>
                            <MultiSelect
                                name="f5"
                                label="دسته بندی"
                                items={[
                                    {id: "a", label: "یک"},
                                    {id: "b", label: "دو"},
                                    {id: "c", label: "سه"},
                                ]}
                            />
                            <hr className="my-2"/>
                            <div className="flex justify-end">
                                <FormButton variant="outline-primary" icon={<SearchIcon/>}>
                                    اعمال فیلتر
                                </FormButton>
                            </div>
                        </div>
                    </DashCard>
                </div>
                <div className="col-span-3 2xl:col-span-2">
                    <DashCard>
                        <LoadableArea loading={crud.loading}>
                            <Table
                                columns={[
                                    {title: "عنوان"},
                                    {title: "قیمت"},
                                    {title: "فروش"},
                                    {title: "عملیات", className: "w-32"},
                                ]}
                                rows={items.map(item => ({
                                    key: item.id,
                                    data: [
                                        {
                                            value: <div className="flex items-center gap-2 w-max">
                                                <img src={item.image?.url} alt={item.title}
                                                       className="size-16 rounded-lg object-cover"/>
                                                <span>{item.title}</span>
                                            </div>
                                        },
                                        {
                                            value: formatToman(item.price),
                                        },
                                        {
                                            value: item.sell_count + " فروش",
                                        },
                                        {
                                            value: <div className="flex items-center gap-2">
                                                <Button asChild size="sm" variant="soft-primary"><Link href={routes.shop.dashboard.services.edit(item.id)}>
                                                    <PencilIcon/>
                                                </Link></Button>
                                                <Button asChild size="sm" variant="soft-primary"><Link href={routes.shop.dashboard.services.edit(item.id)} target="_blank">
                                                    <EyeIcon/>
                                                </Link></Button>
                                            </div>
                                        }
                                    ]
                                }))}
                                empty="خدماتی ثبت نشده"
                            />
                            <div className="mt-8">
                                <PaginateCrud crud={crud}/>
                            </div>
                        </LoadableArea>
                    </DashCard>
                </div>
            </div>
        </Container>
    )
}
