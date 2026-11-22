-- Banco de dados do FableDM.
-- Compatível com MySQL 8.0.16+.

CREATE DATABASE IF NOT EXISTS fabledm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fabledm;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  cpf CHAR(11) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_usuarios PRIMARY KEY (id),
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT uq_usuarios_cpf UNIQUE (cpf),
  CONSTRAINT chk_usuarios_nome CHECK (CHAR_LENGTH(TRIM(nome)) >= 3),
  CONSTRAINT chk_usuarios_cpf CHECK (cpf REGEXP '^[0-9]{11}$')
) ENGINE=InnoDB;

-- Observações:
-- 1. A senha original nunca é armazenada; somente o hash bcrypt.
-- 2. O e-mail usa collation case-insensitive, evitando duplicidade por maiúsculas/minúsculas.
-- 3. A validação completa do e-mail, da força da senha e dos dígitos do CPF
--    permanece na aplicação. O banco também protege a unicidade e o formato básico do CPF.

CREATE TABLE IF NOT EXISTS personagens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  imagem MEDIUMTEXT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_personagens PRIMARY KEY (id),
  CONSTRAINT fk_personagens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT chk_personagens_nome CHECK (CHAR_LENGTH(TRIM(nome)) >= 2),
  INDEX idx_personagens_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS itens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  personagem_id BIGINT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(500) NOT NULL DEFAULT '',
  quantidade INT UNSIGNED NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_itens PRIMARY KEY (id),
  CONSTRAINT fk_itens_personagem FOREIGN KEY (personagem_id) REFERENCES personagens (id) ON DELETE CASCADE,
  CONSTRAINT chk_itens_nome CHECK (CHAR_LENGTH(TRIM(nome)) >= 1),
  CONSTRAINT chk_itens_quantidade CHECK (quantidade BETWEEN 1 AND 999),
  INDEX idx_itens_personagem (personagem_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS campanhas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  personagem_id BIGINT UNSIGNED NULL,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_campanhas PRIMARY KEY (id),
  CONSTRAINT fk_campanhas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_campanhas_personagem FOREIGN KEY (personagem_id) REFERENCES personagens (id) ON DELETE SET NULL,
  CONSTRAINT chk_campanhas_nome CHECK (CHAR_LENGTH(TRIM(nome)) >= 2),
  INDEX idx_campanhas_usuario_atividade (usuario_id, atualizada_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historias (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  campanha_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  resumo VARCHAR(1000) NOT NULL DEFAULT '',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_historias PRIMARY KEY (id),
  CONSTRAINT fk_historias_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_historias_campanha FOREIGN KEY (campanha_id) REFERENCES campanhas (id) ON DELETE CASCADE,
  CONSTRAINT chk_historias_titulo CHECK (CHAR_LENGTH(TRIM(titulo)) >= 2),
  INDEX idx_historias_usuario_atividade (usuario_id, atualizada_em),
  INDEX idx_historias_campanha (campanha_id, atualizada_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensagens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  historia_id BIGINT UNSIGNED NOT NULL,
  autor ENUM('mestre', 'jogador') NOT NULL,
  texto MEDIUMTEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_mensagens PRIMARY KEY (id),
  CONSTRAINT fk_mensagens_historia FOREIGN KEY (historia_id) REFERENCES historias (id) ON DELETE CASCADE,
  INDEX idx_mensagens_historia (historia_id, id)
) ENGINE=InnoDB;
