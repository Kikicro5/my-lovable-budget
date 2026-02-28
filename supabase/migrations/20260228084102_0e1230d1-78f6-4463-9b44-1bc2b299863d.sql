
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS: admins can read all roles
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Activation codes table
CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can read/manage codes
CREATE POLICY "Admins can manage codes" ON public.activation_codes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Block non-admin access
CREATE POLICY "Block non-admin select" ON public.activation_codes
  FOR SELECT USING (false);

-- Activations table
CREATE TABLE public.activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES public.activation_codes(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  device_id TEXT NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (code_id, user_id, device_id)
);
ALTER TABLE public.activations ENABLE ROW LEVEL SECURITY;

-- Users can read their own activations
CREATE POLICY "Users read own activations" ON public.activations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all activations
CREATE POLICY "Admins read all activations" ON public.activations
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Block direct inserts (only via edge function)
CREATE POLICY "Block direct inserts" ON public.activations
  FOR INSERT WITH CHECK (false);

-- Block direct updates
CREATE POLICY "Block direct updates" ON public.activations
  FOR UPDATE USING (false);

-- Block direct deletes
CREATE POLICY "Block direct deletes" ON public.activations
  FOR DELETE USING (false);

-- Index for faster lookups
CREATE INDEX idx_activations_user_device ON public.activations (user_id, device_id);
CREATE INDEX idx_activations_valid_until ON public.activations (valid_until);
CREATE INDEX idx_activation_codes_code ON public.activation_codes (code);
