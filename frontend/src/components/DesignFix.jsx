import { useState } from 'react';
import './DesignFix.css';
import { ShaderBackground, PulsingCircle } from './ui/shaders-hero-section';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function DesignFix() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      // store the result in sessionStorage and navigate to results page
      try {
        sessionStorage.setItem('designfix_last_result', JSON.stringify(data));
        // navigate to /results
        window.history.pushState({}, '', '/results');
        // dispatch popstate so App.jsx can react to path change
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (e) {
        console.warn('Failed to store analysis result in sessionStorage', e);
        setError('Analysis completed but failed to navigate to results. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze website. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShaderBackground>
      <PulsingCircle />
      
      {/* Main Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          
          {/* Header Text */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
              <span className="font-medium italic">Analyze</span> Your Website
            </h1>
            <p className="text-base text-white/80">
              Get instant AI-powered design recommendations
            </p>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleAnalyze} className="mb-4">
              <div className="flex gap-3 backdrop-blur-md bg-white/10 p-3 rounded-2xl border border-white/20">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., example.com)"
                  className="flex-1 bg-white/90 text-gray-900 px-6 py-4 rounded-xl border-none outline-none text-lg placeholder:text-gray-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg transition-all duration-200 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl text-white text-center">
                  {error}
                </div>
              )}
            </form>
        </div>
      </div>
    </ShaderBackground>
  );
}

export default DesignFix;
