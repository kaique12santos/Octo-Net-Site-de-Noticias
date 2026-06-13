-- Migration: 001_create_initial_schema
-- Description: Criação das tabelas profiles, categories, news, tags, news_tags e comments
-- Squad: #Octo-net
-- Data: 2026-06-12


-- Habilita extensão UUID se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Tabela profiles (Usuários)
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Armazena os dados públicos dos usuários cadastrados no portal';
COMMENT ON COLUMN profiles.id IS 'UUID vinculado ao auth.users nativo do Supabase';

-- ============================================
-- 2. Tabela categories (Categorias)
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Tipos de notícias (ex: Tecnologia, Inovação, Carreira)';

-- ============================================
-- 3. Tabela news (Notícias)
-- ============================================
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    resumo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    autor_id UUID NOT NULL,
    categoria_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_news_autor 
        FOREIGN KEY (autor_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_categoria 
        FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE RESTRICT
);

COMMENT ON TABLE news IS 'Artigos principais do portal';

-- Índices para otimização de consultas frequentes
CREATE INDEX idx_news_autor_id ON news(autor_id);
CREATE INDEX idx_news_categoria_id ON news(categoria_id);
CREATE INDEX idx_news_created_at ON news(created_at DESC);

-- ============================================
-- 4. Tabela tags (Palavras-chave)
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tags IS 'Palavras-chave associadas às notícias';

-- ============================================
-- 5. Tabela Pivot news_tags (Muitos-para-Muitos)
-- ============================================
CREATE TABLE news_tags (
    news_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (news_id, tag_id),

    CONSTRAINT fk_newstags_news 
        FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT fk_newstags_tag 
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

COMMENT ON TABLE news_tags IS 'Relacionamento muitos-para-muitos entre notícias e tags';

-- ============================================
-- 6. Tabela comments (Comentários)
-- ============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL,
    autor_id UUID NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_comments_news 
        FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_autor 
        FOREIGN KEY (autor_id) REFERENCES profiles(id) ON DELETE CASCADE
);

COMMENT ON TABLE comments IS 'Interações dos usuários nas notícias';

-- Índices para otimização
CREATE INDEX idx_comments_news_id ON comments(news_id);
CREATE INDEX idx_comments_autor_id ON comments(autor_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ============================================
-- Políticas RLS (Row Level Security) - SEGURANÇA BLINDADA
-- ============================================

-- 1. Habilita RLS em TODAS as tabelas (Fecha todas as portas)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de LEITURA PÚBLICA (Todos podem ver o conteúdo)
CREATE POLICY "Perfis são visíveis publicamente" ON profiles FOR SELECT USING (true);
CREATE POLICY "Notícias são visíveis publicamente" ON news FOR SELECT USING (true);
CREATE POLICY "Comentários são visíveis publicamente" ON comments FOR SELECT USING (true);
CREATE POLICY "Categorias são visíveis publicamente" ON categories FOR SELECT USING (true);
CREATE POLICY "Tags são visíveis publicamente" ON tags FOR SELECT USING (true);
CREATE POLICY "News_tags visíveis publicamente" ON news_tags FOR SELECT USING (true);

-- 3. Políticas de CRIAÇÃO (INSERT) - Apenas o dono pode criar no seu nome
CREATE POLICY "Usuários podem criar seu próprio perfil" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários autenticados podem criar notícias" 
    ON news FOR INSERT WITH CHECK (auth.uid() = autor_id);

CREATE POLICY "Usuários autenticados podem comentar" 
    ON comments FOR INSERT WITH CHECK (auth.uid() = autor_id);

-- 4. Políticas de EDIÇÃO e EXCLUSÃO (UPDATE / DELETE)
CREATE POLICY "Usuários podem editar seu próprio perfil" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem editar suas próprias notícias" 
    ON news FOR UPDATE USING (auth.uid() = autor_id);

CREATE POLICY "Usuários podem deletar suas próprias notícias" 
    ON news FOR DELETE USING (auth.uid() = autor_id);

CREATE POLICY "Usuários podem deletar seus próprios comentários" 
    ON comments FOR DELETE USING (auth.uid() = autor_id);

-- ============================================
-- Dados iniciais (seeds)
-- ============================================
INSERT INTO categories (nome, slug) VALUES
    ('Tecnologia', 'tecnologia'),
    ('Inovação', 'inovacao'),
    ('Carreira', 'carreira'),
    ('Inteligência Artificial', 'inteligencia-artificial'),
    ('Programação', 'programacao')
ON CONFLICT (slug) DO NOTHING;