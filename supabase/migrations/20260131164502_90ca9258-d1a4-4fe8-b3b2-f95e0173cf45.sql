-- Add SELECT policy for push_subscriptions that restricts access based on endpoint header
CREATE POLICY "Users can view own subscription by endpoint"
ON public.push_subscriptions
FOR SELECT
USING (endpoint = ((current_setting('request.headers'::text, true))::json ->> 'x-subscription-endpoint'::text));