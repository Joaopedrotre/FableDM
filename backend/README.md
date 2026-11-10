# Backend — FableDM

API com o cadastro de usuário e o chat com o Mestre de Jogo (LLM). Foi organizada de forma semelhante às pastas já existentes no frontend (`config`, `models`, `services`, `repositories`, `controllers`, `routes` e `utils`).

## Escopo desta sprint

- Cadastro com nome, e-mail, CPF e senha.
- Validação de nome, formato de e-mail, dígitos verificadores do CPF e força da senha.
- Verificação de e-mail e CPF já cadastrados.
- Hash da senha com bcrypt antes de salvar no banco.
- Persistência em MySQL.

Chat com o mestre: `POST /mestre/mensagem` conversa com um provedor de LLM (veja a seção abaixo).

Ainda não estão implementados: login, JWT, edição de perfil, campanhas, personagens, NPCs, locais e persistência das mensagens.

## Organização e Tech Forge

A entidade `Usuario` usa campos privados nativos (`#id`, `#nome`, `#email`, `#cpf`, `#criadoEm`), inicializados pelo construtor. Getters somente de leitura expõem os dados necessários; não há setters porque a entidade persistida é imutável. O DTO `NovoUsuario` é separado e contém o hash apenas para persistência.

## Tecnologias

Node.js, Express, TypeScript, MySQL (`mysql2`), Zod e bcryptjs. A integração com a IA usa `fetch` nativo do Node, sem SDK adicional.

## Como executar

1. Entre na pasta `backend` e instale as dependências:

   ```bash
   npm install
   ```

2. Com o MySQL 8.0.16+ em execução, execute `database/schema.sql` para criar o banco `fabledm` e a tabela `usuarios`.
3. (Recomendado) Crie um usuário próprio para a aplicação, conforme `database/README.md`.
4. Copie `.env.example` para `.env` e ajuste as credenciais do MySQL e as variáveis do provedor de IA (`LLM_*`).
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
    "criadoEm": "..."
  }
}
```

Validação (`400`) e duplicidade (`409`) retornam `erros` como uma lista de objetos `{ "campo", "mensagem" }`, formato já reconhecido pelo frontend.

A senha nunca é devolvida pela API; somente seu hash é armazenado no banco. O CPF também não é incluído na resposta de sucesso.

## Chat com o Mestre (LLM)

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `LLM_PROVIDER` | `anthropic` (padrão) ou `openai` (também serve para APIs compatíveis, como Ollama, usando `LLM_BASE_URL`) |
| `LLM_API_KEY` | Chave de API do provedor. Fica somente no `.env` do backend |
| `LLM_MODEL` | Nome do modelo, conforme a documentação do provedor |
| `LLM_BASE_URL` | Opcional. URL base alternativa (ex.: `http://localhost:11434/v1` para Ollama; nesse caso `LLM_API_KEY` pode ficar vazia) |
| `LLM_MAX_TOKENS` | Limite de tokens por resposta (padrão 600) |

### Estrutura

- `src/providers/LLMProvider.ts`: interface comum dos provedores.
- `src/providers/AnthropicProvider.ts` e `OpenAIProvider.ts`: implementações via `fetch`. Para adicionar outro provedor, implemente `LLMProvider` e registre em `src/providers/index.ts`.
- `src/services/MestreService.ts`: prompt de sistema do mestre, conversão do histórico e limite das últimas 20 mensagens.
- `src/services/removerRaciocinio.ts`: remove da resposta os blocos `<think>...</think>` (e `<thinking>`) antes de enviá-la ao frontend, inclusive blocos sem fechamento ou com apenas a tag de fechamento.
- `src/validators/mestreValidator.ts`: valida o corpo (até 40 mensagens; a última deve ser do jogador; cada ação do jogador pode ter até 5000 caracteres e cada resposta do mestre no histórico até 30000; os limites são as constantes `LIMITE_TEXTO_JOGADOR` e `LIMITE_TEXTO_MESTRE` no próprio arquivo).

### `POST /mestre/mensagem`

Requisição:

```json
{
  "mensagens": [
    { "autor": "mestre", "texto": "A névoa cobre a estrada. O que você faz?" },
    { "autor": "jogador", "texto": "Abro a porta da masmorra." }
  ]
}
```

Sucesso (`200`):

```json
{ "resposta": "Texto narrado pelo mestre." }
```

Erros: `400` com `erros` (validação), `429` quando o provedor limita as requisições e `502` quando o provedor falha; ambos com `{ "mensagem": "..." }`. Os detalhes do erro do provedor aparecem só no log do servidor.

Teste rápido:

```bash
curl -X POST http://localhost:3000/mestre/mensagem \
  -H "Content-Type: application/json" \
  -d '{"mensagens":[{"autor":"jogador","texto":"Abro a porta da masmorra."}]}'
```

Para abrir `/jogo` sem login (o endpoint de login ainda não existe), rode no console do navegador:

```js
localStorage.setItem('usuario', JSON.stringify({ id: 1, nome: 'Teste', email: 'teste@teste.com' }))
```
