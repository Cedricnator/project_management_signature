const isProd = import.meta.env.PROD

export const logger = {
    info: (...args: any[]) => {
        if (!isProd) console.info('[INFO]', ...args)
    },
    warn: (...args: any[]) => {
        if (!isProd) console.warn('[WARN]', ...args)
    },
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args) // always log errors
    },
    debug: (...args: any[]) => {
        if (!isProd) console.debug('[DEBUG]', ...args)
    },
}
