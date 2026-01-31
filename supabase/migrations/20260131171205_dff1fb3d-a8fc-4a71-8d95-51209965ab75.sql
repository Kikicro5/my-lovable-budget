-- Remove the old header-based RLS policy since we now use cryptographic verification via edge functions
-- All purchase data access now goes through verified edge functions using service role

-- Drop the old SELECT policy that used x-device-id header
DROP POLICY IF EXISTS "Users can view own purchases by device_id" ON public.ad_free_purchases;

-- Create a new restrictive policy that blocks ALL direct client access
-- This ensures the table can ONLY be accessed via edge functions using service_role
CREATE POLICY "Block all direct client access"
ON public.ad_free_purchases
FOR SELECT
TO public
USING (false);

-- Add explicit UPDATE and DELETE blocking policies
CREATE POLICY "Block all updates"
ON public.ad_free_purchases
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Block all deletes"
ON public.ad_free_purchases
FOR DELETE
TO public
USING (false);