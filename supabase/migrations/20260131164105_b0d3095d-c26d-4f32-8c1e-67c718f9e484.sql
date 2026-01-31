-- Drop existing overly permissive INSERT policies
DROP POLICY IF EXISTS "Service role can insert purchases" ON public.ad_free_purchases;
DROP POLICY IF EXISTS "Anyone can create push subscriptions" ON public.push_subscriptions;

-- Create restrictive INSERT policies that block direct client inserts
-- Edge functions using service_role key bypass RLS, so legitimate inserts still work
CREATE POLICY "Block direct client inserts"
ON public.ad_free_purchases
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct client inserts"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (false);