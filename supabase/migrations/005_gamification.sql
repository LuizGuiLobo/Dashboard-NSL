-- ═══════════════════════════════════════════════
-- 005 GAMIFICAÇÃO — XP, Streaks, Badges, Missões
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS operadores_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operador_id UUID REFERENCES operadores(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_count INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE,
  streak_shield_available BOOLEAN NOT NULL DEFAULT true,
  total_os_completed INTEGER NOT NULL DEFAULT 0,
  total_kanban_moves INTEGER NOT NULL DEFAULT 0,
  total_missions_completed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(operador_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT CHECK(rarity IN ('comum','raro','épico','lendário')) NOT NULL DEFAULT 'comum',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🏅'
);

CREATE TABLE IF NOT EXISTS operador_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operador_id UUID REFERENCES operadores(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(operador_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  type TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS operador_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operador_id UUID REFERENCES operadores(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES daily_missions(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(operador_id, mission_id, date)
);

-- Seed achievements
INSERT INTO achievements (slug, name, description, rarity, xp_reward, icon) VALUES
  ('first_os',      'Iniciante',       'Primeira OS registrada',          'comum',    50,   '⭐'),
  ('os_5',          'Em Ritmo',        '5 OS concluídas',                 'comum',    100,  '🔧'),
  ('os_25',         'Veterano',        '25 OS concluídas',                'raro',     250,  '🏆'),
  ('os_100',        'Mestre',          '100 OS concluídas',               'épico',    500,  '💎'),
  ('os_500',        'Lenda',           '500 OS concluídas',               'lendário', 1000, '👑'),
  ('streak_7',      'Semana de Fogo',  '7 dias seguidos ativos',          'raro',     200,  '🔥'),
  ('streak_30',     'Dedicação',       '30 dias seguidos ativos',         'épico',    500,  '💪'),
  ('streak_100',    'Imparável',       '100 dias seguidos ativos',        'lendário', 1000, '⚡'),
  ('missions_10',   'Caçador',         '10 missões diárias completadas',  'raro',     150,  '🎯'),
  ('missions_50',   'Comandante',      '50 missões diárias completadas',  'épico',    400,  '🎖️'),
  ('level_5',       'Crescendo',       'Alcançou o nível 5',              'raro',     100,  '📈'),
  ('level_10',      'Expert',          'Alcançou o nível 10',             'épico',    300,  '🌟'),
  ('kanban_50',     'Movimentador',    '50 avanços no Kanban',            'comum',    75,   '↗️'),
  ('kanban_200',    'Fluido',          '200 avanços no Kanban',           'raro',     200,  '🌊')
ON CONFLICT (slug) DO NOTHING;

-- Seed daily missions
INSERT INTO daily_missions (slug, description, xp_reward, type, target_count) VALUES
  ('complete_1',  'Conclua 1 OS hoje',            50,  'complete_os',     1),
  ('complete_3',  'Conclua 3 OS hoje',            120, 'complete_os',     3),
  ('advance_5',   'Avance 5 cards no Kanban',     75,  'advance_kanban',  5),
  ('advance_10',  'Avance 10 cards no Kanban',    150, 'advance_kanban',  10),
  ('create_2',    'Registre 2 novas OS',          60,  'create_os',       2)
ON CONFLICT (slug) DO NOTHING;
