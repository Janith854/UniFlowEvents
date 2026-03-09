import { useState } from 'react';
import FoodMenu from '../components/FoodMenu';
import { createFoodOrder } from '../services/foodService';
import { useAuth } from '../context/AuthContext';

const SAMPLE_MENU = [
    { name: 'Burger', price: 350 },
    { name: 'Pizza Slice', price: 250 },
    { name: 'French Fries', price: 150 },
    { name: 'Soft Drink', price: 100 },
];

function FoodPreOrder() {
    const { user } = useAuth();
    const [order, setOrder] = useState([]);
    const [message, setMessage] = useState('');

    const handleAddToOrder = (item) => {
        setOrder(prev => {
            const existing = prev.find(o => o.name === item.name);
            if (existing) return prev.map(o => o.name === item.name ? { ...o, quantity: o.quantity + 1 } : o);
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
        <div style={{ padding: '2rem' }}>
            <h1>Food Pre-Order</h1>
            <FoodMenu items={SAMPLE_MENU} onAddToOrder={handleAddToOrder} />
            {order.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>Your Order</h3>
                    {order.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>Rs. {item.price * item.quantity}</span>
                        </div>
                    ))}
                    <hr />
                    <strong>Total: Rs. {total}</strong>
                    <button onClick={handleSubmit} style={{ display: 'block', marginTop: '1rem', padding: '0.7rem 1.5rem', background: '#457b9d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Place Order</button>
                </div>
            )}
            {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
        </div>
    );
}
export default FoodPreOrder;
