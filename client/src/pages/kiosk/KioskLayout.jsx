import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '../../store/useKioskStore';
import { Clock, WifiOff, XCircle, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OfflineSyncManager from './OfflineSyncManager';

export default function KioskLayout() {
  const { kioskToken, deviceName, branch, clearSession } = useKioskStore();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPin, setExitPin] = useState('');
  const { toast } = useToast();

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('kiosk-theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('kiosk-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  // Update clock every minute
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Redirect to admin if not authenticated
  React.useEffect(() => {
    if (!kioskToken) {
      navigate('/attendance');
    }
  }, [kioskToken, navigate]);

  const handleExit = () => {
    // In production, verify against KioskDevice.managerExitPin via API
    // For now, hardcode a simple exit pin or check the API.
    if (exitPin === '1234' || exitPin === '9999') {
      clearSession();
      toast({ title: 'Kiosk Exited', description: 'Session cleared successfully' });
      navigate('/attendance');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid Manager PIN' });
      setExitPin('');
    }
  };

  if (!kioskToken) return null;

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background dark:bg-[#0a0a0a] text-foreground dark:text-slate-50 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden relative transition-colors duration-500">
        {/* Dynamic Animated Premium Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px]"
          />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-900/20 blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Top Bar */}
      <header className="h-20 px-8 border-b border-border/50 dark:border-white/5 flex items-center justify-between bg-card/70 dark:bg-black/40 backdrop-blur-2xl shrink-0 z-10 transition-colors duration-500 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            A
          </div>
          <div>
            <h1 className="font-semibold text-foreground dark:text-slate-100 transition-colors">Atlas Kiosk Portal</h1>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground transition-colors">
              {branch || 'Main Branch'} • {deviceName || 'Reception'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {!navigator.onLine && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
              <WifiOff className="h-4 w-4" />
              Offline Mode
            </div>
          )}
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-full bg-slate-200/50 dark:bg-card/5 text-slate-600 dark:text-foreground hover:bg-slate-300/50 dark:hover:bg-card/10 transition-all active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Hidden Exit Button - Double Click to Trigger */}
          <button 
            onDoubleClick={() => setShowExitModal(true)}
            className="w-10 h-10 rounded-full opacity-0 hover:opacity-10 transition-opacity bg-card dark:bg-card"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative z-10 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      {/* Exit Kiosk Modal (Manager Only) */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-card dark:bg-[#111111] border border-border dark:border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-foreground dark:text-slate-100">Exit Kiosk</h3>
                <button onClick={() => setShowExitModal(false)} className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6 transition-colors">Enter Manager PIN to close the kiosk session.</p>
              
              <input 
                type="password"
                value={exitPin}
                onChange={e => setExitPin(e.target.value)}
                placeholder="Manager PIN"
                className="w-full bg-background dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-6 transition-all"
                autoFocus
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-white/10 text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-card/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleExit}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Exit Kiosk
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <OfflineSyncManager />
      </div>
    </div>
  );
}
