

export const appURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.gehenna.dev';
export const appDomain = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'gehenna.dev';
export const appHttp = process.env.NODE_ENV === 'development' ? 'http' : 'https';