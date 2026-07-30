-- Migration: 003_create_verification_tokens
-- Description: Tokens de uso unico para redefinicao de senha, recuperacao de e-mail e login por codigo
-- Squad: #Octo-net

CREATE TABLE verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT chk_purpose CHECK (purpose IN ('password_reset', 'email_recovery', 'login_code'))
);

CREATE INDEX idx_tokens_hash ON verification_tokens(token_hash);
CREATE INDEX idx_tokens_user_purpose ON verification_tokens(user_id, purpose, created_at DESC);

ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
