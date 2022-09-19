import React from 'react';
import Loader from '@/components/Icons/Loader';

const LoadingPage: React.FC = () => {
  return (
    <div className="center-wrapper">
      <div className="center-content w-5">
        <Loader />
      </div>
    </div>
  );
};

export default LoadingPage;
