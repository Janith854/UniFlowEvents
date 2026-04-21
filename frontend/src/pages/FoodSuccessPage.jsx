import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { QRCodeCanvas } from 'qrcode.react';
import { confirmPayment } from '../services/foodService';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function FoodSuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const qrRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID found.');
            setLoading(false);
            return;
        }

        const verifyPayment = async () => {
            try {
                const res = await confirmPayment({ sessionId });
                setOrder(res.data.order);
                toast.success('Payment verified successfully!');
                
                // Clear the food cart since order is paid
                localStorage.removeItem('uniflow_food_cart');
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.msg || 'Failed to verify payment.');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [sessionId]);

    const downloadOrderPass = async (orderData) => {
        try {
            const { qr, pickup, items } = orderData;
            
            const container = document.createElement('div');
            container.style.cssText = `
                position: fixed; top: -9999px; left: -9999px;
                width: 480px; padding: 48px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 24px;
                font-family: Inter, system-ui, sans-serif;
                display: flex; flex-direction: column; align-items: center;
                text-align: center; box-sizing: border-box;
            `;
            document.body.appendChild(container);

            const h2 = document.createElement('h2');
            h2.textContent = '🎉 Order Successful!';
            h2.style.cssText = 'font-size: 28px; font-weight: 900; color: #15803d; margin: 0 0 12px 0;';
            container.appendChild(h2);

            const subtitle = document.createElement('p');
            subtitle.textContent = `Present this QR code at your selected pickup slot (${pickup}).`;
            subtitle.style.cssText = 'font-size: 15px; color: #374151; margin: 0 0 24px 0; font-weight: 500;';
            container.appendChild(subtitle);

            const qrWrapper = document.createElement('div');
            qrWrapper.style.cssText = 'background: #ffffff; padding: 20px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 24px; display: inline-block;';
            container.appendChild(qrWrapper);

            const onScreenQRCanvas = qrRef.current?.querySelector?.('canvas') || qrRef.current;
            if (onScreenQRCanvas && onScreenQRCanvas.toDataURL) {
                const qrImg = document.createElement('img');
                qrImg.src = onScreenQRCanvas.toDataURL('image/png');
                qrImg.style.cssText = 'width: 200px; height: 200px; display: block;';
                qrWrapper.appendChild(qrImg);
            }

            const instructionBox = document.createElement('div');
            instructionBox.style.cssText = 'width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px 20px; text-align: left; margin-top: 8px;';
            const stallTitle = document.createElement('h3');
            stallTitle.textContent = 'Food Court Pickup Instructions:';
            stallTitle.style.cssText = 'font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;';
            instructionBox.appendChild(stallTitle);

            const stalls = [...new Set(items.map(i => i.stallNumber))];
            stalls.forEach(stall => {
                const stallItems = items.filter(i => i.stallNumber === stall);
                const li = document.createElement('p');
                li.innerHTML = `<strong style="color:#d97706;">* ${stall}:</strong> ${stallItems.map(i => `${i.quantity}x ${i.name}`).join(', ')} <em style="color:#9ca3af;">(Pickup: ${pickup})</em>`;
                li.style.cssText = 'font-size: 13px; color: #1f2937; margin: 6px 0;';
                instructionBox.appendChild(li);
            });
            container.appendChild(instructionBox);

            const footer = document.createElement('p');
            footer.textContent = '🌐 UniFlow Events';
            footer.style.cssText = 'font-size: 12px; color: #9ca3af; margin-top: 20px; font-weight: 600;';
            container.appendChild(footer);

            const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#f0fdf4' });
            document.body.removeChild(container);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgH = (canvas.height * pdfWidth) / canvas.width;
            const marginTop = (pdf.internal.pageSize.getHeight() - imgH) / 2;
            pdf.addImage(imgData, 'PNG', 0, Math.max(0, marginTop), pdfWidth, imgH);
            pdf.save(`UniFlow_FoodPass_${Date.now()}.pdf`);
        } catch (err) {
            console.error('Failed to generate PDF pass:', err);
        }
    };

    useEffect(() => {
        if (order && !loading) {
            const timer = setTimeout(() => {
                downloadOrderPass({ qr: order.qrString, pickup: order.pickupSlot, items: order.items });
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [order, loading]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 text-zinc-950 font-sans">
                <Navbar />
                <main className="pt-32 px-4 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Verifying payment securely...</p>
                </main>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 text-zinc-950 font-sans">
                <Navbar />
                <main className="pt-32 px-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-red-100 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black">!</div>
                        <h2 className="text-2xl font-black text-zinc-950 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-8">{error}</p>
                        <Link to="/food" className="bg-zinc-950 text-white font-black py-4 px-8 rounded-2xl hover:bg-zinc-900 transition-all inline-block">Return to  Menu</Link>
                    </div>
                </main>
            </div>
        );
    }

    const { qrString, pickupSlot, items, totalAmount } = order;
    
    // Derived states similar to FoodPage
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const avgEcoScore = totalItems === 0 ? 0 : Math.round(items.reduce((sum, item) => sum + (item.ecoScore || 50) * item.quantity, 0) / totalItems);
    const rewardEligible = totalAmount > 2000;
    const ecoVoucher = avgEcoScore === 100;

    return (
        <div className="min-h-screen bg-gray-50 text-zinc-950 font-sans">
            <Navbar />
            <main className="pt-24 px-4 pb-16 flex flex-col items-center justify-center text-center">
                <div className="bg-green-50 p-8 rounded-3xl shadow-sm border border-green-100 max-w-md w-full">
                    <h2 className="text-3xl font-black text-green-700 mb-4 tracking-tight">Order Successful!</h2>
                    <p className="text-gray-700 mb-6 font-medium text-lg">Present this QR code at your selected pickup slot ({pickupSlot}).</p>
                    
                    <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mb-6">
                        <QRCodeCanvas value={qrString} size={200} includeMargin={true} />
                    </div>

                    <div className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full mb-6">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-widest text-[10px]">Pickup Instructions</h3>
                        <ul className="space-y-4">
                            {Array.from(new Set(items.map(i => i.stallNumber))).map(stall => (
                                <li key={stall} className="text-gray-800 font-medium text-sm border-l-4 border-amber-400 pl-3">
                                    <span className="font-black text-zinc-950 block mb-1">{stall}</span>
                                    {items.filter(i => i.stallNumber === stall).map(i => `${i.quantity}x ${i.name}`).join(', ')} 
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {rewardEligible && (
                        <div className="mt-4 bg-yellow-100 border border-yellow-300 text-yellow-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm text-left">
                            <span className="text-3xl">🎉</span>
                            <div>
                                <p className="font-black">Loyalty Token Unlocked!</p>
                                <p className="text-xs font-medium mt-1">Order over Rs. 2000 qualified for a post-event free item.</p>
                            </div>
                        </div>
                    )}

                    {ecoVoucher && (
                        <div className="mt-4 bg-gradient-to-r from-emerald-100 to-teal-100 border border-teal-200 text-teal-800 p-5 rounded-2xl shadow-sm text-left flex items-start gap-4">
                            <span className="text-3xl">🌱</span>
                            <div>
                                <p className="font-black">Free Healthy Meal Voucher</p>
                                <p className="text-xs font-medium mt-1">Thank you for 100% Eco-Score items. Your voucher is embedded in the QR!</p>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => navigate('/food')}
                        className="mt-8 px-8 py-4 bg-amber-400 text-zinc-950 rounded-2xl hover:bg-amber-300 transition-all font-black shadow-lg shadow-amber-200 active:scale-95 w-full uppercase tracking-widest text-xs"
                    >
                        Back to Menu
                    </button>
                </div>
            </main>
        </div>
    );
}
