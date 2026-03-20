import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { FoodMenu } from '../components/FoodMenu';
import { createFoodOrder } from '../services/foodService';
import { useAuth } from '../context/AuthContext';

const SAMPLE_MENU = [
    { id: '1', name: 'Gourmet Burger', price: 350 },
    { id: '2', name: 'Caesar Salad', price: 250 },
    { id: '3', name: 'Margherita Pizza', price: 150 },
    { id: '4', name: 'Soft Drink', price: 100 },
];

export function FoodPreOrder() {
    const { user } = useAuth();
    const [order, setOrder] = useState([]);
    const [message, setMessage] = useState('');

    const handleAddToOrder = (item) => {
        setOrder(prev => {
            const existing = prev.find(o => o.name === item.name);
            if (existing) {
                return prev.map(o => o.name === item.name ? { ...o, quantity: o.quantity + 1 } : o);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleSubmit = async () => {
        if (!order.length) return;
        try {
            await createFoodOrder({ user: user?.id, items: order, totalAmount: total });
            setMessage('Order placed successfully!');
            setOrder([]);
        } catch {
            setMessage('Failed to place order.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <Navbar />
            <main className="pt-24 px-4">
                <div className="w-full max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Pre-order Food
                        </h1>
                        <p className="text-gray-600">
                            Select your items in advance so everything is ready when you arrive.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <FoodMenu items={SAMPLE_MENU} onAddToOrder={handleAddToOrder} showActions />
                        </div>

                        <div className="md:col-span-1">
                            {order.length > 0 ? (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Order</h3>
                                    <div className="space-y-3 mb-6">
                                        {order.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-gray-700">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center text-lg font-bold text-gray-900">
                                        <span>Total:</span>
                                        <span>Rs. {total.toFixed(2)}</span>
                                    </div>
                                    <button 
                                        onClick={handleSubmit} 
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
                                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Your Order</h3>
                                    <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
                                </div>
                            )}
                            {message && (
                                <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    <p className="font-medium">{message}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FoodPreOrder;
