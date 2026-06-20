import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export default function Reports() {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [busId, setBusId] = useState('all');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const res = await api.get('/buses');
      return res.data;
    }
  });

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/reports/pdf', {
        params: { from: fromDate, to: toDate, busId },
        responseType: 'blob'
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `report-${busId === 'all' ? 'fleet' : busId}-${fromDate}-to-${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 mt-2">Generate Fleet and Individual Bus collection reports.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Bus</label>
            <select 
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={busId}
              onChange={e => setBusId(e.target.value)}
            >
              <option value="all">All Buses (Fleet Report)</option>
              {buses?.map((b: any) => (
                <option key={b.id} value={b.id}>{b.registrationNumber} - {b.busName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input 
              type="date" 
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500" 
              value={fromDate} 
              onChange={e => setFromDate(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input 
              type="date" 
              className="w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500" 
              value={toDate} 
              onChange={e => setToDate(e.target.value)} 
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button 
            onClick={generateReport} 
            disabled={isLoading || !fromDate || !toDate}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
            <span>{isLoading ? 'Generating PDF...' : 'Generate & Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
