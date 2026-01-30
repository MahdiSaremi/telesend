'use client'

import {ContainerSmall, DashCard} from "@/modules/core/components/base-layout";
import {Button} from "@/components/ui/button";
import {CheckIcon, LoaderIcon, MoreVerticalIcon, XIcon} from "lucide-react";

export default function () {
    return (<>
        <ContainerSmall className="my-6">
            <DashCard title="رزرو های آتی">
                <div className="overflow-y-auto max-h-[50rem]">
                    <div className="flex">
                        <div className="flex flex-col h-max px-2">
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">8:00</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">8:15</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">8:30</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">8:45</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">9:00</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">9:15</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">9:30</div>
                            <div className="h-[5rem] flex items-start justify-end font-mono text-sm text-muted-foreground">9:45</div>
                        </div>
                        <div className="relative overflow-x-auto grow">
                            <div className="w-80"></div>
                            <div className="flex flex-col h-max w-80 absolute top-0 start-0">
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                                <div className="py-2 h-[5rem] border border-slate-50"></div>
                            </div>
                            <div className="flex flex-col h-max w-80 absolute top-0 start-0">
                                <div className="h-[5rem] p-2">
                                    <div className="p-2 size-full rounded-lg bg-green-50 text-green-600 flex items-center gap-4 px-4">
                                        {/*<Image src={ImgService1} alt="" className="size-12 rounded-full object-cover" />*/}
                                        <div className="grow">
                                            <div>هایلایت و رنگ مو</div>
                                            <div className="text-sm">نرگس علیزاده</div>
                                        </div>
                                        <Button icon={<CheckIcon />} shape="square" variant="ghost-success" />
                                    </div>
                                </div>
                                <div className="h-[5rem] p-2">
                                    <div className="p-2 size-full rounded-lg bg-red-50 text-red-600 flex items-center gap-4 px-4">
                                        {/*<Image src={ImgService1} alt="" className="size-12 rounded-full object-cover" />*/}
                                        <div className="grow">
                                            <div>هایلایت و رنگ مو</div>
                                            <div className="text-sm">نرگس علیزاده</div>
                                        </div>
                                        <Button icon={<XIcon />} shape="square" variant="ghost-destructive" />
                                    </div>
                                </div>
                                <div className="h-[5rem] p-2">
                                    <div className="p-2 size-full rounded-lg bg-slate-50 text-slate-500 flex items-center gap-4 px-4">
                                        {/*<Image src={ImgService1} alt="" className="size-12 rounded-full object-cover" />*/}
                                        <div className="grow">
                                            <div>هایلایت و رنگ مو</div>
                                            <div className="text-sm">نرگس علیزاده</div>
                                        </div>
                                        <Button icon={<LoaderIcon />} shape="square" variant="ghost" />
                                    </div>
                                </div>
                                <div className="py-2 h-[5rem]"></div>
                                <div className="h-[10rem] p-2">
                                    <div className="p-2 size-full rounded-lg bg-slate-50 text-slate-500 flex items-center gap-4 px-4">
                                        {/*<Image src={ImgService1} alt="" className="size-12 rounded-full object-cover" />*/}
                                        <div className="grow">
                                            <div>هایلایت و رنگ مو</div>
                                            <div className="text-sm">مهلا کرامتی</div>
                                        </div>
                                        <Button icon={<MoreVerticalIcon />} shape="square" variant="ghost" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashCard>
        </ContainerSmall>
    </>)
}
