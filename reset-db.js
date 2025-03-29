const { Client } = require('pg');
const { config } = require('dotenv');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Carrega as variáveis de ambiente
config();

async function resetDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    // Conecta ao banco
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Lê e executa o script SQL
    const sql = fs.readFileSync('./src/database/reset-db.sql', 'utf8');
    await client.query(sql);
    console.log('Banco de dados resetado com sucesso');

    // Roda as migrações
    console.log('Executando migrações...');
    
    // Primeiro compilamos o projeto
    console.log('Compilando o projeto...');
    await execAsync('npm run build');
    
    // Agora executamos as migrações
    const migrationsCmd = 'npx typeorm-ts-node-commonjs migration:run -d src/config/database.config.ts';
    const { stdout, stderr } = await execAsync(migrationsCmd);
    
    if (stderr) {
      console.error('Erro ao executar migrações:', stderr);
    } else {
      console.log(stdout);
      console.log('Migrações executadas com sucesso');
    }

  } catch (error) {
    console.error('Erro ao resetar o banco:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase(); 