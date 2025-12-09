import React from 'react';
import { Phone, ShieldAlert, HeartHandshake } from 'lucide-react';

const SOS: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Emergency Help</h2>
        <p className="text-red-200 mb-6">
          If you are in immediate danger or need urgent medical attention, please do not wait.
        </p>
        
        <a 
          href="tel:112"
          className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold py-4 px-12 rounded-full transition-transform hover:scale-105 shadow-lg shadow-red-600/30"
        >
          <Phone size={28} />
          Call 112
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface border border-slate-700 rounded-xl p-6 hover:border-slate-500 transition-colors">
          <div className="flex items-center gap-3 mb-3">
             <HeartHandshake className="text-emerald-400" />
             <h3 className="font-bold text-lg text-white">Mental Health Helpline</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">24/7 confidential support for people in distress.</p>
          <div className="text-xl font-mono font-semibold text-emerald-400">14416</div>
        </div>

        <div className="bg-surface border border-slate-700 rounded-xl p-6 hover:border-slate-500 transition-colors">
          <div className="flex items-center gap-3 mb-3">
             <Phone className="text-indigo-400" />
             <h3 className="font-bold text-lg text-white">Suicide Prevention</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">Free and confidential support for people in distress.</p>
          <div className="text-xl font-mono font-semibold text-indigo-400">9152987821</div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl text-center text-slate-400 text-sm">
        <p>Remember: Reaching out for help is a sign of strength, not weakness. You are not alone.</p>
      </div>
    </div>
  );
};

export default SOS;