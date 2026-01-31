-- Add expiration date column to track annual subscription
ALTER TABLE public.ad_free_purchases 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 year');

-- Update existing records to have expiration 1 year from purchase
UPDATE public.ad_free_purchases 
SET expires_at = purchased_at + interval '1 year';