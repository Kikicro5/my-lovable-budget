
-- Group sharing tables
CREATE TABLE public.shared_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Moja grupa',
  created_by uuid NOT NULL,
  max_members integer NOT NULL DEFAULT 5,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.group_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE UNIQUE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Updated_at trigger for group_data
CREATE TRIGGER set_group_data_updated_at
  BEFORE UPDATE ON public.group_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_data_updated_at();

-- Enable RLS
ALTER TABLE public.shared_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_data ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of a group
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

-- RLS for shared_groups: members can read their groups
CREATE POLICY "Members can read own groups"
  ON public.shared_groups FOR SELECT
  TO authenticated
  USING (public.is_group_member(auth.uid(), id));

-- Block direct inserts/updates/deletes on shared_groups (managed via edge function)
CREATE POLICY "Block direct inserts on groups"
  ON public.shared_groups FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Block direct updates on groups"
  ON public.shared_groups FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "Block direct deletes on groups"
  ON public.shared_groups FOR DELETE
  TO public
  USING (false);

-- RLS for group_members: members can read members of their groups
CREATE POLICY "Members can read group members"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Block direct inserts on members"
  ON public.group_members FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Block direct updates on members"
  ON public.group_members FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "Block direct deletes on members"
  ON public.group_members FOR DELETE
  TO public
  USING (false);

-- RLS for group_data: members can read and update their group's data
CREATE POLICY "Members can read group data"
  ON public.group_data FOR SELECT
  TO authenticated
  USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can update group data"
  ON public.group_data FOR UPDATE
  TO authenticated
  USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Block direct inserts on group data"
  ON public.group_data FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Block direct deletes on group data"
  ON public.group_data FOR DELETE
  TO public
  USING (false);

-- Enable realtime for group_data
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_data;
