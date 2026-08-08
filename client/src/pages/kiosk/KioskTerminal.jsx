import React, { useState } from 'react';
import api from '../../lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Delete } from 'lucide-react';

export default function KioskTerminal() {
  const [activeTab, setActiveTab] = useState('member'); // 'member' or 'staff'
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNumpadPress = (value) => {
    if (value === 'clear') {
      setIdentifier('');
    } else if (value === 'delete') {
      setIdentifier(prev => prev.slice(0, -1));
    } else if (value === 'enter') {
      handleCheckIn();
    } else {
      if (identifier.length < 15) {
        setIdentifier(prev => prev + value);
      }
    }
  };

  const handleCheckIn = async () => {
    if (!identifier) {
      toast({
        title: 'Error',
        description: 'Please enter a valid identifier.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = activeTab === 'member' 
        ? '/api/kiosk/member-checkin' 
        : '/api/kiosk/staff-checkin';
        
      const res = await api.post(endpoint, { identifier });
      
      toast({
        title: 'Check-in Successful',
        description: res.data?.message || 'You have successfully checked in.',
      });
      setIdentifier('');
    } catch (error) {
      toast({
        title: 'Check-in Failed',
        description: error.response?.data?.message || 'An error occurred during check-in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderNumpad = () => {
    const buttons = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      'Clear', '0', 'Enter'
    ];

    return (
      <div className="grid grid-cols-3 gap-6 mt-8 w-full max-w-md mx-auto">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (btn === 'Clear') handleNumpadPress('clear');
              else if (btn === 'Enter') handleNumpadPress('enter');
              else handleNumpadPress(btn);
            }}
            disabled={isLoading}
            className={`
              h-24 text-4xl font-semibold rounded-2xl flex items-center justify-center transition-colors active:scale-95 shadow-md
              ${btn === 'Enter' ? 'bg-blue-600 hover:bg-blue-700 text-white col-span-1 shadow-blue-900/50' 
                : btn === 'Clear' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'}
              ${isLoading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}
            `}
          >
            {btn === 'Enter' && isLoading ? <Loader2 className="w-10 h-10 animate-spin" /> : btn}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 font-sans selection:bg-blue-500/30 overflow-hidden z-50">
      <div className="w-full max-w-3xl text-center space-y-12">
        
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent pb-2">
            Atlas Fitness Check-in
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl">
            Welcome! Please select an option and enter your details.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900 p-2 rounded-3xl w-full max-w-2xl mx-auto border border-zinc-800 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('member');
              setIdentifier('');
            }}
            className={`flex-1 py-6 text-2xl font-semibold rounded-2xl transition-all duration-200 ${
              activeTab === 'member'
                ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Member Check-in
          </button>
          <button
            onClick={() => {
              setActiveTab('staff');
              setIdentifier('');
            }}
            className={`flex-1 py-6 text-2xl font-semibold rounded-2xl transition-all duration-200 ${
              activeTab === 'staff'
                ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Staff Check-in
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-4 w-full max-w-md mx-auto">
          <label className="block text-zinc-400 text-lg font-medium uppercase tracking-wider text-center">
            {activeTab === 'member' ? 'Mobile Number or Member ID' : 'Staff ID or PIN'}
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={identifier}
              placeholder="Enter your ID..."
              className="w-full bg-zinc-900 border-2 border-zinc-700 rounded-2xl py-8 px-6 text-5xl text-center font-bold tracking-widest text-white shadow-inner focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600 placeholder:text-3xl placeholder:font-normal placeholder:tracking-normal"
            />
            {identifier.length > 0 && (
              <button 
                onClick={() => handleNumpadPress('delete')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-2 transition-colors"
                disabled={isLoading}
              >
                <Delete className="w-10 h-10" />
              </button>
            )}
          </div>
        </div>

        {/* Numpad */}
        {renderNumpad()}

      </div>
    </div>
  );
}
