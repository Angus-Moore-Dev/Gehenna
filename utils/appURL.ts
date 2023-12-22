

export const appURL = process.env.NODE_ENV === 'development' ? 'http://dev.local' : 'https://www.gehenna.dev';
export const appDomain = process.env.NODE_ENV === 'development' ? 'dev.local' : 'gehenna.dev';
export const appHttp = process.env.NODE_ENV === 'development' ? 'http' : 'https';