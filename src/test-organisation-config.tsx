'use client'

import React from 'react';
import { organisationConfig } from '@/components/blueprints/configs/organisationConfig';
import { getBlueprintConfig } from '@/components/blueprints/registry';

export function TestOrganisationConfig() {
  // Test direct import
  console.log('Organisation Config:', organisationConfig);
  
  // Test registry lookup
  const registryConfig = getBlueprintConfig('organisation');
  console.log('Registry Config:', registryConfig);
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Organisation Config Test</h2>
      <div className="space-y-2">
        <div>Config ID: {organisationConfig.id}</div>
        <div>Config Name: {organisationConfig.name}</div>
        <div>Config Category: {organisationConfig.category}</div>
        <div>Config Icon: {organisationConfig.icon}</div>
        <div>Number of Fields: {organisationConfig.fields.length}</div>
        <div>Registry Lookup Success: {registryConfig ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}