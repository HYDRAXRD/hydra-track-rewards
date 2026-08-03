CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  task_id TEXT NOT NULL,
  handle TEXT NOT NULL DEFAULT '',
  screenshot TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE (wallet_address, task_id)
);
GRANT SELECT, INSERT, UPDATE ON public.submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "submissions_read_all" ON public.submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "submissions_insert_all" ON public.submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "submissions_update_all" ON public.submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.reward_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reward_payouts TO anon;
GRANT SELECT, INSERT ON public.reward_payouts TO authenticated;
GRANT ALL ON public.reward_payouts TO service_role;
ALTER TABLE public.reward_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payouts_read_all" ON public.reward_payouts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "payouts_insert_all" ON public.reward_payouts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.custom_tasks (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  reward NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'social',
  icon_name TEXT NOT NULL DEFAULT 'Star',
  verify_mode TEXT NOT NULL DEFAULT 'manual',
  profile_label TEXT,
  profile_placeholder TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_tasks TO authenticated;
GRANT ALL ON public.custom_tasks TO service_role;
ALTER TABLE public.custom_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_tasks_read_all" ON public.custom_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "custom_tasks_write_all" ON public.custom_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);