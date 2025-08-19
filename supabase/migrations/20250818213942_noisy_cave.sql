/*
  # Dados de exemplo para o app Bible Study

  1. Versões da Bíblia
    - Adiciona versão NVI (Nova Versão Internacional)
    - Adiciona alguns versículos de exemplo

  2. Igrejas de exemplo
    - Cria igrejas com dados realistas
    - Adiciona serviços programados

  3. Dados de teste
    - Versículos populares
    - Serviços ao vivo e programados
*/

-- Inserir versão da Bíblia
INSERT INTO bible_versions (id, name, abbreviation, language, license) VALUES
('nvi', 'Nova Versão Internacional', 'NVI', 'pt', 'Sociedade Bíblica Internacional')
ON CONFLICT (id) DO NOTHING;

-- Inserir alguns versículos populares
INSERT INTO bible_verses (version_id, book, chapter, verse, text) VALUES
('nvi', 43, 3, 16, 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.'),
('nvi', 19, 23, 1, 'O Senhor é o meu pastor; nada me faltará.'),
('nvi', 46, 13, 4, 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.'),
('nvi', 50, 4, 13, 'Tudo posso naquele que me fortalece.'),
('nvi', 45, 8, 28, 'Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.'),
('nvi', 19, 23, 2, 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.'),
('nvi', 19, 23, 3, 'Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.'),
('nvi', 19, 23, 4, 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.'),
('nvi', 46, 13, 5, 'Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor.'),
('nvi', 46, 13, 6, 'O amor não se alegra com a injustiça, mas se alegra com a verdade.'),
('nvi', 46, 13, 7, 'Tudo sofre, tudo crê, tudo espera, tudo suporta.'),
('nvi', 46, 13, 8, 'O amor nunca perece. Mas as profecias desaparecerão, as línguas cessarão, o conhecimento passará.')
ON CONFLICT (version_id, book, chapter, verse) DO NOTHING;

-- Inserir igrejas de exemplo
INSERT INTO churches (id, name, slug, description, location, members_count) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Igreja Comunidade da Graça', 'comunidade-graca', 'Uma comunidade vibrante focada no ensino bíblico e comunhão.', 'Centro, São Paulo - SP', 450),
('550e8400-e29b-41d4-a716-446655440002', 'Primeira Igreja Batista', 'primeira-batista', 'Adoração tradicional com coração contemporâneo para a comunidade.', 'Rua das Flores, Rio de Janeiro - RJ', 280),
('550e8400-e29b-41d4-a716-446655440003', 'Igreja Nova Vida', 'nova-vida', 'Igreja jovem apaixonada por adoração e evangelismo.', 'Avenida Paulista, São Paulo - SP', 150)
ON CONFLICT (id) DO NOTHING;

-- Inserir serviços de exemplo
INSERT INTO services (id, church_id, title, starts_at, is_live, preacher_name, sermon_title, sermon_passage, attendees_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Culto Matutino de Domingo', '2025-01-19 10:00:00+00', true, 'Pastor João Silva', 'Caminhando na Fé', 'Hebreus 11:1-16', 180),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Culto Vespertino', '2025-01-19 18:00:00+00', false, 'Pastora Maria Rodriguez', 'O Poder da Oração', 'Mateus 6:5-15', 95),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Culto de Domingo', '2025-01-20 11:00:00+00', false, 'Pastor David Kim', 'Amor em Ação', '1 João 4:7-21', 0),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Culto de Quarta-feira', '2025-01-22 19:30:00+00', false, 'Pastor João Silva', 'Estudos em Salmos', 'Salmos 1:1-6', 0),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Culto de Jovens', '2025-01-25 19:00:00+00', false, 'Pastor Lucas Santos', 'Propósito na Juventude', 'Eclesiastes 12:1', 0)
ON CONFLICT (id) DO NOTHING;