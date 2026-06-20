import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FileText, Wrench, CreditCard, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function BusDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('summary');

  const { data: bus, isLoading: isBusLoading } = useQuery({
    queryKey: ['bus', id],
    queryFn: async () => {
      const res = await api.get(`/buses/${id}`);
      return res.data;
    }
  });

  const { data: expenses, isLoading: isExpLoading } = useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const res = await api.get('/expenses', { params: { busId: id } });
      return res.data;
    }
  });

  const { data: dailies, isLoading: isDailyLoading } = useQuery({
    queryKey: ['dailies', id],
    queryFn: async () => {
      const res = await api.get('/dailies');
      // filter locally for now to speed up
      return res.data.filter((d: any) => d.busId === id);
    }
  });

  if (isBusLoading || isExpLoading || isDailyLoading) return <div>Loading...</div>;
  if (!bus) return <div>Bus not found</div>;

  const totalCol = dailies?.reduce((s: number, d: any) => s + d.totalCollection, 0) || 0;
  
  let inlineDailyExp = 0;
  const expenseBreakdown: Record<string, number> = {};

  dailies?.forEach((d: any) => {
    const dSal = (d.driverSalaryExpense || 0) + (d.conductorSalaryExpense || 0);
    const dExp = (d.dieselExpense || 0) + dSal + (d.maintenanceExpense || 0) + (d.otherExpense || 0);
    inlineDailyExp += dExp;

    expenseBreakdown['Diesel'] = (expenseBreakdown['Diesel'] || 0) + (d.dieselExpense || 0);
    expenseBreakdown['Salaries'] = (expenseBreakdown['Salaries'] || 0) + dSal;
    expenseBreakdown['Daily Maintenance'] = (expenseBreakdown['Daily Maintenance'] || 0) + (d.maintenanceExpense || 0);
    expenseBreakdown['Other Daily'] = (expenseBreakdown['Other Daily'] || 0) + (d.otherExpense || 0);
  });

  const additionalExp = expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0;
  const totalExp = inlineDailyExp + additionalExp;
  const remaining = totalCol - totalExp;

  const maintenanceExpenses = expenses?.filter((e: any) => {
    const cat = e.category.toLowerCase();
    return cat.includes('maintenance') || cat.includes('repair') || cat.includes('tyre') || cat.includes('oil') || cat.includes('battery');
  });

  expenses?.forEach((e: any) => {
    expenseBreakdown[`[Add.] ${e.category}`] = (expenseBreakdown[`[Add.] ${e.category}`] || 0) + e.amount;
  });

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <Link to="/buses" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium">
        <ArrowLeft size={16} className="mr-2" /> Back to Buses
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            {bus.registrationNumber}
            <span className={`ml-4 px-3 py-1 text-sm rounded-full ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {bus.status}
            </span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">{bus.busName} • {bus.route} • {bus.capacity} Seats</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'summary', icon: Activity, label: 'Financial Summary' },
          { id: 'maintenance', icon: Wrench, label: 'Maintenance History' },
          { id: 'expenses', icon: CreditCard, label: 'Expense History' },
          { id: 'documents', icon: FileText, label: 'Documents' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
        {activeTab === 'summary' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <p className="text-blue-800 font-medium mb-1">Total Collection</p>
                <p className="text-3xl font-bold text-blue-900">₹{totalCol.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                <p className="text-red-800 font-medium mb-1">Total Expense</p>
                <p className="text-3xl font-bold text-red-900">₹{totalExp.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <p className="text-green-800 font-medium mb-1">Total Remaining</p>
                <p className="text-3xl font-bold text-green-900">₹{remaining.toLocaleString()}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Breakdown</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 font-medium text-gray-600 border-b">Category</th>
                    <th className="p-4 font-medium text-gray-600 border-b text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(expenseBreakdown).sort((a, b) => expenseBreakdown[b] - expenseBreakdown[a]).map(cat => (
                    <tr key={cat} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-700">{cat}</td>
                      <td className="p-4 text-right text-gray-900 font-bold">₹{expenseBreakdown[cat].toLocaleString()}</td>
                    </tr>
                  ))}
                  {Object.keys(expenseBreakdown).length === 0 && (
                    <tr><td colSpan={2} className="p-4 text-center text-gray-500">No expenses recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Maintenance History</h2>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 font-medium text-gray-600 border-b">Date</th>
                    <th className="p-4 font-medium text-gray-600 border-b">Category</th>
                    <th className="p-4 font-medium text-gray-600 border-b">Description</th>
                    <th className="p-4 font-medium text-gray-600 border-b text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceExpenses?.map((e: any) => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="p-4 font-medium text-gray-700">{e.category}</td>
                      <td className="p-4 text-gray-600">{e.description || '-'}</td>
                      <td className="p-4 text-right font-bold text-gray-900">₹{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {maintenanceExpenses?.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No maintenance records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Complete Expense History</h2>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 font-medium text-gray-600 border-b">Date</th>
                    <th className="p-4 font-medium text-gray-600 border-b">Category</th>
                    <th className="p-4 font-medium text-gray-600 border-b">Description</th>
                    <th className="p-4 font-medium text-gray-600 border-b text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses?.map((e: any) => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="p-4 font-medium text-gray-700">{e.category}</td>
                      <td className="p-4 text-gray-600">{e.description || '-'}</td>
                      <td className="p-4 text-right font-bold text-gray-900">₹{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {expenses?.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No expense records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={64} className="mb-4 text-gray-300" />
            <p className="text-xl font-medium">Document Storage Coming Soon</p>
            <p className="mt-2 text-sm">Upload RC, Insurance, and Permits here in the next update.</p>
          </div>
        )}
      </div>
    </div>
  );
}
