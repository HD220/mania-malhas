import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react'; // Importar o plugin React

export default defineConfig({
  plugins: [
    react(), // Adicionar o plugin React
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: 'jsdom', // Ambiente para simular o DOM, útil para testes de UI ou hooks que dependem do DOM
    setupFiles: ['./test-setup.ts'], // Arquivos para executar antes dos testes
    include: ['src/**/*.test.{ts,tsx}'], // Padrão para encontrar arquivos de teste
    coverage: {
      provider: 'v8', // ou 'istanbul'
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/usecases/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'], // Ajuste para incluir o que você quer cobrir
      exclude: [ // Excluir arquivos de configuração, tipos, etc.
        'src/**/index.ts',
        'src/**/index.tsx',
        'src/**/*.d.ts',
        'src/**/*.config.{ts,js}',
        'src/**/*.schema.{ts,tsx}', // Excluir schemas Zod da cobertura direta, pois são testados pelo uso
        'src/lib/db-config/postgres/env.ts', // Updated path
        'src/lib/db-config/postgres/migrate.ts', // Updated path
        'src/lib/errors/domain-errors.ts', // Updated path
        // Adicione outros padrões para excluir
      ],
    },
  },
});
