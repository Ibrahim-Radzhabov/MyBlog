insert into public.categories (name, slug, description)
values
  ('Marketing', 'marketing', 'Prompts for campaigns, growth experiments, and paid media workflows.'),
  ('Product', 'product', 'Prompts for product strategy, specs, and feature discovery.'),
  ('Support', 'support', 'Prompts for customer support communication and triage.'),
  ('Operations', 'operations', 'Prompts for internal docs, checklists, and process automation.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.tags (name, slug)
values
  ('seo', 'seo'),
  ('copywriting', 'copywriting'),
  ('analysis', 'analysis'),
  ('email', 'email'),
  ('productivity', 'productivity'),
  ('customer-success', 'customer-success'),
  ('automation', 'automation'),
  ('documentation', 'documentation')
on conflict (slug) do update set
  name = excluded.name,
  updated_at = now();

insert into public.prompts (
  title,
  slug,
  short_description,
  full_prompt_text,
  output_example,
  variables_json,
  category_id,
  status,
  seo_title,
  seo_description,
  published_at,
  cover_image_url,
  created_by
)
values (
  'Landing Page Copy Generator',
  'landing-page-copy-generator',
  'Generate conversion-focused landing page copy with clear sections, CTAs, and objection handling.',
  'You are a senior conversion copywriter.\n\nGoal: create landing page copy for {{product_name}} targeted at {{audience}}.\n\nRequirements:\n1. Hero headline + subheadline\n2. 3 value pillars\n3. Social proof block\n4. FAQ with 5 questions\n5. Strong primary CTA\n\nTone: {{tone}}\nLength: {{length}}\n\nReturn in markdown with clear section headings.',
  '## Hero\nLaunch analytics dashboards in 5 minutes\n\n## Value Pillars\n- ...',
  '[{"name":"product_name","label":"Product name","type":"text","required":true},{"name":"audience","label":"Target audience","type":"text","required":true},{"name":"tone","label":"Tone","type":"select","required":true,"options":["professional","friendly","bold"]},{"name":"length","label":"Length","type":"select","required":true,"options":["short","medium","long"]}]'::jsonb,
  (select id from public.categories where slug = 'marketing'),
  'published',
  'Landing Page Copy Generator Prompt',
  'Conversion-focused landing page prompt template for SaaS and ecommerce teams.',
  now(),
  '/placeholder-cover.png',
  null
),
(
  'Customer Support Reply Framework',
  'customer-support-reply-framework',
  'Craft empathetic and policy-safe support responses with concise action steps.',
  'You are a customer support specialist.\n\nWrite a response to customer issue: {{issue_summary}}\nProduct context: {{product_context}}\nPolicy constraints: {{policy_constraints}}\n\nOutput format:\n- Empathy sentence\n- Root cause explanation\n- Immediate next steps\n- Optional workaround\n- Closing line\n\nTone: calm, professional, clear.',
  'Hi Sarah, thanks for flagging this. I can see how disruptive this is...\n\nNext steps:\n1) ...\n2) ...',
  '[{"name":"issue_summary","label":"Issue summary","type":"text","required":true},{"name":"product_context","label":"Product context","type":"text","required":true},{"name":"policy_constraints","label":"Policy constraints","type":"text","required":false}]'::jsonb,
  (select id from public.categories where slug = 'support'),
  'published',
  'Customer Support Reply Prompt',
  'Structured support reply framework with empathy and clear next steps.',
  now(),
  '/placeholder-cover.png',
  null
)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  full_prompt_text = excluded.full_prompt_text,
  output_example = excluded.output_example,
  variables_json = excluded.variables_json,
  category_id = excluded.category_id,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  published_at = excluded.published_at,
  cover_image_url = excluded.cover_image_url,
  updated_at = now();

insert into public.prompt_tags (prompt_id, tag_id)
select p.id, t.id
from public.prompts p
join public.tags t on t.slug in ('seo', 'copywriting', 'automation')
where p.slug = 'landing-page-copy-generator'
on conflict do nothing;

insert into public.prompt_tags (prompt_id, tag_id)
select p.id, t.id
from public.prompts p
join public.tags t on t.slug in ('customer-success', 'documentation')
where p.slug = 'customer-support-reply-framework'
on conflict do nothing;
