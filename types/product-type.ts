
export type ProductType = "physical" | "digital" | "service"

export const productTypeOptions: Record<ProductType, {id: ProductType; label: string}> = {
    "physical": {
        id: "physical",
        label: "فیزیکی",
    },
    "digital": {
        id: "digital",
        label: "دیجیتال",
    },
    "service": {
        id: "service",
        label: "خدمات",
    },
}
