import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../services/parkingService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export function DigitalPass() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const passRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      handleConfirm();
    } else {
      setError('No session ID found. Please complete a parking reservation first.');
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleConfirm = async () => {
    try {
      const { data } = await confirmPayment(sessionId);
      setReservation(data);
    } catch (err) {
      const msg = err.response?.data?.msg || 'Payment verification failed. The session may have expired.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = passRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`ParkingPass_${reservation.slotNumber}.pdf`);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-zinc-700 font-bold text-lg">Verifying your payment...</p>
      <p className="text-gray-400 text-sm">Please wait, do not close this page.</p>
    </div>
  );

  if (error || !reservation) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Session Expired</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {error || 'Your parking session could not be verified. It may have expired or already been used.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/parking')}
          className="w-full bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-200"
        >
          Return to Parking
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 px-4 pb-16 flex flex-col items-center">
        <div ref={passRef} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Parking Pass</h1>
            <p className="text-gray-500 text-sm">UniFlow Events Smart Parking</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl flex justify-center">
            <img src={reservation.qrCodeData} alt="QR Pass" className="w-48 h-48 mix-blend-multiply" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left border-t border-dashed border-gray-200 pt-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Slot</p>
              <p className="text-lg font-black text-amber-500">{reservation.slotNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Zone</p>
              <p className="text-lg font-black text-zinc-950">{reservation.zone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Vehicle Plate</p>
              <p className="font-bold text-zinc-950">{reservation.vehiclePlate}</p>
            </div>
          </div>

          <div className="bg-zinc-950 text-white p-4 rounded-xl text-[10px] font-mono leading-tight">
            ID: {reservation._id}
          </div>
        </div>

        <button 
          onClick={downloadPDF}
          className="mt-8 bg-amber-400 text-zinc-950 px-10 py-5 rounded-full font-black hover:bg-amber-300 transition-all flex items-center gap-3 shadow-2xl shadow-amber-200 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Pass
        </button>
      </main>
    </div>
  );
}
