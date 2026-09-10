INSERT INTO users (id, first_name, last_name, email, role, active)
SELECT
  ('00000000-0000-4000-8000-' || LPAD(i::text, 12, '0'))::uuid,
  'Demo' || i,
  'User' || i,
  'demo' || i || '@adminforge.local',
  CASE WHEN i % 10 = 0 THEN 'admin' WHEN i % 4 = 0 THEN 'editor' ELSE 'user' END,
  i % 9 <> 0
FROM generate_series(1, 100) AS i
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, description, price, category, image_url, active)
SELECT
  ('10000000-0000-4000-8000-' || LPAD(i::text, 12, '0'))::uuid,
  'Demo product ' || i,
  'Neutral AdminForge demo product ' || i,
  ROUND((9.90 + (i * 1.37))::numeric, 2),
  (ARRAY['Apparel', 'Accessories', 'Home', 'Tech', 'Office'])[((i - 1) % 5) + 1],
  'https://picsum.photos/seed/adminforge-' || i || '/640/480',
  i % 11 <> 0
FROM generate_series(1, 150) AS i
ON CONFLICT (id) DO NOTHING;

INSERT INTO forms (id, name, definition) VALUES
(
  'user-profile',
  'User profile',
  '[{"name":"firstName","type":"text","typeInput":"text","label":"First name","required":true},{"name":"lastName","type":"text","typeInput":"text","label":"Last name","required":true},{"name":"email","type":"text","typeInput":"email","label":"Email","required":true}]'::jsonb
),
(
  'product-editor',
  'Product editor',
  '[{"name":"name","type":"text","typeInput":"text","label":"Product name","required":true},{"name":"price","type":"text","typeInput":"number","label":"Price","required":true},{"name":"active","type":"checkbox","typeInput":"checkbox","label":"Active"}]'::jsonb
),
(
  'contact-demo',
  'Contact demo',
  '[{"name":"subject","type":"text","typeInput":"text","label":"Subject","required":true},{"name":"message","type":"textarea","typeInput":"text","label":"Message","required":true}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
