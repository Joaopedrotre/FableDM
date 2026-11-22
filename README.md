# Sobre o Projeto

Este projeto consiste no desenvolvimento de uma plataforma web de RPG de mesa com integração de inteligência artificial, que atua como Mestre de Jogo (Dungeon Master), auxiliando os jogadores na criação e condução de suas aventuras.

A proposta é oferecer um ambiente digital no qual os usuários possam criar campanhas, desenvolver personagens, além de interagir com um mestre virtual capaz de narrar acontecimentos, interpretar personagens, apresentar desafios e responder às decisões tomadas durante a aventura.

A plataforma busca proporcionar uma experiência imersiva e flexível, permitindo que cada campanha tenha seu próprio universo, personagens e acontecimentos. Para isso, o sistema também conta com ferramentas de apoio, como histórico de sessões e rolagem de dados, mantendo os principais recursos de uma mesa tradicional de RPG em um único ambiente.

Além da experiência de jogo, o projeto contempla o desenvolvimento de uma aplicação web completa, com autenticação de usuários, gerenciamento de dados, integração com serviços de inteligência artificial e uma infraestrutura baseada em contêineres.

O objetivo é unir a liberdade narrativa dos RPGs de mesa às possibilidades da inteligência artificial, tornando a criação e a condução de aventuras mais acessíveis, organizadas e dinâmicas.

## Como executar com Docker

Pré-requisito: Docker com o plugin Compose.

1. Copie o modelo de variáveis. O arquivo `.env` não deve ser versionado nem compartilhado.

   ```
   cp .env.example .env
   ```

2. Edite o `.env`: troque as senhas do MySQL, defina `JWT_SECRET` com pelo menos 32 caracteres aleatórios e informe `LLM_API_KEY`. O backend não inicia sem essas variáveis.
3. Suba os serviços:

   ```
   docker compose up --build
   ```

4. Acesse `http://localhost:8080` (ou a porta definida em `NGINX_PORT`).

O schema do banco é criado automaticamente na primeira vez que o volume do MySQL é criado. Para recomeçar do zero, use `docker compose down -v`, que apaga os dados.

## Conta de teste e acesso rápido

Com `TEST_ACCOUNT_ENABLED=true` no `.env`, o backend cria contas fictícias ao iniciar (somente as que ainda não existem) e a tela de login exibe o botão **Ir direto para o jogo (teste)**, que faz um login real e devolve um JWT válido.

| Nome | E-mail | Senha |
|---|---|---|
| Jogador de Teste | `teste@fabledm.local` | `Teste@12345` |
| Maria da Silva | `maria@example.com` | `Maria@12345` |
| Bruno Almeida | `bruno@example.com` | `Bruno@12345` |

Para conferir no banco: `docker compose exec mysql mysql -u root -p fabledm -e "SELECT id, nome, email, criado_em FROM usuarios"`.

Com `TEST_ACCOUNT_ENABLED=false` (padrão do backend), nenhuma conta é criada, a rota `/login/teste` responde 404 e o botão não aparece. Use esse valor em qualquer ambiente acessível por outras pessoas. Depois de alterar a variável, rode `docker compose up --build -d`, porque o frontend lê o valor na hora do build.

## Arquitetura

| Serviço | Redes | Portas publicadas |
|---|---|---|
| nginx | proxy-net | `NGINX_PORT` → 80 |
| frontend | proxy-net | nenhuma |
| backend | proxy-net, db-net | nenhuma |
| mysql | db-net (interna, sem acesso externo) | nenhuma |

O Nginx encaminha `/` para o frontend e `/api/` para o backend, removendo o prefixo `/api`. Como navegador e API usam a mesma origem, não há CORS. O backend alcança o MySQL pela rede interna e os dados ficam no volume `mysql_data`.

## Endpoints

| Método e rota | Acesso | Descrição |
|---|---|---|
| `GET /saude` | público | Estado da API e do banco |
| `POST /usuarios` | público | Cadastro |
| `POST /login` | público | Login, retorna `{ token, usuario }` |
| `POST /login/teste` | público, só com `TEST_ACCOUNT_ENABLED=true` | Login rápido na conta de teste |
| `PUT /usuarios/me` | JWT | Edição de nome, CPF e senha (e-mail não muda) |
| `POST /mestre/mensagem` | JWT | Conversa com o Mestre (LLM) sem campanha; o frontend não usa mais |
| `GET/POST /personagens`, `GET/PUT/DELETE /personagens/:id` | JWT | CRUD de personagens (nome, descrição, imagem), lista paginada |
| `GET/POST /personagens/:id/itens`, `GET/PUT/DELETE /personagens/:id/itens/:itemId` | JWT | CRUD de itens do personagem, lista paginada |
| `GET/POST /campanhas`, `GET/PUT/DELETE /campanhas/:id` | JWT | CRUD de campanhas, lista paginada |
| `GET/POST /historias`, `GET/PUT/DELETE /historias/:id` | JWT | CRUD de histórias (título, resumo, campanha), lista paginada com filtro opcional `?campanhaId=` |
| `GET /historias/:id/sessao` | JWT | História, campanha, personagem, itens e as últimas 100 mensagens para abrir a tela de jogo |
| `GET /historias/:id/mensagens?antesDe=` | JWT | Mensagens mais antigas que a de id informado (50 por vez) |
| `POST /historias/:id/mensagens` | JWT | Envia uma ação: salva a ação, monta o contexto, chama o LLM e salva a resposta |

Fora do Docker, as mesmas rotas ficam em `http://localhost:3000` e o frontend usa `VITE_API_URL`.

## Modelo de IA: Nemotron 3 Ultra via OpenRouter

O mestre usa o modelo `nvidia/nemotron-3-ultra-550b-a55b` pelo OpenRouter.

1. Crie uma conta em `openrouter.ai`, adicione créditos e gere uma chave em `openrouter.ai/keys`.
2. Cole a chave em `LLM_API_KEY` no `.env`. A chave fica só no backend, nunca vai para o navegador, para o git nem para conversas.
3. Mantenha `LLM_PROVIDER=openrouter` e `LLM_MODEL=nvidia/nemotron-3-ultra-550b-a55b`.
4. Suba os serviços e teste a conexão: `docker compose exec backend node dist/scripts/testarLlm.js`. A saída mostra o modelo, o tempo e uma frase do mestre; erros mostram só a mensagem, nunca a chave.

Pontos de atenção:

- **Raciocínio:** o modelo raciocina por padrão. O projeto vem com `LLM_REASONING=off` para respostas mais rápidas e baratas. Se você ligar (`medium` ou `high`), aumente `LLM_MAX_TOKENS` (por exemplo, 4000), porque os tokens de raciocínio contam no limite e podem consumir tudo antes do texto final.
- **Variante gratuita:** `nvidia/nemotron-3-ultra-550b-a55b:free` existe, com limite de requisições. Antes de usá-la com histórias de jogadores reais, leia a política de dados do OpenRouter para modelos gratuitos.
- **Custo:** os preços variam por provedor e mudam; confira em `openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b`. Cada ação envia o prompt, o contexto e até 20 mensagens do histórico.
- **Erros comuns:** `401` é chave inválida, `402` é falta de créditos e `429` é limite de requisições. Os detalhes aparecem em `docker compose logs backend`.

## Campanhas, personagens, itens e histórias

O menu hambúrguer tem as opções **Campanhas**, **Personagens**, **Histórias** e **Meu perfil**.

- Uma **campanha** tem nome, descrição e, opcionalmente, um personagem. O botão **Continuar aventura** abre a história mais recente dela.
- Uma **história** guarda todas as mensagens de uma sessão de jogo (suas ações e as respostas do mestre). Cada mensagem é salva no banco assim que é enviada, então você retoma de onde parou, mesmo depois de fechar o navegador. A tela de jogo mostra as últimas 100 mensagens e o botão **Carregar mensagens anteriores** traz as mais antigas. Uma campanha pode ter várias histórias, e o resumo opcional da história é enviado ao mestre como contexto.
- Um **personagem** tem nome, imagem e descrição, e seus **itens** ficam logo abaixo dele, na página de itens.

A cada ação, o backend envia ao mestre a descrição da campanha, o resumo da história, a descrição do personagem, o inventário e as últimas mensagens. A ação do jogador fica salva mesmo se o mestre falhar em responder.

Se o volume do MySQL já existia antes desta versão, as novas tabelas não são criadas sozinhas e a tabela `mensagens` mudou de formato. Rode `docker compose down -v` (apaga os dados; as contas de demonstração são recriadas).

## Problemas comuns

- **Backend reiniciando em loop:** veja `docker compose logs backend`. As causas mais comuns são `JWT_SECRET` com menos de 32 caracteres, `LLM_API_KEY` vazia ou `LLM_MODEL` ausente.
- **Acesso negado ao MySQL após trocar senha no `.env`:** o MySQL só lê as senhas na criação do volume. Sem dados importantes, rode `docker compose down -v` e suba de novo.
- **Sessão expirada:** o token dura `JWT_EXPIRES_IN` (padrão 1 dia). Ao expirar, o frontend volta ao login.
- **Primeiro build:** o backend instala dependências com `npm install`. Rode `npm install` dentro de `backend/` para atualizar o `package-lock.json` (foi adicionada a dependência `jsonwebtoken`) e comite o arquivo.
