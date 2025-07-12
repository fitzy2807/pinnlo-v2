import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type StrategyGroup = Database['public']['Tables']['strategy_groups']['Row'];

export function useStrategyGroups(strategyId: number) {
  const supabase = createClientComponentClient<Database>();
  const [groups, setGroups] = useState<StrategyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (strategyId) {
      loadGroups();
    }
  }, [strategyId]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('strategy_groups_with_counts')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, color: string = 'blue') => {
    try {
      const { data, error } = await supabase
        .from('strategy_groups')
        .insert({
          strategy_id: strategyId,
          name,
          color
        })
        .select()
        .single();

      if (error) throw error;
      
      // Reload to get counts
      await loadGroups();
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const updateGroup = async (groupId: string, updates: { name?: string; color?: string }) => {
    try {
      const { error } = await supabase
        .from('strategy_groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;
      
      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      ));
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      // First, remove group from all cards
      const { error: cardError } = await supabase.rpc('remove_group_from_all_cards', {
        group_id_param: groupId
      });

      if (cardError) throw cardError;

      // Then delete the group
      const { error } = await supabase
        .from('strategy_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      
      // Update local state
      setGroups(prev => prev.filter(group => group.id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const addCardToGroup = async (cardId: string, groupId: string) => {
    try {
      // Get current card
      const { data: card, error: fetchError } = await supabase
        .from('cards')
        .select('group_ids')
        .eq('id', cardId)
        .single();

      if (fetchError) throw fetchError;

      const currentGroups = card.group_ids || [];
      if (currentGroups.includes(groupId)) return; // Already in group

      // Update card with new group
      const { error } = await supabase
        .from('cards')
        .update({
          group_ids: [...currentGroups, groupId]
        })
        .eq('id', cardId);

      if (error) throw error;
      
      // Reload groups to update counts
      await loadGroups();
    } catch (error) {
      console.error('Error adding card to group:', error);
      throw error;
    }
  };

  const removeCardFromGroup = async (cardId: string, groupId: string) => {
    try {
      // Get current card
      const { data: card, error: fetchError } = await supabase
        .from('cards')
        .select('group_ids')
        .eq('id', cardId)
        .single();

      if (fetchError) throw fetchError;

      const currentGroups = card.group_ids || [];
      const updatedGroups = currentGroups.filter(id => id !== groupId);

      // Update card
      const { error } = await supabase
        .from('cards')
        .update({
          group_ids: updatedGroups
        })
        .eq('id', cardId);

      if (error) throw error;
      
      // Reload groups to update counts
      await loadGroups();
    } catch (error) {
      console.error('Error removing card from group:', error);
      throw error;
    }
  };

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    addCardToGroup,
    removeCardFromGroup,
    refetch: loadGroups
  };
}