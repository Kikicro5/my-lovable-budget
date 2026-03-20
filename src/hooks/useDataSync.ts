import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { BudgetState } from '@/types/budget';

const SYNC_DEBOUNCE_MS = 2000;

export const useDataSync = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);

  const canSync = user && isPremium;

  const saveToCloud = useCallback(async (state: BudgetState) => {
    if (!canSync || !user) return;

    // Debounce saves
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        const { error } = await supabase
          .from('user_data')
          .upsert({
            user_id: user.id,
            data: state as any,
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Sync save error:', error);
        }
      } catch (err) {
        console.error('Sync save failed:', err);
      } finally {
        isSyncingRef.current = false;
      }
    }, SYNC_DEBOUNCE_MS);
  }, [canSync, user]);

  const loadFromCloud = useCallback(async (): Promise<BudgetState | null> => {
    if (!canSync || !user) return null;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Sync load error:', error);
        return null;
      }

      if (data?.data) {
        return data.data as unknown as BudgetState;
      }
    } catch (err) {
      console.error('Sync load failed:', err);
    }

    return null;
  }, [canSync, user]);

  return {
    canSync: !!canSync,
    saveToCloud,
    loadFromCloud,
  };
};
