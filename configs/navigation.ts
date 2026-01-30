'use client'

export const navigateMap = {
    "/dashboard": {
        title: "داشبورد",
        children: {
            "/clouds": {
                title: "ابرک ها",
                children: {
                    "/create": {
                        title: "ایجاد ابرک",
                    },
                },
            },
            "/profile": {
                title: "حساب کاربری",
                link: false,
                children: {
                    "/edit": {
                        title: "ویرایش پروفایل",
                    },
                },
            },
            "/tickets": {
                title: "تیکت ها",
                children: {
                    "/create": {
                        title: "ایجاد تیکت",
                    },
                    "*": {
                        title: "مشاهده تیکت",
                    },
                },
            },
        },
    },
}
