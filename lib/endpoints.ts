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
}