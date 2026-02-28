
-- Premium settings table for admin-configurable pricing
CREATE TABLE public.premium_settings (
  id text PRIMARY KEY DEFAULT 'default',
  price numeric NOT NULL DEFAULT 6.99,
  currency text NOT NULL DEFAULT 'EUR',
  duration_days integer NOT NULL DEFAULT 30,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premium_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone needs to see the price)
CREATE POLICY "Anyone can read premium settings"
ON public.premium_settings
FOR SELECT
USING (true);

-- Block all direct modifications (only edge functions with service role can modify)
CREATE POLICY "Block direct client inserts"
ON public.premium_settings
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct client updates"
ON public.premium_settings
FOR UPDATE
USING (false);

CREATE POLICY "Block direct client deletes"
ON public.premium_settings
FOR DELETE
USING (false);

-- Insert default settings
INSERT INTO public.premium_settings (id, price, currency, duration_days) 
VALUES ('default', 6.99, 'EUR', 30);
