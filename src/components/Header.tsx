import React, { useState } from 'react';
import { Menu, Video, User, LogOut, X, Crown, Home, History, Star, Settings } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onUploadClick: () => void;
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onHomeClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick, user, onSignIn, onSignOut, onHomeClick, searchQuery = '', onSearchChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-black border-b border-[#333333]">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-gray-800 rounded-full text-white">
            <Menu size={24} />
          </button>
          <div className="font-bold text-xl flex items-center gap-1 cursor-pointer tracking-tight text-white" onClick={onHomeClick}>
            <div className="bg-red-600 text-white p-1 rounded-lg mr-1 text-[10px] leading-3 flex items-center justify-center w-6 h-6">▶</div>
            NeoTube
          </div>
        </div>
        <div className="flex-1 max-w-2xl px-4 flex justify-center">
          <div className="w-full max-w-[600px] flex items-center bg-[#121212] rounded-full px-4 py-2 border border-[#333333] focus-within:border-blue-500 focus-within:bg-black transition-colors">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm placeholder-gray-400 text-white" 
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button onClick={onUploadClick} className="p-2 hover:bg-gray-800 rounded-full" title="Upload Video"><Video size={24} /></button>
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
              ) : (
                <button className="p-2 hover:bg-gray-800 rounded-full"><User size={24} /></button>
              )}
              <button onClick={onSignOut} className="p-2 hover:bg-gray-800 rounded-full" title="Sign out"><LogOut size={20} /></button>
            </div>
          ) : (
            <button 
              onClick={onSignIn}
              className="flex items-center gap-2 border border-[#333333] hover:bg-gray-800 text-blue-500 px-3 py-1.5 rounded-full font-medium"
            >
              <User size={20} />
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Sidebar Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="w-64 bg-[#121212] h-full flex flex-col border-r border-[#333333] text-white shadow-2xl transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-6 py-3 border-b border-[#333333]">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-full text-white">
                <Menu size={24} />
              </button>
              <div className="font-bold text-xl flex items-center gap-1 cursor-pointer tracking-tight" onClick={() => { setIsMenuOpen(false); onHomeClick?.(); }}>
                <div className="bg-red-600 text-white p-1 rounded-lg mr-1 text-[10px] leading-3 flex items-center justify-center w-6 h-6">▶</div>
                NeoTube
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <button onClick={() => { setIsMenuOpen(false); onHomeClick?.(); }} className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-800 transition-colors">
                <Home size={22} className="text-gray-300" />
                <span className="font-medium text-[15px]">Home</span>
              </button>
              <button className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-800 transition-colors">
                <History size={22} className="text-gray-300" />
                <span className="font-medium text-[15px]">History</span>
              </button>
              <button className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-800 transition-colors">
                <Star size={22} className="text-gray-300" />
                <span className="font-medium text-[15px]">Favorites</span>
              </button>
              
              <div className="my-3 border-t border-[#333333]"></div>
              
              <button 
                onClick={() => { setIsMenuOpen(false); setShowPremiumModal(true); }}
                className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-800 transition-colors"
              >
                <Crown size={22} className="text-yellow-500" />
                <span className="font-medium text-[15px] text-yellow-500">Premium Plan</span>
              </button>
              
              <div className="my-3 border-t border-[#333333]"></div>

              <button className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-800 transition-colors">
                <Settings size={22} className="text-gray-300" />
                <span className="font-medium text-[15px]">Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Plan Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-3xl w-full max-w-lg p-8 relative shadow-2xl border border-[#333333] text-white">
            <button onClick={() => setShowPremiumModal(false)} className="absolute top-5 right-5 p-2 bg-[#1a1a1a] hover:bg-[#333333] rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/50">
                <Crown size={32} className="text-yellow-500" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-2 tracking-tight text-white">NeoTube Premium</h2>
            <p className="text-center text-gray-400 mb-8">Ad-free viewing, background play, and more.</p>
            
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 mb-6 hover:border-yellow-500/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white">Individual</h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-yellow-500">$11.99</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
              </div>
              <ul className="text-sm text-gray-400 space-y-2 mt-4">
                <li className="flex gap-2 items-center">✓ Ad-free viewing</li>
                <li className="flex gap-2 items-center">✓ Download to watch offline</li>
                <li className="flex gap-2 items-center">✓ Background play</li>
              </ul>
            </div>
            
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 mb-8 hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-white">Family</h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-500">$22.99</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">Add up to 5 family members</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex gap-2 items-center">✓ All Premium benefits included</li>
              </ul>
            </div>
            
            <button className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full transition-colors">
              Get Premium
            </button>
          </div>
        </div>
      )}
    </>
  );
};
