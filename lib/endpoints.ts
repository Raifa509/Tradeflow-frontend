export const ENDPOINTS = {
    auth: {
        login: '/auth/login',
        getMe: '/auth/me'
    },
    customer: {
        get: '/customers',
        create: '/customers',
        update: (id: number) => `/customers/${id}`,

    },
    invoices: {
        get: '/invoices',
        markPaid: (id: number) => `/invoices/${id}/pay`,
    },
    suppliers: {
        get: '/suppliers',
        create: '/suppliers',
        update: (id: number) => `/suppliers/${id}`,
        delete: (id: number) => `/suppliers/${id}`,
    },
    inventory: {
        get: '/inventory',
        create: '/inventory',
        update: (id: number) => `/inventory/${id}`,
    },
    purchases: {
        get: '/purchases',
        getOne: (id: number) => `/purchases/${id}`,
        create: '/purchases',
        updateStatus: (id: number) => `/purchases/${id}/status`,
        delete: (id: number) => `/purchases/${id}`,
    },
    sales: {
        get: '/sales',
        getOne: (id: number) => `/sales/${id}`,
        create: '/sales',
        updateStatus: (id: number) => `/sales/${id}/status`,
        delete: (id: number) => `/sales/${id}`,
    },


}