import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} UniFlowEvents. All rights reserved.</p>
        <p>Built for campus engagement and event management.</p>
      </div>
    </footer>
  );
}

