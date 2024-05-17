

export const appURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.gehenna.app';
export const appDomain = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'gehenna.app';
export const appHttp = process.env.NODE_ENV === 'development' ? 'http' : 'https';