import React from 'react';

export function ContentManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
        <p className="text-gray-600">Manage your content and scripts</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Content Management</h2>
        <p className="text-gray-600">Upload scripts, manage content, and track performance</p>
      </div>
    </div>
  );
}