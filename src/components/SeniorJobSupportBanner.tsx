
import React from 'react';

const SeniorJobSupportBanner: React.FC = () => {
  return (
    <div className="mb-2 mt-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <img
        src="/homebanner.png"
        alt="홈 배너"
        className="w-full h-[180px] object-cover"
      />
    </div>
  );
};

export default SeniorJobSupportBanner;
