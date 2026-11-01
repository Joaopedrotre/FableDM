-- Banco de dados da sprint de cadastro do FableDM.
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
