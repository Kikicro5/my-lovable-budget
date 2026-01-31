-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete their subscription" ON public.push_subscriptions;

-- Create new restricted DELETE policy - users can only delete their own subscription by endpoint
-- The client must provide the exact endpoint to delete, which acts as a secret identifier
CREATE POLICY "Users can delete own subscription by endpoint"
ON public.push_subscriptions
FOR DELETE
USING (endpoint = current_setting('request.headers', true)::json->>'x-subscription-endpoint');