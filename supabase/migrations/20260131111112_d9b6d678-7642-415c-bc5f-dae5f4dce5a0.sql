-- Create table for tracking ad-free purchases
CREATE TABLE public.ad_free_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  paypal_order_id TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR'
);

-- Enable RLS
ALTER TABLE public.ad_free_purchases ENABLE ROW LEVEL SECURITY;

-- Anyone can check if their device has purchased (by device_id)
CREATE POLICY "Anyone can view their own purchase" 
ON public.ad_free_purchases 
FOR SELECT 
USING (true);

-- Only edge functions can insert (service role)
CREATE POLICY "Service role can insert purchases" 
ON public.ad_free_purchases 
FOR INSERT 
WITH CHECK (true);