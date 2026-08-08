import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KioskSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employee, action, time } = location.state || {};
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate('/kiosk', { replace: true });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  if (!employee) {
    navigate('/kiosk', { replace: true });
    return null;
  }

  const actionText = {
    'CLOCK_IN': 'Clocked In',
    'CLOCK_OUT': 'Clocked Out',
    'BREAK_START': 'Break Started',
    'BREAK_END': 'Break Ended'
  }[action] || 'Action';

  const timeString = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-[#111111]/80 backdrop-blur-3xl border border-emerald-500/30 p-10 rounded-[2rem] shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)] text-center relative overflow-hidden">
        {/* Subtle glow background inside */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </motion.div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-2 relative z-10"
        >
          {actionText} Successfully
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-mono text-emerald-400 font-semibold mb-8 relative z-10"
        >
          {timeString}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 text-left relative z-10 backdrop-blur-md"
        >
          <div className="w-20 h-20 bg-slate-800 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center border-2 border-emerald-500/20">
            {employee.profilePicture ? (
              <img src={employee.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-emerald-400">{employee.firstName?.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{employee.firstName} {employee.lastName}</p>
            <p className="text-sm text-muted-foreground font-mono">{employee.employeeId}</p>
            <p className="text-xs text-muted-foreground mt-1">{employee.designation} • {employee.department}</p>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-white/40 mt-8 relative z-10"
        >
          Returning to home screen in {countdown} seconds...
        </motion.p>
      </div>
    </motion.div>
  );
}
