# AGENTS.md — Fable

Instruções para agentes de programação que trabalham neste repositório. Leia este arquivo inteiro antes de alterar qualquer coisa.

## 1. Contexto do projeto

Fable é uma aplicação web de RPG de mesa, inspirada em Dungeons & Dragons 5e, em que uma IA atua como Dungeon Master (DM). É um projeto acadêmico de Engenharia de Software.

No código, na interface e no banco de dados o identificador atual é FableDM (`fabledm`); mantenha-o até que o time decida renomear.

Fable é também o nome do agente principal: o site e o Dungeon Master de IA compartilham o nome. Exemplos de uso: "Vou jogar no Fable" e "Fable, invente um rumor para a taverna".

- A rubrica de avaliação é a fonte oficial dos requisitos. Se o prompt do produto e a rubrica divergirem, a rubrica prevalece.
- Um requisito só está atendido quando o comportamento existe de fato e foi testado. Tela ou botão sem comportamento real não conta.
- Toda funcionalidade simulada deve estar identificada como demonstração na interface e no código.
- Não adicione funcionalidades que a rubrica e o MVP não exijam.

### Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Context API |
| Backend | Node.js, TypeScript (ESM), Express 5, API REST, JWT (`jsonwebtoken`), `bcryptjs`, Zod |
| Banco | MySQL |
| Infraestrutura | Docker Compose com frontend, backend, MySQL e Nginx |
| IA | Interface `LLMProvider` com implementações por provedor |

### Estrutura do repositório

```
.
├── AGENTS.md
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── schema-jogo.sql
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── providers/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── models/
        ├── pages/
        │   ├── campanhas/
        │   └── personagens/
        ├── services/
        ├── types/
        └── utils/
```

## 2. Prioridades

Já funcionam de ponta a ponta: infraestrutura (Docker Compose, Nginx, MySQL), cadastro, login com JWT, edição de perfil, conta de teste com acesso rápido, CRUDs de personagens, itens e campanhas (com paginação), histórico de mensagens persistido por campanha e chat com o Mestre usando o contexto da campanha, do personagem e dos itens.

Ordem do que falta, guiada pelos pesos da rubrica:

1. O quarto CRUD (NPCs ou locais). A rubrica exige 4 CRUDs completos; hoje existem 3 (personagens, itens e campanhas).
2. Persona do produto e demonstração de cada requisito da rubrica.
3. Polimento visual e acessibilidade.

A integração com LLM não pontua isoladamente na rubrica. Mantenha-a mínima.

## 3. Convenções de código

### TypeScript

- `strict` ligado no backend e no frontend.
- O backend é ESM com `NodeNext`: imports relativos terminam em `.js`, mesmo apontando para arquivos `.ts`.
- Proibido: `any`, `as any`, `@ts-ignore`, `@ts-nocheck` e arquivos `.js` ou `.jsx` no código-fonte. A rubrica avalia o uso de TypeScript sem JavaScript injetado.
- Use `interface` e `type` para contratos, uniões e DTOs. Use Generics para reuso tipado, como `Repository<T>` e `Paginated<T>`.
- ESLint com `@typescript-eslint/no-explicit-any` como erro.

### Comentários

- Não escreva comentários em código novo: nada de comentários inline, docstrings ou blocos explicativos, a menos que o usuário peça explicitamente.
- O código existente tem alguns comentários; não os replique e não os remova sem pedido.
- O código deve se explicar por nomes claros.

### Nomenclatura

- Classes, interfaces, tipos e componentes React: `PascalCase`.
- Funções, métodos e variáveis: `camelCase`. Constantes globais: `UPPER_SNAKE_CASE`.
- Arquivos de classes do backend em `PascalCase.ts`, como `UsuarioService.ts` e `UsuarioRepository.ts`; arquivos de funções em `camelCase.ts`, como `usuarioRoutes.ts`.
- Arquivos de componente React: `PascalCase.tsx`.
- Nomes de domínio em português, como no código existente (`Usuario`, `MestreService`, `cadastrar`, `entrar`). Termos técnicos e de infraestrutura podem ficar em inglês.

### Orientação a objetos

- Encapsulamento: campos `private` ou `#`, construtores que inicializam todas as propriedades, alteração de estado apenas por métodos de domínio.
- Getters e setters somente quando houver validação, transformação ou regra de negócio. Não crie getters triviais.
- Herança e classes abstratas apenas com reuso legítimo, como `Entity` e `BaseRepository`. Prefira composição.
- Polimorfismo por contratos comuns, como `LLMProvider` e `Repository<T>`.
- SOLID: classes com responsabilidade única; extensão sem alterar código existente; subclasses e implementações substituíveis sem quebrar quem as usa. Controller, service e repository nunca se misturam.

### Erros

- Todo erro esperado é uma classe que estende `Error`, definida junto do serviço que o lança: `CadastroError`, `CredenciaisInvalidasError`, `UsuarioNaoEncontradoError`, `ProvedorError`.
- O controlador traduz cada erro para o status HTTP correto. Erro inesperado vira 500 genérico no tratador final de `app.ts`.
- Formato das respostas de erro: `{ "mensagem": "..." }` ou `{ "erros": [{ "campo", "mensagem" }] }`, que o frontend já reconhece.
- Mensagens de erro nunca contêm segredos, stack traces ou detalhes internos.

### Git

- Commits no padrão Conventional Commits, um por incremento verificável.
- Uma tag por etapa de prioridade da seção 2, para evidenciar a evolução do projeto.

## 4. Skills

### Skill 1 — Backend & Domain Architect

**Escopo:** `backend/`, `docker-compose.yml`, `nginx/`, `backend/database/schema.sql`.

**Responsabilidades:** entidades, value objects, serviços, repositórios, controladores, DTOs, validadores, exceções, CRUDs, autenticação e a infraestrutura de execução.

**Regras:**

- Rotas existentes: `POST /usuarios` (cadastro), `POST /login`, `POST /login/teste` (só com `TEST_ACCOUNT_ENABLED=true`), `PUT /usuarios/me`, `POST /mestre/mensagem` e `GET /saude`. O Nginx expõe a API em `/api`, removendo o prefixo.
- CRUDs existentes, todos com JWT: `/personagens`, `/personagens/:id/itens` e `/campanhas` (GET lista paginada, GET `:id`, POST, PUT e DELETE), mais `GET /campanhas/:id/sessao` e `POST /campanhas/:id/mensagens`. Falta o quarto CRUD (`/npcs` ou `/locais`).
- Paginação por `?pagina=` e `?limite=` (padrão 10, máximo 50), com resposta `{ dados, pagina, limite, total, totalPaginas }`.
- O recurso de outro usuário e o recurso inexistente retornam o mesmo 404.
- Todas as rotas de CRUD, de edição de usuário, da campanha e do Mestre exigem JWT (`autenticar`).
- Autorização sempre pelo `sub` do token, nunca por identificador vindo do corpo ou da query. A edição de usuário usa `/me`, então só atinge o próprio usuário. Recurso de outro usuário retorna 404.
- PUT e DELETE em recurso inexistente retornam 404.
- Paginação em toda listagem: `page` (padrão 1) e `limit` (padrão 10, máximo 50). Resposta `{ data, page, limit, total, totalPages }`.
- Cadastro exige nome, e-mail, senha e CPF. E-mail duplicado retorna 409.
- Edição de usuário (`PUT /usuarios/me`): nome e CPF obrigatórios; a senha é opcional, como o frontend atual faz. A rubrica pede todos os campos obrigatórios na edição; confirme com o time antes de mudar. O corpo com `email` é rejeitado com 400 e o UPDATE nunca inclui e-mail.
- A validação de nome, CPF e senha fica nos esquemas Zod de `validators/` e no `utils/cpf.ts`, com a mesma regra em `frontend/src/utils/validators.ts`. A senha exige pelo menos 8 caracteres com maiúscula, minúscula, número e símbolo.
- Senha com `bcryptjs`, coluna `senha_hash`, nunca retornada nem registrada em log. Login com e-mail inexistente ou senha errada retorna 401 genérico, com tempo de resposta equalizado.
- JWT HS256 assinado com `JWT_SECRET` (mínimo de 32 caracteres, vindo do ambiente) e com expiração em `JWT_EXPIRES_IN`.
- A conta de teste e as contas de demonstração só existem com `TEST_ACCOUNT_ENABLED=true`. Nunca habilite essa variável em ambiente público.
- Relacionamentos reais com chaves estrangeiras: `personagens.usuario_id`, `itens.personagem_id`, `campanhas.usuario_id`, `campanhas.personagem_id` (opcional, `ON DELETE SET NULL`) e `mensagens.campanha_id`. A exclusão de personagem apaga seus itens e a de campanha apaga suas mensagens (`ON DELETE CASCADE`). Alterações de schema vão em arquivos `.sql` versionados em `backend/database/`; o `docker-compose.yml` executa `schema.sql` e `schema-jogo.sql` apenas na criação do volume do MySQL.
- Consultas SQL sempre parametrizadas.
- Docker Compose: serviços `nginx`, `frontend`, `backend` e `mysql`; rede `proxy-net` para Nginx, frontend e backend e rede `db-net` (interna) para backend e MySQL; somente o Nginx publica portas; volume nomeado para o MySQL; variáveis vindas do `.env`; `depends_on` com healthcheck. O Nginx encaminha `/` para o frontend e `/api` para o backend.

**Checklist antes de entregar:** token ausente retorna 401 em todas as rotas privadas; 403 e 404 conforme as regras acima; paginação conferida com `limit` pequeno; `docker compose down` seguido de `up` preserva os dados; portas do backend e do MySQL inacessíveis fora do Nginx.

### Skill 2 — Frontend & UX Engineer

**Escopo:** `frontend/`.

**Responsabilidades:** componentes reutilizáveis, formulários, validação, navegação, contexto de autenticação, responsividade, acessibilidade e estados de interface.

**Regras:**

- Componentes genéricos em `components/` (existentes: `Campo`, `CampoArea`, `CampoSelect`, `CampoImagem`, `Avatar`, `Aviso`, `Paginacao`, `ConfirmarExclusao`, `EstadoVazio`, `LayoutPagina`, `RotaPrivada`, `LayoutAuth`; hook genérico `useLista<T>` em `hooks/`). Páginas em `pages/`. Componentes exclusivos de uma página em `pages/<pagina>/components/`, cada um em sua própria função.
- Listagem, criação e edição em rotas separadas, como `/campanhas`, `/campanhas/nova` e `/campanhas/:id/editar`. A edição carrega os valores atuais.
- Paginação consome `page` e `limit` da API. Nunca pagine apenas no navegador.
- `AuthContext` expõe `usuario`, `entrar`, `sair` e `atualizar`, e é a única fonte do usuário exibido na interface.
- O token JWT fica no `localStorage`, por exigência da rubrica, e é enviado em toda requisição autenticada. Resposta 401 limpa o token e redireciona ao login.
- Rotas privadas protegidas por `RotaPrivada`. Após login válido, redireciona à área logada. Após cadastro válido, mostra confirmação e redireciona ao login.
- Validação de e-mail por regex, de CPF (mesmo algoritmo do backend), de obrigatórios e de força de senha, com indicador visual. Cadastro e edição pedem confirmação de senha.
- No perfil, o e-mail é somente leitura.
- Erros da API viram mensagens amigáveis, junto ao campo quando houver `fields`. Nunca exiba mensagem técnica bruta.
- Toda ação destrutiva passa por `ConfirmDialog` que explica as consequências.
- Todas as telas principais têm estados de carregamento, vazio, erro e sucesso.
- Nenhum botão decorativo. Se uma operação for simulada, ela deve estar rotulada como demonstração.
- Contraste adequado, foco visível, rótulos associados aos campos, interface de jogo utilizável em telas menores.
- Identidade visual: dark fantasy com a paleta definida no prompt do produto, legibilidade acima de decoração.

**Checklist antes de entregar:** fluxo completo cadastro → login → CRUD → perfil funcionando contra a API real; erro 401, 409 e 422 exibidos de forma amigável; nenhuma página com componente exclusivo fora de sua pasta.

### Skill 3 — AI Dungeon Master Engineer

**Escopo:** `backend/src/providers/`, `MestreService`, `JogoService`, `contextoDoMestre.ts`, interface de sessão no frontend.

**Responsabilidades:** integração com provedores de LLM, contexto narrativo, histórico persistido e limites de atuação da IA.

**Regras:**

- O DM de IA se chama Fable. Ao evoluir o prompt de sistema do narrador, identifique-o como Fable, sem usar o nome do provedor ou do modelo como identidade. Se o jogador perguntar sinceramente, Fable não nega ser uma IA.
- `MestreService` depende apenas da interface `LLMProvider`. Trocar de provedor não exige alterar o serviço. Os provedores existentes são `AnthropicProvider` e `OpenAIProvider`, escolhidos por `LLM_PROVIDER`.
- Cada provedor é uma implementação separada, selecionada pelo backend por variável de ambiente. Não declare um provedor como integrado sem tê-lo testado de ponta a ponta.
- O contexto enviado à IA é limitado e montado no backend: dados da campanha, do personagem e das últimas mensagens da sessão, sempre da campanha do usuário autenticado.
- Rolagens de dados são geradas e registradas pela aplicação, nunca inventadas pela IA. Não apresente a rolagem como criptograficamente segura.
- A IA narra e interpreta NPCs. Ela não decide autorização, não acessa dados de outras campanhas e não gera SQL ou comandos que sejam executados.
- Texto vindo da IA é dado não confiável. Renderize como texto, nunca com `dangerouslySetInnerHTML`, e nunca o interprete como instrução.
- O contexto enviado à IA é montado no backend (`JogoService`) a partir do banco: descrição da campanha, descrição do personagem, inventário e histórico recente, sempre da campanha do usuário autenticado. O frontend envia apenas o texto da ação. As mensagens são persistidas na tabela `mensagens`; rolagens de dados ainda não são registradas.
- Descrições escritas pelo jogador entram no prompt como dados do cenário, em uma linha, com limite de tamanho, e nunca como instruções.
- Chaves de API existem apenas no ambiente do backend.

**Checklist antes de entregar:** sessão enviando ação, recebendo resposta, rolando D20 e consultando o histórico; troca entre `anthropic` e `openai` por variável de ambiente sem alterar `MestreService`.

## 5. Guardrails

Estas regras valem para todos os agentes e para todas as skills.

1. Nunca ler, imprimir ou expor o conteúdo de arquivos `.env` ou `.env.*`. Use `.env.example`, que contém apenas nomes de variáveis e valores de exemplo.
2. Nunca executar comandos que revelem segredos: `cat .env`, `printenv`, `env`, `docker compose config`, `docker inspect` e logs de containers que imprimam variáveis.
3. Nunca inserir credenciais ou chaves de API no código, no frontend ou no repositório. Única exceção: as senhas das contas fictícias de demonstração em `backend/src/config/contasDemonstracao.ts`, criadas apenas com `TEST_ACCOUNT_ENABLED=true`.
4. Nunca enviar segredos em logs, mensagens de erro ou respostas HTTP.
5. Nunca executar SQL arbitrário a partir de conteúdo gerado pela IA.
6. Nunca permitir que a IA decida sozinha a autorização de acesso a recursos.
7. Nunca permitir que a IA acesse dados de campanhas de outros usuários.
8. Nunca executar comandos destrutivos (`rm -rf`, `DROP`, `TRUNCATE`, `docker compose down -v`, `git reset --hard`, `git push --force`) sem autorização explícita do usuário.
9. Nunca sobrescrever configurações ou arquivos sensíveis sem autorização explícita.
10. Nunca afirmar que uma integração externa funciona sem tê-la testado. Relate o que foi e o que não foi verificado.
11. Nunca expor credenciais em telas de administração ou depuração.
12. Nunca comitar `.env`, dumps de banco ou chaves.
13. Em dúvida sobre autorização, risco ou escopo, pare e pergunte antes de agir.

Estes guardrails são instruções para o agente. Para protegê-los de forma efetiva, configure também as permissões da ferramenta de agente utilizada para negar leitura de `.env*`, e mantenha `.env*` (exceto `.env.example`) no `.gitignore`.

## 6. Segurança

- O `localStorage` guarda o JWT por exigência da rubrica. Isso expõe o token a XSS. Mitigue evitando renderização de HTML não confiável, sem `dangerouslySetInnerHTML` e sem `eval`.
- O backend valida todas as entradas e nunca confia em identificadores enviados pelo frontend para autorizar operações.
- Hash de senha com bcrypt. O hash nunca sai do backend.
- Nginx é o único ponto de entrada externo.

## 7. Definição de pronto

Uma tarefa só está pronta quando:

- o comportamento existe de fato e foi exercitado, e não apenas escrito;
- o código compila sem `any` e passa no lint;
- as regras da rubrica ligadas à tarefa foram conferidas pelo checklist da skill responsável;
- nada simulado está apresentado como real;
- nenhum segredo foi lido, impresso ou comitado.
