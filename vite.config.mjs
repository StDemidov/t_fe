import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Оставьте корень проекта
  server: {
    host: true, // Разрешает доступ к серверу
    port: 3000, // Принудительно задает порт
    strictPort: true, // Остановит процесс, если порт занят
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
});
