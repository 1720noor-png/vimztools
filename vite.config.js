import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tool-core': fileURLToPath(new URL('./src/tool-core', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@imgly/background-removal': fileURLToPath(new URL('./src/shims/imgly.js', import.meta.url)),
      'cropperjs': fileURLToPath(new URL('./src/shims/cropper', import.meta.url)),
      'browser-image-compression': fileURLToPath(new URL('./src/shims/compression.js', import.meta.url)),
      'docx': fileURLToPath(new URL('./src/shims/docx.js', import.meta.url)),
      'mammoth': fileURLToPath(new URL('./src/shims/mammoth.js', import.meta.url)),
      'jspdf': fileURLToPath(new URL('./src/shims/jspdf.js', import.meta.url)),
      'jspdf-autotable': fileURLToPath(new URL('./src/shims/jspdf-autotable.js', import.meta.url)),
      'html2pdf.js': fileURLToPath(new URL('./src/shims/html2pdf.js', import.meta.url)),
      'html5-qrcode': fileURLToPath(new URL('./src/shims/html5-qrcode.js', import.meta.url)),
      'pdf-lib-encrypt': fileURLToPath(new URL('./src/shims/pdf-lib-encrypt.js', import.meta.url)),
      'pdfjs-dist': fileURLToPath(new URL('./src/shims/pdfjs-dist', import.meta.url)),
      'chart.js': fileURLToPath(new URL('./src/shims/chartjs.js', import.meta.url)),
      'react-chartjs-2': fileURLToPath(new URL('./src/shims/react-chartjs-2.js', import.meta.url)),
      'dayjs': fileURLToPath(new URL('./src/shims/dayjs.js', import.meta.url)),
      'jsqr': fileURLToPath(new URL('./src/shims/jsqr.js', import.meta.url))
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdf-lib')) {
              return 'vendor-pdf'
            }
            if (id.includes('tesseract.js')) {
              return 'vendor-ocr'
            }
            if (id.includes('jszip')) {
              return 'vendor-zip'
            }
            if (id.includes('qrcode')) {
              return 'vendor-qrcode'
            }
          }
        }
      }
    }
  }
})
