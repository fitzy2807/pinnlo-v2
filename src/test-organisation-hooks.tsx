'use client'

import React from 'react';
import { useOrganisationCards } from './hooks/organisation/useOrganisationCards';
import { useOrganisationGroups } from './hooks/organisation/useOrganisationGroups';

export function TestOrganisationHooks() {
  const { cards, loading: cardsLoading, createCard } = useOrganisationCards();
  const { groups, loading: groupsLoading, createGroup } = useOrganisationGroups();

  const testCreateCard = () => {
    createCard({
      title: 'Test Organisation Card',
      description: 'Testing the hooks',
      card_type: 'organisation',
      priority: 'medium'
    });
  };

  const testCreateGroup = () => {
    createGroup({
      name: 'Test Group',
      description: 'Testing group creation',
      color: 'blue'
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Organisation Hooks Test</h2>
      <div className="space-y-2 mb-4">
        <div>Cards Loading: {cardsLoading ? 'Yes' : 'No'}</div>
        <div>Cards Count: {cards.length}</div>
        <div>Groups Loading: {groupsLoading ? 'Yes' : 'No'}</div>
        <div>Groups Count: {groups.length}</div>
      </div>
      <div className="space-x-4">
        <button 
          onClick={testCreateCard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Test Card
        </button>
        <button 
          onClick={testCreateGroup}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create Test Group
        </button>
      </div>
    </div>
  );
}