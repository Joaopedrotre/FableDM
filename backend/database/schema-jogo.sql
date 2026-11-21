USE fabledm;

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

CREATE TABLE IF NOT EXISTS mensagens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  campanha_id BIGINT UNSIGNED NOT NULL,
  autor ENUM('mestre', 'jogador') NOT NULL,
  texto MEDIUMTEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_mensagens PRIMARY KEY (id),
  CONSTRAINT fk_mensagens_campanha FOREIGN KEY (campanha_id) REFERENCES campanhas (id) ON DELETE CASCADE,
  INDEX idx_mensagens_campanha (campanha_id, id)
) ENGINE=InnoDB;
