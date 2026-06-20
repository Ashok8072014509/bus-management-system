import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wrench } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16'];

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-gray-500 font-medium">Loading Analytics...</div>;

  const topBus = data?.topBus;
  const lowestBus = data?.lowestBus;
  const highestExp = data?.highestExpenseBus;
  const highestRev = data?.highestRevenueBus;
  const mostMaint = data?.mostMaintenanceBus;

  const busPerformance = data?.busPerformance || [];

  return (
    <div className="pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Analytics</h1>
        <p className="text-gray-500 text-sm">Financial charts and fleet performance metrics.</p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Top Profit</div>
            <div className="text-lg font-bold text-gray-900">{topBus?.busNumber || 'N/A'}</div>
            <div className="text-sm text-green-600 font-bold">₹{topBus?.profit?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-green-100 p-2 rounded-lg text-green-600">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Lowest Profit</div>
            <div className="text-lg font-bold text-gray-900">{lowestBus?.busNumber || 'N/A'}</div>
            <div className="text-sm text-red-500 font-bold">₹{lowestBus?.profit?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-red-100 p-2 rounded-lg text-red-600">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">High Revenue</div>
            <div className="text-lg font-bold text-gray-900">{highestRev?.busNumber || 'N/A'}</div>
            <div className="text-sm text-blue-600 font-bold">₹{highestRev?.collection?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">High Expense</div>
            <div className="text-lg font-bold text-gray-900">{highestExp?.busNumber || 'N/A'}</div>
            <div className="text-sm text-orange-600 font-bold">₹{highestExp?.expenses?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Most Repairs</div>
            <div className="text-lg font-bold text-gray-900">{mostMaint?.busNumber || 'N/A'}</div>
            <div className="text-sm text-purple-600 font-bold">₹{mostMaint?.maintenance?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
            <Wrench size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Daily Trends (Collection vs Expense vs Maintenance) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 xl:col-span-2">
          <h2 className="text-base font-bold mb-4 text-gray-900">Timeline</h2>
          <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyTrends} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" name="Collection" dataKey="collection" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} />
                <Line type="monotone" name="Expenses" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{r:3}} />
                <Line type="monotone" name="Profit" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base font-bold mb-4 text-gray-900">Expenses</h2>
          <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {data?.categoryDistribution?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bus Performance Comparison */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-base font-bold mb-4 text-gray-900">Bus Comparison</h2>
          <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={busPerformance} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="busNumber" tick={{fontSize: 12, fill: '#6b7280'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar name="Collection" dataKey="collection" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar name="Expenses" dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar name="Profit" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bus Revenue & Expense Pie Charts */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-around items-center">
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase">Revenue</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={busPerformance}
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    dataKey="collection"
                    nameKey="busNumber"
                    label={false}
                  >
                    {busPerformance.map((_: any, index: number) => (
                      <Cell key={`cell-rev-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col items-center mt-6 md:mt-0 md:border-l border-gray-100 md:pl-6">
            <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase">Expenses</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={busPerformance}
                    cx="50%"
                    cy="45%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="expenses"
                    nameKey="busNumber"
                    paddingAngle={2}
                    label={false}
                  >
                    {busPerformance.map((_: any, index: number) => (
                      <Cell key={`cell-exp-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
