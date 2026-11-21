# Banco de dados — FableDM

Esta sprint utiliza somente a tabela `usuarios`.

## Modelo

| Campo | Tipo | Regra | Finalidade |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, auto incremento | Identificador do usuário |
| `nome` | VARCHAR(150) | Obrigatório | Nome completo |
| `email` | VARCHAR(254) | Obrigatório, único | Identificação por e-mail |
| `cpf` | CHAR(11) | Obrigatório, único, 11 dígitos | CPF sem pontuação |
| `senha_hash` | VARCHAR(255) | Obrigatório | Hash bcrypt da senha |
| `criado_em` | TIMESTAMP | Preenchido automaticamente | Data de cadastro |

O banco não armazena a senha em texto puro. A API gera o hash com bcrypt antes do `INSERT`.

## Criar o banco

Com o MySQL 8.0.16 ou superior em execução, execute o arquivo `schema.sql` usando um usuário que tenha permissão para criar bancos e tabelas. Pelo terminal:

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `fabledm` e a tabela `usuarios`. Pode ser executado novamente sem apagar os registros existentes.

## Usuário da aplicação (opcional, recomendado)

Em vez de conectar a API como `root`, crie um usuário próprio no MySQL. Entre no cliente MySQL como administrador e execute, substituindo a senha:

```sql
CREATE USER IF NOT EXISTS 'fabledm_app'@'localhost' IDENTIFIED BY 'defina_uma_senha_forte';
GRANT SELECT, INSERT, UPDATE ON fabledm.usuarios TO 'fabledm_app'@'localhost';
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

## Verificar a tabela

```sql
USE fabledm;
DESCRIBE usuarios;
SHOW INDEX FROM usuarios;
```

No Docker Compose, o `schema.sql` é executado automaticamente na criação do volume do MySQL, e o usuário da aplicação recebe permissão sobre o banco `fabledm`.

## Personagens, itens, campanhas e mensagens

O arquivo `schema-jogo.sql` cria as tabelas `personagens`, `itens`, `campanhas` e `mensagens` e depende da tabela `usuarios`. Ele usa `CREATE TABLE IF NOT EXISTS` e pode ser executado mais de uma vez.

Com Docker Compose, os dois arquivos só rodam quando o volume do MySQL é criado. Para adicionar as novas tabelas a um banco que já existe, sem apagar dados:

```bash
docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" fabledm' < backend/database/schema-jogo.sql
```

Sem Docker, execute `schema.sql` e depois `schema-jogo.sql` no seu MySQL. Se o usuário da aplicação tiver permissões restritas, conceda também `SELECT, INSERT, UPDATE, DELETE` nas quatro tabelas novas.
