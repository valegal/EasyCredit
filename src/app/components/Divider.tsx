// components/Divider.tsx

import React from 'react';

interface DividerProps {
  continuationText: string;
}

const Divider: React.FC<DividerProps> = ({ continuationText }) => {
  return (
    <div className="flex items-center mt-4 mb-4">
      <div className="border-t border-gray-300 flex-grow"></div>
      <div className="mx-4 text-sm text-gray-500">{continuationText}</div>
      <div className="border-t border-gray-300 flex-grow"></div>
    </div>
  );
};

export default Divider;