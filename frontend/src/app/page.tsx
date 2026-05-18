'use client';

import { useState } from 'react';
import { Shield, Key, Wallet } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'developer' | 'user'>('developer');

  return (
    <main className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-nebula-600" />
              <span className="text-xl font-bold text-gray-900">NebulaGate</span>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('developer')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'developer' ? 'bg-nebula-100 text-nebula-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Developer
              </button>
              <button
                onClick={() => setActiveTab('user')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'user' ? 'bg-nebula-100 text-nebula-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User
              </button>
            </nav>
            <button className="flex items-center space-x-2 bg-nebula-600 text-white px-4 py-2 rounded-lg hover:bg-nebula-700 transition">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Programmable Access Control</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The decentralized protocol for token-gated access on Stellar.
          </p>
        </div>
        {activeTab === 'developer' ? <DeveloperDashboard /> : <UserPortal />}
      </div>
    </main>
  );
}

function DeveloperDashboard() {
  const [policies] = useState([
    { id: '1', name: 'Premium Members', conditions: 2, active: true },
    { id: '2', name: 'NFT Holders', conditions: 1, active: true },
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Your Policies</h2>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{policy.name}</h3>
                  <p className="text-sm text-gray-500">{policy.conditions} conditions</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${policy.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {policy.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Policy</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Policy Name</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Premium Access" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logic Type</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>AND (All conditions required)</option>
                <option>OR (Any condition sufficient)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-nebula-600 text-white py-2 rounded-lg hover:bg-nebula-700">
              Create Policy
            </button>
          </form>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-600">Total Policies</span><span className="font-semibold">2</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Access Grants</span><span className="font-semibold">156</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPortal() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-nebula-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-nebula-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Your Credentials</h2>
        <p className="text-gray-600 mb-6">Connect your wallet to view and claim access credentials.</p>
        <button className="inline-flex items-center space-x-2 bg-nebula-600 text-white px-6 py-3 rounded-lg hover:bg-nebula-700">
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </button>
      </div>
    </div>
  );
}
