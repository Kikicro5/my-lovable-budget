
CREATE TABLE public.google_play_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id text NOT NULL,
  product_id text NOT NULL,
  purchase_token text NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL DEFAULT (now() + interval '1 year'),
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.google_play_purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY "Users read own gp purchases" ON public.google_play_purchases
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Block direct client inserts (edge function will handle)
CREATE POLICY "Block direct client inserts" ON public.google_play_purchases
  FOR INSERT TO public
  WITH CHECK (false);

CREATE POLICY "Block direct client updates" ON public.google_play_purchases
  FOR UPDATE TO public
  USING (false);

CREATE POLICY "Block direct client deletes" ON public.google_play_purchases
  FOR DELETE TO public
  USING (false);

-- Admins can read all
CREATE POLICY "Admins read all gp purchases" ON public.google_play_purchases
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
