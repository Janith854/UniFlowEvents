function FoodMenu({ items, onAddToOrder }) {
    return (
        <div>
            <h2>Food Menu</h2>
            {items && items.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {items.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                            <span>{item.name} — Rs. {item.price}</span>
                            <button onClick={() => onAddToOrder(item)} style={{ background: '#457b9d', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.7rem', cursor: 'pointer' }}>Add</button>
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
