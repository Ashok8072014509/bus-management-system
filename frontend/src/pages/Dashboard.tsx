import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Bus, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', selectedDate],
    queryFn: async () => {
      const res = await api.get(`/dailies/dashboard/stats?date=${selectedDate}`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Fleet Dashboard</h1>
          <p className="text-gray-600">Comprehensive real-time tracking of daily operations and fleet-wide financials.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar size={20} className="text-gray-500 ml-2" />
          <input 
            type="date" 
            className="p-2 border-none outline-none font-medium text-gray-700 bg-transparent"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      
      {/* Daily Operations */}
      <h2 className="text-xl font-bold mb-4 text-blue-800 border-b pb-2 border-blue-100">
        Operations for {new Date(selectedDate).toLocaleDateString()}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm border border-green-200">
          <div className="text-green-800 text-xs font-bold uppercase tracking-wider mb-1">Today's Collection</div>
          <div className="text-2xl font-bold text-green-900">₹{data?.todayCollection}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl shadow-sm border border-red-200">
          <div className="text-red-800 text-xs font-bold uppercase tracking-wider mb-1">Today's Total Expense</div>
          <div className="text-2xl font-bold text-red-900">₹{data?.todayTotalExpense}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm border border-blue-200">
          <div className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">Today's Remaining</div>
          <div className="text-2xl font-bold text-blue-900">₹{data?.todayProfit}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
           <Bus className="text-blue-500" size={32} />
           <div>
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Fleet Status</div>
            <div className="text-lg font-bold text-gray-800">{data?.activeBuses} Active</div>
            <div className="text-xs text-gray-500">{data?.totalBuses} Total Buses</div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Expense Breakdown ({new Date(selectedDate).toLocaleDateString()})</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500 mb-1">Diesel</div>
            <div className="font-semibold text-gray-800">₹{data?.todayDieselExpense}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500 mb-1">Salary</div>
            <div className="font-semibold text-gray-800">₹{data?.todaySalaryExpense}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500 mb-1">Maintenance</div>
            <div className="font-semibold text-gray-800">₹{data?.todayMaintenanceExpense}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500 mb-1">Other</div>
            <div className="font-semibold text-gray-800">₹{data?.todayOtherExpense}</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-xs text-orange-600 mb-1 font-semibold">Additional Expenses</div>
            <div className="font-semibold text-orange-900">₹{data?.todayAdditionalExpense}</div>
          </div>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Lifetime Fleet Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Collection</div>
            <div className="text-3xl font-bold text-gray-800 mt-1">₹{data?.totalCollection}</div>
          </div>
          <DollarSign className="text-green-500 opacity-50" size={48} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Grand Total Expenses</div>
            <div className="text-3xl font-bold text-red-600 mt-1">₹{data?.totalExpenses}</div>
          </div>
          <Activity className="text-red-500 opacity-50" size={48} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Remaining</div>
            <div className="text-3xl font-bold text-blue-700 mt-1">₹{data?.totalProfit}</div>
          </div>
          <TrendingUp className="text-blue-500 opacity-50" size={48} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Lifetime Expense Distribution</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-3 mb-6 border-b pb-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Diesel</span>
                  <span className="font-bold">₹{data?.totalDieselExpense}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Salaries</span>
                  <span className="font-bold">₹{data?.totalSalaryExpense}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Daily Maintenance</span>
                  <span className="font-bold">₹{data?.totalMaintenanceExpense}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Daily Other</span>
                  <span className="font-bold">₹{data?.totalOtherExpense}</span>
               </div>
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">Additional Expenses (Expense Module)</h3>
            {data?.expenseBreakdown?.length > 0 ? (
              <div className="space-y-3">
                {data.expenseBreakdown.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="text-orange-700 font-medium">{item.name}</div>
                    <div className="font-bold text-orange-900">₹{item.amount.toLocaleString()}</div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-2 border-t font-bold text-orange-900">
                  <span>Total Additional</span>
                  <span>₹{data?.totalAdditionalExpense}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No additional expenses recorded.</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Additional Expenses</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-sm">
                  <th className="p-3 font-medium text-gray-600">Date</th>
                  <th className="p-3 font-medium text-gray-600">Bus</th>
                  <th className="p-3 font-medium text-gray-600">Category</th>
                  <th className="p-3 font-medium text-gray-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentExpenses?.map((e: any) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-3 text-gray-600">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-gray-800">{e.bus?.registrationNumber}</td>
                    <td className="p-3 text-gray-600">
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">{e.category}</span>
                    </td>
                    <td className="p-3 font-bold text-red-600 text-right">₹{e.amount}</td>
                  </tr>
                ))}
                {(!data?.recentExpenses || data.recentExpenses.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">No recent expenses.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bus-Wise Cards */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Bus Performance ({new Date(selectedDate).toLocaleDateString()})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data?.busCards?.map((card: any) => (
          <div key={card.bus.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`p-4 border-b flex justify-between items-center ${card.bus.status === 'ACTIVE' ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <div>
                <div className="font-bold text-lg text-gray-800">{card.bus.registrationNumber}</div>
                <div className="text-xs text-gray-500">{card.bus.route} | {card.bus.busName}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${card.bus.status === 'ACTIVE' ? 'bg-green-200 text-green-800' : 'bg-gray-300 text-gray-700'}`}>
                {card.bus.status}
              </span>
            </div>
            
            <div className="bg-blue-50 p-3 border-b text-center">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Daily Stats</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Today Col.</div>
                <div className="font-semibold text-green-700">₹{card.todayCollection}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Today Exp.</div>
                <div className="font-semibold text-red-600">₹{card.todayTotalExpense}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Remaining</div>
                <div className={`font-bold text-lg ${card.todayProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ₹{card.todayProfit}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 border-t border-b text-center">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Lifetime Stats</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Total Col.</div>
                <div className="font-semibold text-gray-800">₹{card.totalCollection}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Total Exp.</div>
                <div className="font-semibold text-red-600">₹{card.totalExpenses}</div>
              </div>
            </div>

            <div className="bg-gray-100 p-3 text-xs text-gray-600 border-t flex justify-between">
              <div><span className="font-semibold">Driver:</span> {card.latestDriver || '-'}</div>
              <div><span className="font-semibold">Cond:</span> {card.latestConductor || '-'}</div>
            </div>
          </div>
        ))}
        {(!data?.busCards || data.busCards.length === 0) && (
          <div className="col-span-full text-center p-8 text-gray-500 bg-white rounded-xl border border-dashed">
            No buses found in the fleet.
          </div>
        )}
      </div>
    </div>
  );
}
