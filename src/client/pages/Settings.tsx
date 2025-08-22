import React from 'react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your platforms and preferences</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Platform Settings</h2>
        <p className="text-gray-600">Connect your social media accounts and configure API keys</p>
      </div>
    </div>
  );
}