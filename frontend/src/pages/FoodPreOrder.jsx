import React from 'react';
import { Navbar } from '../components/Navbar';
import { FoodMenu } from '../components/FoodMenu';

export function FoodPreOrder() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pre-order Food
          </h1>
          <p className="text-gray-600 mb-6">
            Select your items in advance so everything is ready when you arrive.
          </p>
          <FoodMenu showActions />
        </div>
      </main>
    </div>
  );
}

