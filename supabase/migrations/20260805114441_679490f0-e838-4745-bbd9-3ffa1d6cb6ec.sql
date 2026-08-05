-- submissions: remove public access; server-only via service role
DROP POLICY IF EXISTS "submissions_read_all" ON public.submissions;
DROP POLICY IF EXISTS "submissions_insert_all" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_all" ON public.submissions;
REVOKE ALL ON public.submissions FROM anon, authenticated;
GRANT ALL ON public.submissions TO service_role;

-- reward_payouts: remove public read/insert; server-only via service role
DROP POLICY IF EXISTS "payouts_read_all" ON public.reward_payouts;
DROP POLICY IF EXISTS "payouts_insert_all" ON public.reward_payouts;
REVOKE ALL ON public.reward_payouts FROM anon, authenticated;
GRANT ALL ON public.reward_payouts TO service_role;

-- custom_tasks: keep public read of the task catalog, remove public writes
DROP POLICY IF EXISTS "custom_tasks_write_all" ON public.custom_tasks;
REVOKE ALL ON public.custom_tasks FROM anon, authenticated;
GRANT SELECT ON public.custom_tasks TO anon, authenticated;
GRANT ALL ON public.custom_tasks TO service_role;