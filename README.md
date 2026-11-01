# FableDM

Plataforma web de RPG de mesa com proposta de integração a um Mestre de Jogo baseado em inteligência artificial.

## Estrutura

- `frontend/`: aplicação React + Vite existente.
- `backend/`: API Express + TypeScript da sprint atual.

## Sprint atual — cadastro de usuário

O backend implementa somente o cadastro com nome, e-mail, CPF e senha, incluindo validação de CPF, força da senha, formato de e-mail, prevenção de duplicidade e armazenamento seguro da senha com bcrypt.

Consulte [`backend/README.md`](backend/README.md) para instalação e execução. O endpoint `POST /usuarios` corresponde ao contrato já utilizado pelo frontend.
