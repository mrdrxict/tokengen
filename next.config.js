/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use SWC minifier in WebAssembly mode for WebContainer compatibility
  swcMinify: true,
  experimental: {
    // Force use of WebAssembly SWC instead of native binaries
    useWasmBinary: true,
  },
}

module.exports = nextConfig