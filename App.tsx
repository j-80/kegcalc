
import React, { useState, useCallback } from 'react';
import { KegType, KEG_CONFIGS, CalculationResult } from './types';
import { getProductionInsights } from './services/geminiService';

const App: React.FC = () => {
  const [kegType, setKegType] = useState<KegType>(KegType.K20L);
  const [productAmount, setProductAmount] = useState<string>('');
  const [kegsMade, setKegsMade] = useState<string>('');
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const calculate = useCallback(async () => {
    const b = parseFloat(productAmount);
    const c = parseInt(kegsMade);

    if (isNaN(b) || isNaN(c) || b <= 0 || c < 0) {
      alert("Please enter valid numbers for product amount and kegs made.");
      return;
    }

    setIsCalculating(true);
    setInsight(null);

    const config = KEG_CONFIGS[kegType];
    const d = config.volume * c; // total litres filled
    const wasteLitres = b - d;
    const wastePercentage = (wasteLitres / b) * 100;
    
    const fullPallets = Math.floor(c / config.perPallet);
    const remainingKegs = c % config.perPallet;

    const newResult: CalculationResult = {
      filledLitres: d,
      wasteLitres,
      wastePercentage,
      fullPallets,
      remainingKegs,
      totalKegs: c,
      kegType,
      availableProduct: b,
      timestamp: Date.now()
    };

    setHistory(prev => [newResult, ...prev].slice(0, 10));
    
    try {
      const aiInsight = await getProductionInsights(newResult);
      setInsight(aiInsight);
    } catch (e) {
      setInsight("Calculation ready. Efficiency monitoring active.");
    } finally {
      setIsCalculating(false);
    }
  }, [kegType, productAmount, kegsMade]);

  const latestResult = history[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 touch-none">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 shadow-lg sticky top-0 z-10 safe-top">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex flex-col">
             <h1 className="text-xl font-black tracking-tight leading-none">KEGCALC</h1>
             <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">Production Analytics</span>
          </div>
          <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center border border-indigo-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 overflow-y-auto">
        {/* Input Card */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Keg Standard</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.values(KegType) as KegType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setKegType(type)}
                  className={`py-3 px-1 rounded-2xl text-xs font-bold transition-all border-2 active:scale-95 ${
                    kegType === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Total Product (L)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={productAmount}
                onChange={(e) => setProductAmount(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Kegs Filled (Count)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={kegsMade}
                onChange={(e) => setKegsMade(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-lg font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={isCalculating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 transform active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
          >
            {isCalculating ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span>Generate Analysis</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </>
            )}
          </button>
        </section>

        {/* Results Card */}
        {latestResult && (
          <section className="space-y-4 animate-in">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6 pb-0 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Yield (L)</p>
                  <p className="text-2xl font-black text-indigo-600">{latestResult.filledLitres}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Loss (L)</p>
                  <p className={`text-2xl font-black ${latestResult.wasteLitres > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {latestResult.wasteLitres.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-4">
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Efficiency Rating</p>
                       <p className="text-3xl font-black">{(100 - latestResult.wastePercentage).toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Waste Factor</p>
                       <p className="text-xl font-bold text-rose-300">{latestResult.wastePercentage.toFixed(2)}%</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4 bg-slate-800 h-2 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-1000 ${latestResult.wastePercentage > 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, 100 - latestResult.wastePercentage)}%` }}
                     ></div>
                  </div>
                </div>
              </div>

              {/* Pallet Logistics */}
              <div className="bg-indigo-50/50 p-6 border-t border-indigo-100">
                 <h3 className="text-[10px] font-black text-indigo-800 uppercase mb-4 tracking-[0.2em]">Pallet Logistics</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">P</div>
                      <div>
                        <p className="text-xl font-black text-indigo-900 leading-none">{latestResult.fullPallets}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Full Pallets</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">K</div>
                      <div>
                        <p className="text-xl font-black text-indigo-900 leading-none">{latestResult.remainingKegs}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Last Pallet</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* AI Insight Card */}
            {insight && (
              <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-white/20 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">AI Production Lead</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">"{insight}"</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
              </div>
            )}
          </section>
        )}

        {/* History List */}
        {history.length > 1 && (
          <section className="space-y-4 pt-4 pb-12">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Production History</h3>
            <div className="space-y-3">
              {history.slice(1).map((item) => (
                <div key={item.timestamp} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs">
                      {item.kegType.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.totalKegs} Kegs</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{item.filledLitres}L</p>
                    <p className={`text-[10px] font-bold ${item.wastePercentage > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.wastePercentage.toFixed(1)}% Loss
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white rounded-3xl py-3 px-8 flex justify-between items-center gap-12 shadow-2xl z-20 border border-white/10">
        <button className="text-indigo-400">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z"></path></svg>
        </button>
        <button className="text-slate-500 hover:text-indigo-400 transition-colors">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </button>
        <button className="text-slate-500 hover:text-indigo-400 transition-colors">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
        </button>
      </nav>
    </div>
  );
};

export default App;
