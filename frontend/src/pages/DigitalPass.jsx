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
  const passRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      handleConfirm();
    } else {
        toast.error('Invalid Session');
        navigate('/parking');
    }
  }, [sessionId]);

  const handleConfirm = async () => {
    try {
      const { data } = await confirmPayment(sessionId);
      setReservation(data);
    } catch (err) {
      toast.error('Payment verification failed');
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Verifying Payment...</div>;

  if (!reservation) return <div className="min-h-screen flex items-center justify-center">No reservation found.</div>;

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
