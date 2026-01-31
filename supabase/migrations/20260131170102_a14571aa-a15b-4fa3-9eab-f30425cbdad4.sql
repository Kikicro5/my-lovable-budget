-- Remove unused push_subscriptions table to eliminate attack surface
-- This table has no client-side code using it (local notifications use Capacitor API instead)

-- Drop the RLS policies first
DROP POLICY IF EXISTS "Block direct client inserts" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription by endpoint" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription by endpoint" ON public.push_subscriptions;

-- Drop the table
DROP TABLE IF EXISTS public.push_subscriptions;