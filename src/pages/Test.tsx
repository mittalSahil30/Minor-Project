import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import type { MentalHealthResult } from '../types';
import { ClipboardCheck, CheckCircle, AlertTriangle } from 'lucide-react';

// Simplified GAD-7 style questions
const QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const OPTIONS = [
  { label: "Not at all", score: 0 },
  { label: "Several days", score: 1 },
  { label: "More than half the days", score: 2 },
  { label: "Nearly every day", score: 3 }
];

const Test: React.FC = () => {
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [result, setResult] = useState<MentalHealthResult | null>(null);

  const handleSelect = (questionIndex: number, score: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = score;
    setAnswers(newAnswers);
  };

  const calculateResult = () => {
    if (answers.includes(-1)) return; // Should not happen due to button disabled state

    const totalScore = answers.reduce((a, b) => a + b, 0);
    let interpretation = "";

    if (totalScore <= 4) interpretation = "Minimal anxiety";
    else if (totalScore <= 9) interpretation = "Mild anxiety";
    else if (totalScore <= 14) interpretation = "Moderate anxiety";
    else interpretation = "Severe anxiety";

    const user = StorageService.getCurrentUser();
    if (user) {
      const newResult: MentalHealthResult = {
        id: crypto.randomUUID(),
        userId: user.id,
        date: new Date().toISOString(),
        score: totalScore,
        interpretation
      };
      StorageService.saveTestResult(user.id, newResult);
      setResult(newResult);
    }
  };

  const reset = () => {
    setAnswers(new Array(QUESTIONS.length).fill(-1));
    setResult(null);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-surface border border-slate-700 rounded-2xl p-10 shadow-xl">
          <div className="inline-block p-4 rounded-full bg-indigo-500/20 mb-6">
            <ClipboardCheck size={48} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete</h2>
          <p className="text-slate-400 mb-8">Based on your responses:</p>
          
          <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800">
            <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-2">Score Interpretation</p>
            <h3 className={`text-2xl font-bold ${result.score > 9 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {result.interpretation}
            </h3>
            <p className="text-slate-500 mt-2">Score: {result.score} / 21</p>
          </div>

          {result.score > 9 && (
            <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg text-left mb-8 flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" />
              <p className="text-amber-200 text-sm">
                Your score suggests you may be experiencing anxiety symptoms. Consider discussing this result with a healthcare professional. Use the Chatbot or SOS page for immediate support.
              </p>
            </div>
          )}

          <button
            onClick={reset}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl transition-colors font-medium"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  const isComplete = !answers.includes(-1);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Mental Health Check-in</h2>
        <p className="text-slate-400">
          Over the last 2 weeks, how often have you been bothered by the following problems?
        </p>
      </div>

      <div className="space-y-6">
        {QUESTIONS.map((question, qIdx) => (
          <div key={qIdx} className="bg-surface border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">{qIdx + 1}. {question}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => handleSelect(qIdx, opt.score)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all border
                    ${answers[qIdx] === opt.score
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-white'}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <button
            onClick={calculateResult}
            disabled={!isComplete}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all
              ${isComplete 
                ? 'bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
            `}
          >
            <CheckCircle size={20} />
            Evaluate Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;