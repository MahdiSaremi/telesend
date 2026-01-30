
export const routes = {
    login: '/login',
    dashboard: {
        index: '/',

        // gateways: {
        //     index: '/gateways',
        //     create: '/gateways/create',
        //     show: (id: string | number) => `/gateways/${id}`,
        // },
    },
    shop: {
        dashboard: {
            index: '/dashboard',
            services: {
                index: '/dashboard/services',
                create: '/dashboard/services/create',
                edit: (id: number) => '/dashboard/services/' + id,
            },
            employees: {
                index: '/dashboard/employees',
                create: '/dashboard/employees/create',
                edit: (id: number) => '/dashboard/employees/' + id,
            },
        },
    },
}
