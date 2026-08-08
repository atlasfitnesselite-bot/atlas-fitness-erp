import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, Coffee, ArrowLeft, CheckCircle2, Circle, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useKioskStore } from '../../store/useKioskStore';

export default function KioskHome() {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1: EmpID, 2: PIN, 3: Action
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedEmployee = employees.find(e => e.employeeId === employeeId);
  const navigate = useNavigate();
  const { kioskToken, queueOfflineAction } = useKioskStore();
  const { toast } = useToast();

  useEffect(() => {
    if (kioskToken) {
      fetch('/api/attendance/kiosk-employees', {
        headers: { Authorization: `Bearer ${kioskToken}` }
      })
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
    }
  }, [kioskToken]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  const handleKeyPress = (key) => {
    if (step === 2) {
      if (pin.length < 4) setPin(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    if (step === 2) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (step === 1 && employeeId) {
      setStep(2);
    } else if (step === 2 && pin.length >= 4) {
      setStep(3);
    }
  };

  const handleAction = async (actionType) => {
    setIsLoading(true);
    
    // Setup API call headers explicitly for Kiosk
    const config = {
      headers: { Authorization: `Bearer ${kioskToken}` }
    };
    
    let finalEmpId = employeeId;
    if (!finalEmpId.startsWith('EMP-') && finalEmpId.length > 0) {
      // Auto pad with zeros if they just typed 1 or 2 etc, actually let's just prepend EMP-
      // If they type 001 it becomes EMP-001. If they type 1, it becomes EMP-1 (might fail).
      // Assuming they type 001.
      finalEmpId = 'EMP-' + finalEmpId;
    }
    
    const payload = { employeeId: finalEmpId, pin, method: 'PIN', device: 'Kiosk', location: 'Reception' };
    
    try {
      let endpoint = '';
      if (actionType === 'CLOCK_IN') endpoint = '/attendance/check-in';
      if (actionType === 'CLOCK_OUT') endpoint = '/attendance/check-out';
      if (actionType === 'BREAK_START') endpoint = '/attendance/break-start';
      if (actionType === 'BREAK_END') endpoint = '/attendance/break-end';

      if (!navigator.onLine) {
        // Offline Sync implementation
        queueOfflineAction({ endpoint, payload, timestamp: new Date().toISOString() });
        toast({ title: 'Offline Mode', description: `${actionType.replace('_', ' ')} queued` });
        resetState();
        return;
      }

      const res = await api('/api' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${kioskToken}`
        },
        data: { employeeId: enteredPin, action }
      });
      
      if (!res.data) {
        const errorData = res.data.catch(() => ({}));
        const error = new Error(errorData.message || 'Action failed. Check credentials.');
        error.response = { status: res.status, data: errorData };
        throw error;
      }
      
      const data = res.data;
      
      // Navigate to success screen
      navigate('/kiosk/success', { 
        state: { 
          employee: data.employee, 
          action: actionType, 
          time: data.time 
        } 
      });
      
    } catch (error) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.response?.data?.message || 'Check credentials' });
      if (error.response?.status === 400 || error.response?.status === 401) {
         setPin('');
         setStep(2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setEmployeeId('');
    setPin('');
    setStep(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center"
    >
      {/* Time & Greeting Section */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl font-light tracking-tight text-foreground dark:text-white mb-2 font-sans transition-colors"
        >
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-medium text-slate-600 dark:text-foreground transition-colors"
        >
          {getGreeting()}, Team!
        </motion.h2>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center gap-4 mb-10 w-full max-w-sm">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${step >= s ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]' : 'border-slate-300 dark:border-slate-700 bg-card dark:bg-transparent text-muted-foreground dark:text-slate-600'}`}>
              {step > s ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-semibold">{s}</span>}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step > s ? 'bg-indigo-500/50' : 'bg-slate-200 dark:bg-slate-800'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full max-w-md bg-card dark:bg-[#161b22] border border-border dark:border-slate-700/60 p-8 rounded-[2rem] shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-500">
        
        {/* Step Instructions */}
        <div className="text-center mb-6">
          {step > 1 && selectedEmployee && (
            <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10">
              {selectedEmployee.profilePicture ? (
                <img src={selectedEmployee.profilePicture} alt={selectedEmployee.firstName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 m-4 text-indigo-400" />
              )}
            </div>
          )}
          <h3 className="text-xl font-semibold text-foreground dark:text-white mb-1 transition-colors">
            {step === 1 ? 'Select Your Profile' : step === 2 ? `Welcome back, ${selectedEmployee?.firstName || employeeId}` : `Ready, ${selectedEmployee?.firstName || employeeId}?`}
          </h3>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground transition-colors">
            {step === 1 ? 'Search or select your name from the list below.' : step === 2 ? 'Please enter your 4-digit security PIN.' : 'What would you like to do?'}
          </p>
        </div>

        {step === 1 && (
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-8 relative z-10 w-full"
          >
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background dark:bg-[#0d1117] border border-border dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
              />
            </div>
            
            <div className="bg-background dark:bg-[#0d1117] border border-border dark:border-slate-700 rounded-2xl p-2 max-h-60 overflow-y-auto shadow-inner custom-scrollbar">
              {employees
                .filter(emp => 
                  emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setEmployeeId(emp.employeeId);
                    setStep(2);
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-card dark:hover:bg-[#21262d] border border-transparent hover:border-border dark:hover:border-slate-700/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden border border-indigo-200 dark:border-indigo-500/30">
                    {emp.profilePicture ? (
                      <img src={emp.profilePicture} alt={emp.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {emp.firstName} {emp.lastName}
                    </h4>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground font-mono">
                      {emp.employeeId} • {emp.designation?.name || 'Staff'}
                    </p>
                  </div>
                </button>
              ))}
              {employees.length === 0 && (
                 <div className="p-4 text-center text-muted-foreground text-sm">Loading employees...</div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-8 relative z-10"
          >
            <div className="bg-background dark:bg-[#0d1117] border border-border dark:border-slate-700 rounded-2xl p-4 text-center shadow-inner transition-colors">
              <div className="text-4xl font-mono tracking-widest text-foreground dark:text-white h-12 flex items-center justify-center transition-colors">
                 <span className="tracking-[0.5em]">{'*'.repeat(pin.length) || <span className="text-foreground dark:text-slate-600">****</span>}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons (Step 3) */}
        <AnimatePresence mode="wait">
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 gap-4 relative z-10"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('CLOCK_IN')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-2xl transition-all shadow-sm hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]"
            >
              <LogIn className="w-8 h-8" />
              <span className="font-semibold">Clock In</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('CLOCK_OUT')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-200 dark:border-rose-500/30 rounded-2xl transition-all shadow-sm hover:shadow-[0_8px_30px_rgb(244,63,94,0.12)]"
            >
              <LogOut className="w-8 h-8" />
              <span className="font-semibold">Clock Out</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('BREAK_START')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-500/30 rounded-2xl transition-all shadow-sm hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)]"
            >
              <Coffee className="w-8 h-8" />
              <span className="font-semibold">Start Break</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('BREAK_END')}
              disabled={isLoading}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-500/30 rounded-2xl transition-all shadow-sm hover:shadow-[0_8px_30px_rgb(99,102,241,0.12)]"
            >
              <ArrowLeft className="w-8 h-8" />
              <span className="font-semibold">End Break</span>
            </motion.button>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Numpad (Step 1 & 2) */}
        <AnimatePresence mode="wait">
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-3 gap-3 relative z-10"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="h-16 text-2xl font-medium bg-background hover:bg-card dark:bg-[#21262d] dark:hover:bg-[#30363d] border border-border dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-2xl transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] hover:shadow-lg dark:shadow-sm"
              >
                {num}
              </motion.button>
            ))}
            <div />
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress('0')}
              className="h-16 text-2xl font-medium bg-background hover:bg-card dark:bg-[#21262d] dark:hover:bg-[#30363d] border border-border dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-2xl transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] hover:shadow-lg dark:shadow-sm"
            >
              0
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackspace}
              className="h-16 text-2xl font-medium bg-background hover:bg-rose-50 dark:bg-[#21262d] dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-border dark:border-slate-700/50 text-muted-foreground dark:text-muted-foreground rounded-2xl flex items-center justify-center transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] hover:shadow-lg dark:shadow-sm"
            >
              ⌫
            </motion.button>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between relative z-10 border-t border-slate-100 dark:border-border pt-6 transition-colors">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : resetState()}
            className="px-6 py-2.5 text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {step > 1 ? 'Back' : 'Clear'}
          </button>
          
          {step === 2 && (
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-10 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30"
            >
              Next
            </motion.button>
          )}
          
          {step === 3 && (
            <button 
              onClick={resetState}
              className="px-8 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors shadow-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
