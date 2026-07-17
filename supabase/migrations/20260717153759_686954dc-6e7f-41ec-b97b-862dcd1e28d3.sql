
-- Lock down all tables to authenticated users
DROP POLICY IF EXISTS "public all clients" ON public.clients;
DROP POLICY IF EXISTS "public all contracts" ON public.contracts;
DROP POLICY IF EXISTS "public read etw" ON public.etw_settings;
DROP POLICY IF EXISTS "public write etw" ON public.etw_settings;
DROP POLICY IF EXISTS "public all proposals" ON public.proposals;
DROP POLICY IF EXISTS "public all reps" ON public.representatives;
DROP POLICY IF EXISTS "public all services" ON public.services;

-- Revoke anon
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.contracts FROM anon;
REVOKE ALL ON public.etw_settings FROM anon;
REVOKE ALL ON public.proposals FROM anon;
REVOKE ALL ON public.representatives FROM anon;
REVOKE ALL ON public.services FROM anon;

-- Grant to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etw_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.representatives TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;

-- Authenticated-only policies
CREATE POLICY "auth all clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all contracts" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all etw" ON public.etw_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all proposals" ON public.proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all reps" ON public.representatives FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
