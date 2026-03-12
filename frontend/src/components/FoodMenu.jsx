
function FoodMenu({ items, onAddToOrder }) {
  return (
    <div>
      <h2>Food Menu</h2>
      {items && items.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <span>{item.name} — Rs. {item.price}</span>
              <button onClick={() => onAddToOrder(item)} style={{ background: '#457b9d', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.7rem', cursor: 'pointer' }}>
                Add
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No menu items available.</p>
      )}
    </div>
  );
}

export default FoodMenu;

import React from 'react';

const mockItems = [
  { id: '1', name: 'Gourmet Burger', price: 12.99 },
  { id: '2', name: 'Caesar Salad', price: 8.99 },
  { id: '3', name: 'Margherita Pizza', price: 14.99 }
];

export function FoodMenu({ showActions = false }) {
  return (
    <div className="space-y-3">
      {mockItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
        >
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">
              Delicious option for your next event.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-500">
              ${item.price.toFixed(2)}
            </span>
            {showActions && (
              <button className="text-sm bg-amber-400 text-zinc-950 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                Add
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

