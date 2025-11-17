import { useEffect, useState } from 'react';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { 
  Type, 
  Palette, 
  Layout, 
  Zap, 
  Eye, 
  Accessibility,
  Layers,
  AlignLeft
} from 'lucide-react';

// Map category names to icons
const categoryIcons = {
  'Typography': Type,
  'Color': Palette,
  'Layout': Layout,
  'Spacing': Layers,
  'Buttons': Zap,
  'Accessibility': Accessibility,
  'Design': Eye,
  'Content': AlignLeft,
};

export default function Results() {
  const [timelineData, setTimelineData] = useState([]);
  const [analysisUrl, setAnalysisUrl] = useState('');

  useEffect(() => {
    // Get analysis results from sessionStorage
    const storedResult = sessionStorage.getItem('designfix_last_result');
    
    if (!storedResult) {
      return;
    }

    try {
      const result = JSON.parse(storedResult);
      setAnalysisUrl(result.url || '');

      // Transform suggestions into timeline format
      const transformedData = result.suggestions?.map((suggestion, index) => {
        // Calculate energy/impact based on priority
        const energyMap = {
          'High': 90,
          'Medium': 60,
          'Low': 35,
        };

        // Find related suggestions (same category or similar priority)
        const relatedIds = result.suggestions
          .map((s, i) => {
            if (i === index) return null;
            if (s.category === suggestion.category) return i + 1;
            if (s.priority === suggestion.priority && Math.random() > 0.5) return i + 1;
            return null;
          })
          .filter(id => id !== null);

        return {
          id: index + 1,
          category: suggestion.category || 'Design',
          issue: suggestion.issue,
          suggestion: suggestion.suggestion,
          priority: suggestion.priority || 'Medium',
          icon: categoryIcons[suggestion.category] || Eye,
          relatedIds: relatedIds.slice(0, 3), // Max 3 related items
          energy: energyMap[suggestion.priority] || 50,
        };
      }) || [];

      setTimelineData(transformedData);
    } catch (error) {
      console.error('Error parsing analysis result:', error);
    }
  }, []);

  const handleNew = () => {
    sessionStorage.removeItem('designfix_last_result');
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (timelineData.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-white via-white/90 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Design Analysis Results
            </h1>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Analyzed:</span>{' '}
              <a 
                href={analysisUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                {analysisUrl}
              </a>
            </p>
          </div>
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Orbital Timeline */}
      <RadialOrbitalTimeline timelineData={timelineData} />

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Click on any node</span> to view detailed suggestions • 
            <span className="font-semibold"> Related issues</span> will pulse to show connections
          </p>
        </div>
      </div>
    </div>
  );
}
