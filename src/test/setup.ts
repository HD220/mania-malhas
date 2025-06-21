import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de um arquivo .env.test se existir, senão .env
// Isso permite ter configurações específicas para o ambiente de teste.
// Se nem .env.test nem .env existir com os valores necessários, o erro original persistirá.
// É esperado que um .env (copiado do .env.exemple e preenchido) exista na raiz do projeto.

// const testEnvPath = path.resolve(process.cwd(), '.env.test');
// const defaultEnvPath = path.resolve(process.cwd(), '.env');

// if (fs.existsSync(testEnvPath)) {
//   dotenv.config({ path: testEnvPath });
// } else {
//   dotenv.config({ path: defaultEnvPath });
// }

// Vitest >= 0.34.0 carrega .env files automaticamente.
// https://vitest.dev/guide/env.html#env-files
// A ordem é: .env.test.local, .env.test, .env.local, .env
// Se as variáveis ainda não estão sendo carregadas, pode ser um problema de como o `env.ts` é importado
// ou a necessidade de um mock mais direto.

// Para este caso, como o erro é a validação no `env.ts`, vamos tentar mockar `process.env`
// ANTES que `env.ts` seja importado e executado pela primeira vez.
// No entanto, mockar process.env diretamente no setup pode ser complicado devido à ordem de execução.

// Uma abordagem mais robusta para *este erro específico* é mockar o módulo `env.ts` em si,
// para que ele não tente validar `process.env` durante os testes unitários dos casos de uso.

// console.log("Test setup file loaded.");
// console.log("NODE_ENV:", process.env.NODE_ENV);
// console.log("DB_HOST (before env.ts mock attempt):", process.env.DB_HOST);

// Este arquivo de setup pode ser usado para outras configurações globais de teste no futuro.
// Por agora, a principal questão é a carga/validação do env.ts.
// Se o carregamento automático do Vitest para .env não for suficiente,
// precisaremos mockar '@/db/postgres/env'.

// Tentativa de definir valores mínimos para process.env ANTES da importação de env.ts
// Isto é uma tentativa, pode não funcionar devido à ordem de importação/execução dos módulos.
if (process.env.NODE_ENV === 'test') {
    process.env.DB_HOST = 'test_db_host';
    process.env.DB_USER = 'test_db_user';
    process.env.DB_PASSWORD = 'test_db_password';
    process.env.DB_NAME = 'test_db_name';
    process.env.DB_PORT = '5433';
    process.env.DATABASE_URL = 'postgresql://test_user:test_password@test_host:5433/test_db';
    process.env.MINIO_URL = 'test_minio_url';
    process.env.MINIO_ACCESSKEY = 'test_minio_key';
    process.env.MINIO_SECRETKEY = 'test_minio_secret';
    process.env.MINIO_BUCKET_PRODUCTS = 'test_products_bucket';
    // Adicione outras variáveis que seu env.ts valida
}
