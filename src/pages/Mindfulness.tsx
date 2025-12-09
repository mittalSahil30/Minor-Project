import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind, CheckCircle2 } from 'lucide-react';
import type { Exercise } from '../types';

const EXERCISES: Exercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'A simple technique to slow down your breathing and reduce stress. Inhale, hold, exhale, hold for 4 seconds each.',
    durationSeconds: 60, // 1 minute default
    steps: ['Inhale (4s)', 'Hold (4s)', 'Exhale (4s)', 'Hold (4s)']
  },
  {
    id: '5-4-3-2-1',
    title: '5-4-3-2-1 Grounding',
    description: 'Acknowledge 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.',
    durationSeconds: 120,
    steps: ['Look around (5)', 'Touch things (4)', 'Listen (3)', 'Smell (2)', 'Taste (1)']
  },
  {
    id: 'body-scan',
    title: 'Quick Body Scan',
    description: 'Focus attention on different parts of your body, from toes to head, releasing tension.',
    durationSeconds: 180,
    steps: ['Focus on toes', 'Legs & Knees', 'Hips & Stomach', 'Chest & Arms', 'Neck & Head']
  }
];

const Mindfulness: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setTimeLeft(ex.durationSeconds);
    setIsActive(true);
    setCompleted(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (activeExercise) {
      setTimeLeft(activeExercise.durationSeconds);
      setIsActive(false);
      setCompleted(false);
    }
  };

  // Simple formatting for timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper to determine current step index roughly based on time elapsed
  const getCurrentStep = () => {
    if (!activeExercise) return "";
    const total = activeExercise.durationSeconds;
    const elapsed = total - timeLeft;
    const stepDuration = total / activeExercise.steps.length;
    const index = Math.min(Math.floor(elapsed / stepDuration), activeExercise.steps.length - 1);
    return activeExercise.steps[index];
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Mindfulness & Grounding</h2>
        <p className="text-slate-400">Take a moment to center yourself with these guided exercises.</p>
      </div>

      {!activeExercise ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXERCISES.map((ex) => (
            <div 
              key={ex.id}
              onClick={() => startExercise(ex)}
              className="bg-surface border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <Wind size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{ex.title}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">{ex.description}</p>
              <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                {Math.floor(ex.durationSeconds / 60)} min {ex.durationSeconds % 60 > 0 ? `${ex.durationSeconds % 60} sec` : ''}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveExercise(null)}
            className="mb-6 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to exercises
          </button>

          <div className="bg-surface border border-slate-700 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-white mb-2">{activeExercise.title}</h3>
              <p className="text-slate-400">{activeExercise.description}</p>
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-primary transition-all duration-1000 ease-linear"
                style={{
                  clipPath: `inset(0 0 0 0)` // In a real app, use SVG stroke-dashoffset for the ring progress
                }}
              ></div>
               {/* Just a simple visual circle for now */}
               <div className={`
                 w-56 h-56 rounded-full flex items-center justify-center flex-col
                 transition-all duration-1000
                 ${isActive ? 'bg-primary/10 scale-105' : 'bg-slate-800'}
                 ${completed ? 'bg-emerald-500/20' : ''}
               `}>
                 {completed ? (
                   <>
                     <CheckCircle2 size={64} className="text-emerald-500 mb-2" />
                     <span className="text-emerald-400 font-medium">Complete</span>
                   </>
                 ) : (
                   <>
                     <span className="text-5xl font-mono font-bold text-white tracking-wider">
                       {formatTime(timeLeft)}
                     </span>
                     {isActive && (
                       <span className="mt-4 text-indigo-300 font-medium animate-pulse">
                         {getCurrentStep()}
                       </span>
                     )}
                   </>
                 )}
               </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {!completed && (
                <button
                  onClick={toggleTimer}
                  className="w-16 h-16 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-primary/30"
                >
                  {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
              )}
              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mindfulness;