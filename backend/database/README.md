# Banco de dados — FableDM

O arquivo `schema.sql` cria o banco `fabledm` e todas as tabelas da aplicação. Compatível com MySQL 8.0.16 ou superior.

## Modelo

```
usuarios 1──N personagens 1──N itens
usuarios 1──N campanhas   N──0..1 personagens
campanhas 1──N historias 1──N mensagens
usuarios 1──N historias
```

| Tabela | Finalidade | Chaves estrangeiras e exclusão |
|---|---|---|
| `usuarios` | Conta do jogador: nome, e-mail único, CPF único e hash bcrypt da senha | |
| `personagens` | Nome, descrição e imagem (data URL reduzida) | `usuario_id` → `usuarios`, exclusão em cascata |
| `itens` | Nome, descrição e quantidade (1 a 999) de cada item do personagem | `personagem_id` → `personagens`, exclusão em cascata |
| `campanhas` | Nome, descrição e, opcionalmente, o personagem usado | `usuario_id` → `usuarios` (cascata); `personagem_id` → `personagens` (`SET NULL`) |
| `historias` | Sessão de jogo: título, resumo e data da última atividade | `usuario_id` → `usuarios` (cascata); `campanha_id` → `campanhas` (cascata) |
| `mensagens` | Cada ação do jogador e cada resposta do mestre | `historia_id` → `historias`, exclusão em cascata |

Consequências: excluir um personagem apaga seus itens e deixa as campanhas dele sem personagem; excluir uma campanha apaga suas histórias e mensagens; excluir uma história apaga suas mensagens.

O banco não armazena a senha em texto puro. A API gera o hash com bcrypt antes do `INSERT`.

## Criar o banco

Com o MySQL em execução, execute o `schema.sql` com um usuário que tenha permissão para criar bancos e tabelas. Pelo terminal, a partir da pasta `backend`:

```bash
mysql -u root -p < database/schema.sql
```

Todos os comandos usam `CREATE ... IF NOT EXISTS`, então o script pode ser executado de novo sem apagar registros. Ele adiciona tabelas que faltam, mas não altera tabelas que já existem. Se você criou o banco com uma versão anterior (por exemplo, com `mensagens` ligada a `campanhas`), recrie o banco.

## Docker Compose

O `docker-compose.yml` monta o `schema.sql` na pasta de inicialização do MySQL, e ele só roda quando o volume é criado pela primeira vez. O usuário da aplicação recebe todas as permissões sobre o banco `fabledm`.

Para recriar o banco do zero (apaga todos os dados; as contas de demonstração são recriadas se `TEST_ACCOUNT_ENABLED=true`):

```bash
docker compose down -v
docker compose up --build
```

Para aplicar o `schema.sql` a um banco já existente sem apagar dados (só adiciona tabelas que faltam):

```bash
docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" fabledm' < backend/database/schema.sql
```

## Usuário da aplicação sem Docker (opcional, recomendado)

Em vez de conectar a API como `root`, crie um usuário próprio no MySQL. Entre no cliente MySQL como administrador e execute, substituindo a senha:

```sql
CREATE USER IF NOT EXISTS 'fabledm_app'@'localhost' IDENTIFIED BY 'defina_uma_senha_forte';
GRANT SELECT, INSERT, UPDATE, DELETE ON fabledm.* TO 'fabledm_app'@'localhost';
```

Se a API for executada em outra máquina ou container, ajuste o host do usuário MySQL e `DB_HOST` conforme a rede utilizada.

Depois, configure `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=fabledm_app
DB_PASSWORD=defina_uma_senha_forte
DB_NAME=fabledm
```

## Verificar as tabelas

```sql
USE fabledm;
SHOW TABLES;
DESCRIBE historias;
SHOW CREATE TABLE mensagens;
SELECT id, nome, email, criado_em FROM usuarios;
```
