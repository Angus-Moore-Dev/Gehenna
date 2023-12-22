/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fdiavyxctdwgbvoawijj.supabase.co',
                port: '',
                pathname: '/**/*'
            }
        ]
    }
}

module.exports = nextConfig
