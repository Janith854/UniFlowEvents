import React from 'react';
import { Navbar } from '../components/Navbar';
import { FoodMenu } from '../components/FoodMenu';

export function FoodPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Event Food Options
          </h1>
          <FoodMenu />
        </div>
      </main>
    </div>
  );
}

