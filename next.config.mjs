/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configurações para produção na Hostinger
  output: 'standalone',
  // Desabilita otimizações que podem causar problemas em alguns servidores
  swcMinify: true,
  // Configuração de basePath se necessário (descomente se usar subdiretório)
  // basePath: '/estox',
  // Configuração de trailingSlash
  trailingSlash: false,
  // Configuração de compressão
  compress: true,
}

export default nextConfig
