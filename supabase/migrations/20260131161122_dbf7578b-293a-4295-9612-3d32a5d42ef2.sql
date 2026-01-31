-- Drop existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view their own purchase" ON public.ad_free_purchases;

-- Create new restricted SELECT policy - users can only view their own purchases by device_id
-- The client must send the device_id in the x-device-id header
CREATE POLICY "Users can view own purchases by device_id"
ON public.ad_free_purchases
FOR SELECT
USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');