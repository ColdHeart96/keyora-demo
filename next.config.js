/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['wikvqckfbftdxazgfaat.supabase.co'], // Autoriser les images depuis Supabase
  },
  typescript: {
    ignoreBuildErrors: true, // Pour le développement uniquement
  },
};

module.exports = nextConfig; 