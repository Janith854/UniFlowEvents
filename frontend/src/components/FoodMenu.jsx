import React from 'react';

const mockItems = [
  { id: '1', name: 'Gourmet Burger', price: 350 },
  { id: '2', name: 'Caesar Salad', price: 250 },
  { id: '3', name: 'Margherita Pizza', price: 150 }
];

export function FoodMenu({ items, onAddToOrder, showActions = false }) {
  const displayItems = items && items.length > 0 ? items : mockItems;

  return (
    <div className="space-y-3">
      {displayItems.map((item, idx) => (
        <div
          key={item.id || idx}
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
              Rs. {item.price.toFixed(2)}
            </span>
            {showActions && (
              <button 
                onClick={() => onAddToOrder && onAddToOrder(item)}
                className="text-sm bg-amber-400 text-zinc-950 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                Add
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FoodMenu;
