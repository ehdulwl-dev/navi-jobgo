
import React from 'react';
import { Sparkles, List } from 'lucide-react';

interface JobToggleProps {
  activeTab: 'recommended' | 'all';
  setActiveTab: (tab: 'recommended' | 'all') => void;
}

const JobToggle: React.FC<JobToggleProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex w-full max-w-xl mx-auto my-4 justify-center">
      <button
        onClick={() => setActiveTab('recommended')}
        className={`flex items-center justify-center gap-2 py-2 flex-1 rounded-l-full text-sm font-medium ${
          activeTab === 'recommended'
            ? 'bg-app-blue text-white'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        <Sparkles size={16} />
        <span>추천 구직 공고</span>
      </button>
      <button
        onClick={() => setActiveTab('all')}
        className={`flex items-center justify-center gap-2 py-2 flex-1 rounded-r-full text-sm font-medium ${
          activeTab === 'all'
            ? 'bg-app-blue text-white'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        <List size={16} />
        <span>전체 구직 공고</span>
      </button>
    </div>
  );
};

export default JobToggle;
