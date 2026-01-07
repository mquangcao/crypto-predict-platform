import React from 'react';

export function LoadingScreen() {
  const shimmerStyle: React.CSSProperties = {
    width: '200px',
    height: '20px',
    borderRadius: '10px',
    background: 'linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={shimmerStyle} />
      </div>
    </>
  );
}
