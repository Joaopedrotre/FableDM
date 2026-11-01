# Backend — FableDM (Sprint de cadastro)

API mínima para atender exclusivamente à sprint de cadastro de usuário. Foi organizada de forma semelhante às pastas já existentes no frontend (`config`, `models`, `services`, `repositories`, `controllers`, `routes` e `utils`).

## Escopo desta sprint

- Cadastro com nome, e-mail, CPF e senha.
- Validação de nome, formato de e-mail, dígitos verificadores do CPF e força da senha.
- Verificação de e-mail e CPF já cadastrados.
- Hash da senha com bcrypt antes de salvar no banco.
- Persistência em MySQL.

Não estão implementados nesta sprint: login, JWT, edição de perfil, campanhas, personagens, NPCs, locais ou integração com provedor de IA.

## Tecnologias

Node.js, Express, TypeScript, MySQL (`mysql2`), Zod e bcryptjs.

## Como executar

1. Entre na pasta `backend` e instale as dependências:

   ```bash
   npm install
   ```

2. Com o MySQL 8.0.16+ em execução, execute `database/schema.sql` para criar o banco `fabledm` e a tabela `usuarios`.
3. (Recomendado) Crie um usuário próprio para a aplicação, conforme `database/README.md`.
4. Copie `.env.example` para `.env` e ajuste as credenciais do MySQL.
5. Inicie a API:

   ```bash
   npm run dev
   ```

A API ficará disponível em `http://localhost:3000` por padrão.

## Banco de dados

O esquema desta sprint contém somente a tabela `usuarios`. O modelo e os comandos para criação, permissões e verificação estão em [`database/README.md`](database/README.md).

## Endpoint

### `POST /usuarios`

Recebe o mesmo formato utilizado por `frontend/src/services/api.js` e `frontend/src/pages/Cadastro.jsx`:

```json
{
  "nome": "Maria da Silva",
  "email": "maria@example.com",
  "cpf": "52998224725",
  "senha": "SenhaForte@123"
}
```

Sucesso (`201`):

```json
{
  "mensagem": "Usuário cadastrado com sucesso.",
  "usuario": {
    "id": 1,
    "nome": "Maria da Silva",
    "email": "maria@example.com",
    "cpf": "52998224725",
    "criado_em": "..."
  }
}
```

Validação (`400`) e duplicidade (`409`) retornam `erros` como uma lista de objetos `{ "campo", "mensagem" }`, formato já reconhecido pelo frontend.

A senha nunca é devolvida pela API; somente seu hash é armazenado no banco.
