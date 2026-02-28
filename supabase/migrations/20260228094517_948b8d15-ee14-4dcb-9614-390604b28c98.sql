-- Fix premium_settings SELECT policy: change from restrictive to permissive
DROP POLICY IF EXISTS "Anyone can read premium settings" ON public.premium_settings;

CREATE POLICY "Anyone can read premium settings"
ON public.premium_settings
FOR SELECT
TO public
USING (true);