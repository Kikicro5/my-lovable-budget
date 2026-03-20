import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';

interface GroupMember {
  user_id: string;
  email: string;
  role: 'owner' | 'member';
  joined_at: string;
}

interface GroupInfo {
  id: string;
  invite_code: string;
  name: string;
  created_by: string;
  max_members: number;
}

interface GroupState {
  group: GroupInfo | null;
  members: GroupMember[];
  myRole: 'owner' | 'member' | null;
  isLoading: boolean;
}

export const useGroup = () => {
  const { user, isAdmin } = useAuth();
  const { isPremium } = usePremium();
  const [state, setState] = useState<GroupState>({
    group: null,
    members: [],
    myRole: null,
    isLoading: true,
  });

  const canUseGroups = !!user && (isPremium || isAdmin);

  const fetchGroupInfo = useCallback(async () => {
    if (!canUseGroups) {
      setState({ group: null, members: [], myRole: null, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-group', {
        body: { action: 'info' },
      });

      if (error) throw error;

      setState({
        group: data.group || null,
        members: data.members || [],
        myRole: data.myRole || null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Group info error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [canUseGroups]);

  useEffect(() => {
    fetchGroupInfo();
  }, [fetchGroupInfo]);

  const createGroup = async (name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-group', {
        body: { action: 'create', name },
      });
      if (error) return { success: false, error: 'Greška pri kreiranju grupe' };
      if (data.error) return { success: false, error: data.error };
      await fetchGroupInfo();
      return { success: true };
    } catch {
      return { success: false, error: 'Greška pri povezivanju' };
    }
  };

  const joinGroup = async (inviteCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-group', {
        body: { action: 'join', inviteCode },
      });
      if (error) return { success: false, error: 'Greška pri pridruživanju' };
      if (data.error) return { success: false, error: data.error };
      await fetchGroupInfo();
      return { success: true };
    } catch {
      return { success: false, error: 'Greška pri povezivanju' };
    }
  };

  const leaveGroup = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-group', {
        body: { action: 'leave' },
      });
      if (error) return { success: false, error: 'Greška pri napuštanju' };
      if (data.error) return { success: false, error: data.error };
      await fetchGroupInfo();
      return { success: true };
    } catch {
      return { success: false, error: 'Greška pri povezivanju' };
    }
  };

  const removeMember = async (memberId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-group', {
        body: { action: 'remove-member', memberId },
      });
      if (error) return { success: false, error: 'Greška pri uklanjanju' };
      if (data.error) return { success: false, error: data.error };
      await fetchGroupInfo();
      return { success: true };
    } catch {
      return { success: false, error: 'Greška pri povezivanju' };
    }
  };

  return {
    ...state,
    canUseGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    removeMember,
    refreshGroup: fetchGroupInfo,
  };
};
