import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { analyzeSentiment, getCollectiveMood } from '../services/sentiment';
import type { JournalEntry, User } from '../types';
import { Plus, Sparkles, Calendar, Book, BarChart3 } from 'lucide-react';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Collective Mood
  const [collectiveMood, setCollectiveMood] = useState('Neutral');

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const userJournals = StorageService.getJournals(currentUser.id);
      setEntries(userJournals);
      setCollectiveMood(getCollectiveMood(userJournals));
    }
  }, []);

  const handleSaveAndAnalyze = async () => {
    if (!user || !title.trim() || !content.trim()) return;

    setIsAnalyzing(true);

    // Analyze using Hugging Face Model (SamLowe/roberta-base-go_emotions)
    const emotions = await analyzeSentiment(content);

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      userId: user.id,
      title,
      content,
      timestamp: Date.now(),
      emotions: emotions,
      isAnalyzed: true
    };

    StorageService.saveJournal(user.id, newEntry);
    
    // Update local state (newest first)
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    setCollectiveMood(getCollectiveMood(updatedEntries));
    
    // Reset form
    setTitle('');
    setContent('');
    setIsCreating(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Mood Journal</h2>
          <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
             <BarChart3 size={16} className="text-indigo-400" />
             <span>Collective Mood (Last 7 Entries): <span className="text-emerald-400 font-medium border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">{collectiveMood}</span></span>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
        >
          {isCreating ? 'Cancel' : <><Plus size={18} /> New Entry</>}
        </button>
      </div>

      {/* Creator */}
      {isCreating && (
        <div className="bg-surface border border-slate-700 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title of your entry..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="How are you feeling today? Write your thoughts..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAndAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-wait"
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Save & Analyze
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-right mt-1">
              *Analysis powered by roberta-base head trained on go_emotions dataset.
            </p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid gap-6">
        {entries.length === 0 && !isCreating && (
          <div className="text-center py-12 text-slate-500 bg-surface/50 rounded-xl border border-slate-800">
            <Book size={48} className="mx-auto mb-4 opacity-50" />
            <p>Your journal is empty. Start writing to track your emotional journey.</p>
          </div>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="bg-surface border border-slate-700 rounded-xl p-6 shadow-md hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{entry.title}</h3>
                <div className="flex items-center text-sm text-slate-400 gap-2">
                  <Calendar size={14} />
                  {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-4 font-light">
              {entry.content}
            </div>

            {entry.emotions && entry.emotions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles size={12} /> Detected Emotions:
                </span>
                {entry.emotions.map((emo, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize"
                  >
                    {emo}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;