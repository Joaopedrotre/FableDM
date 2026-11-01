import { app } from './app.js';
import { env } from './config/env.js';
import { database } from './config/database.js';

async function iniciar() {
  await database.query('SELECT 1');
  app.listen(env.PORT, () => {
    console.log(`API FableDM disponível em http://localhost:${env.PORT}`);
  });
}

iniciar().catch((erro: unknown) => {
  console.error('Não foi possível iniciar a API. Verifique a conexão com o MySQL.', erro);
  process.exit(1);
});
