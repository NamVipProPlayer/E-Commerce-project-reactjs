import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import _default from 'eslint-plugin-react-refresh'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias:{
      '@' : path.resolve(__dirname,'src'),
      '@component': path.resolve(__dirname, 'src/component'),
      '@styles' : path.resolve(__dirname,'src/assets/styles'),
      '@Layout' : path.resolve(__dirname,'src/component/Layout'),
      '@Footer' : path.resolve(__dirname,'src/component/Footer'),
      '@Header' : path.resolve(__dirname,'src/component/Header'),
      '@Icons' : path.resolve(__dirname,'src/assets/icons'),

    }
  }
})
