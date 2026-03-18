CREATE TABLE public.google_play_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id text NOT NULL,
  purchase_token text NOT NULL UNIQUE,
  product_id text NOT NULL DEFAULT '001_01',
  order_id text,
  start_time timestamptz,
  expiry_time timestamptz NOT NULL,
  auto_renewing boolean DEFAULT true,
  payment_state integer,
  acknowledgement_state integer DEFAULT 0,
  price_currency_code text,
  price_amount_micros text,
  country_code text,
  cancel_reason integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.google_play_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block direct client inserts" ON public.google_play_subscriptions FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "Block direct client updates" ON public.google_play_subscriptions FOR UPDATE TO public USING (false);
CREATE POLICY "Block direct client deletes" ON public.google_play_subscriptions FOR DELETE TO public USING (false);
CREATE POLICY "Users can read own subscriptions" ON public.google_play_subscriptions FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all subscriptions" ON public.google_play_subscriptions FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));