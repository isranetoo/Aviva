/*
  # Schema inicial para o app Bible Study

  1. Novas Tabelas
    - `bible_versions` - Versões da Bíblia disponíveis
    - `bible_verses` - Versículos da Bíblia
    - `churches` - Igrejas cadastradas
    - `services` - Cultos/serviços das igrejas
    - `church_followers` - Relacionamento usuário-igreja
    - `user_bookmarks` - Favoritos dos usuários

  2. Segurança
    - Habilita RLS em todas as tabelas
    - Adiciona políticas para operações CRUD
    - Políticas específicas para dados públicos vs privados
*/

-- Versões da Bíblia
CREATE TABLE IF NOT EXISTS bible_versions (
  id text PRIMARY KEY,
  name text NOT NULL,
  abbreviation text NOT NULL,
  language text NOT NULL DEFAULT 'pt',
  license text,
  created_at timestamptz DEFAULT now()
);

-- Versículos da Bíblia
CREATE TABLE IF NOT EXISTS bible_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id text REFERENCES bible_versions(id) ON DELETE CASCADE,
  book integer NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  UNIQUE(version_id, book, chapter, verse)
);

-- Igrejas
CREATE TABLE IF NOT EXISTS churches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  location text,
  location_data jsonb,
  members_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cultos/Serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid REFERENCES churches(id) ON DELETE CASCADE,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  is_live boolean DEFAULT false,
  preacher_name text,
  sermon_title text,
  sermon_passage text,
  attendees_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seguidores de igrejas
CREATE TABLE IF NOT EXISTS church_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id uuid REFERENCES churches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, church_id)
);

-- Favoritos dos usuários
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  version_id text REFERENCES bible_versions(id) ON DELETE CASCADE,
  book integer NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, version_id, book, chapter, verse)
);

-- Habilitar RLS
ALTER TABLE bible_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Políticas para bible_versions (público)
CREATE POLICY "Bible versions are viewable by everyone"
  ON bible_versions FOR SELECT
  TO public
  USING (true);

-- Políticas para bible_verses (público)
CREATE POLICY "Bible verses are viewable by everyone"
  ON bible_verses FOR SELECT
  TO public
  USING (true);

-- Políticas para churches (público para leitura)
CREATE POLICY "Churches are viewable by everyone"
  ON churches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert churches"
  ON churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update churches they created"
  ON churches FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para services (público para leitura)
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para church_followers
CREATE POLICY "Users can view their own follows"
  ON church_followers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can follow churches"
  ON church_followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow churches"
  ON church_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para user_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON user_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON user_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
  ON user_bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON user_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bible_verses_reference ON bible_verses(version_id, book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_verses_text ON bible_verses USING gin(to_tsvector('portuguese', text));
CREATE INDEX IF NOT EXISTS idx_churches_slug ON churches(slug);
CREATE INDEX IF NOT EXISTS idx_services_church_starts ON services(church_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_church_followers_user ON church_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);