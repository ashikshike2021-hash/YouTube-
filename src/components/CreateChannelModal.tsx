import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onChannelCreated: (channel: any) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, user, onChannelCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('channels')
        .insert({
          id: user.id,
          name,
          description
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      onChannelCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create channel. Did you run the SQL?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-[#333333]">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-[#1a1a1a] hover:bg-[#333333] rounded-full transition-colors">
          <X size={20} className="text-gray-400" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Create Channel</h2>
        
        {error && <div className="bg-red-900/30 text-red-400 p-3 rounded-xl mb-5 text-sm font-medium border border-red-800/50">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5 ml-1">Channel Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white"
              placeholder="e.g. My Awesome Channel"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1.5 ml-1">Description (Optional)</label>
            <textarea
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333333] rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-white"
              placeholder="Tell viewers about your channel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-3 disabled:bg-blue-400 shadow-md shadow-blue-200"
          >
            {loading ? 'Creating...' : 'Create Channel'}
          </button>
        </form>
      </div>
    </div>
  );
}
