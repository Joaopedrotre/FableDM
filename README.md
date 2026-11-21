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
| `GET /campanhas/:id/sessao` | JWT | Campanha, personagem, itens e histórico para abrir a tela de jogo |
| `POST /campanhas/:id/mensagens` | JWT | Envia uma ação; o backend monta o contexto, chama o LLM e grava as duas mensagens |

Fora do Docker, as mesmas rotas ficam em `http://localhost:3000` e o frontend usa `VITE_API_URL`.

## Campanhas, personagens e itens

O menu hambúrguer tem as opções **Campanhas** e **Personagens**. Cada campanha tem o botão **Continuar aventura**, que abre `/jogo/:id` com todo o histórico salvo. Cada personagem tem o botão **Itens**, que abre o inventário dele logo abaixo do resumo do personagem. A descrição da campanha, a descrição do personagem e o inventário são enviados ao mestre a cada ação, e o histórico fica salvo no banco.

Se o volume do MySQL já existia antes desta versão, as novas tabelas não são criadas sozinhas. Rode `docker compose down -v` (apaga os dados; as contas de demonstração são recriadas) ou execute o `schema-jogo.sql` conforme `backend/database/README.md`.

## Problemas comuns

- **Backend reiniciando em loop:** veja `docker compose logs backend`. As causas mais comuns são `JWT_SECRET` com menos de 32 caracteres, `LLM_API_KEY` vazia ou `LLM_MODEL` ausente.
- **Acesso negado ao MySQL após trocar senha no `.env`:** o MySQL só lê as senhas na criação do volume. Sem dados importantes, rode `docker compose down -v` e suba de novo.
- **Sessão expirada:** o token dura `JWT_EXPIRES_IN` (padrão 1 dia). Ao expirar, o frontend volta ao login.
- **Primeiro build:** o backend instala dependências com `npm install`. Rode `npm install` dentro de `backend/` para atualizar o `package-lock.json` (foi adicionada a dependência `jsonwebtoken`) e comite o arquivo.
