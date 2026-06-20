import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Modal from '../components/Modal';

export default function Dailies() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDaily, setEditingDaily] = useState<any>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    busId: '',
    driverId: '',
    conductorId: '',
    totalCollection: 0,
    dieselExpense: 0,
    driverSalaryExpense: 0,
    conductorSalaryExpense: 0,
    maintenanceExpense: 0,
    otherExpense: 0
  });

  const { data: dailies, isLoading, isError, error } = useQuery({
    queryKey: ['dailies'],
    queryFn: async () => {
      const res = await api.get('/dailies');
      return res.data;
    }
  });

  // ... (keeping buses, drivers, conductors the same) ...
  const { data: buses } = useQuery({ queryKey: ['buses'], queryFn: async () => (await api.get('/buses')).data });
  const { data: drivers } = useQuery({ queryKey: ['drivers'], queryFn: async () => (await api.get('/drivers')).data });
  const { data: conductors } = useQuery({ queryKey: ['conductors'], queryFn: async () => (await api.get('/conductors')).data });

  const createMutation = useMutation({
    mutationFn: (newDaily: any) => api.post('/dailies', newDaily),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailies'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updated: any) => api.put(`/dailies/${updated.id}`, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailies'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/dailies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailies'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      conductorId: formData.conductorId === '' ? null : formData.conductorId,
      date: new Date(formData.date).toISOString()
    };

    if (editingDaily) {
      updateMutation.mutate({ ...payload, id: editingDaily.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreate = () => {
    setEditingDaily(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      busId: '',
      driverId: '',
      conductorId: '',
      totalCollection: 0,
      dieselExpense: 0,
      driverSalaryExpense: 0,
      conductorSalaryExpense: 0,
      maintenanceExpense: 0,
      otherExpense: 0
    });
    setIsModalOpen(true);
  };

  const openEdit = (daily: any) => {
    setEditingDaily(daily);
    setFormData({
      date: new Date(daily.date).toISOString().split('T')[0],
      busId: daily.busId,
      driverId: daily.driverId,
      conductorId: daily.conductorId || '',
      totalCollection: daily.totalCollection,
      dieselExpense: daily.dieselExpense || 0,
      driverSalaryExpense: daily.driverSalaryExpense || 0,
      conductorSalaryExpense: daily.conductorSalaryExpense || 0,
      maintenanceExpense: daily.maintenanceExpense || 0,
      otherExpense: daily.otherExpense || 0
    });
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to load data. Please ensure the backend server is running and you are logged in. (Error: {(error as any)?.message})</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Daily Entries</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Entry</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 font-medium text-gray-600">Date</th>
              <th className="p-3 font-medium text-gray-600">Bus</th>
              <th className="p-3 font-medium text-gray-600">Driver</th>
              <th className="p-3 font-medium text-gray-600 text-right">Collection</th>
              <th className="p-3 font-medium text-gray-600 text-right">Diesel</th>
              <th className="p-3 font-medium text-gray-600 text-right">Salary</th>
              <th className="p-3 font-medium text-gray-600 text-right">Maint.</th>
              <th className="p-3 font-medium text-gray-600 text-right">Other</th>
              <th className="p-3 font-medium text-gray-600 text-right">Total Exp</th>
              <th className="p-3 font-medium text-gray-600 text-right">Remaining</th>
              <th className="p-3 font-medium text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dailies?.map((daily: any) => {
              const dSal = (daily.driverSalaryExpense || 0) + (daily.conductorSalaryExpense || 0);
              const totalExp = (daily.dieselExpense || 0) + dSal + (daily.maintenanceExpense || 0) + (daily.otherExpense || 0);
              const remaining = daily.totalCollection - totalExp;
              return (
                <tr key={daily.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(daily.date).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-gray-800">{daily.bus?.registrationNumber}</td>
                  <td className="p-3 text-gray-600">{daily.driver?.name}</td>
                  <td className="p-3 text-right font-bold text-green-600">₹{daily.totalCollection}</td>
                  <td className="p-3 text-right text-gray-600">₹{daily.dieselExpense || 0}</td>
                  <td className="p-3 text-right text-gray-600">₹{dSal}</td>
                  <td className="p-3 text-right text-gray-600">₹{daily.maintenanceExpense || 0}</td>
                  <td className="p-3 text-right text-gray-600">₹{daily.otherExpense || 0}</td>
                  <td className="p-3 text-right font-bold text-red-600">₹{totalExp}</td>
                  <td className="p-3 text-right font-bold text-blue-600">₹{remaining}</td>
                  <td className="p-3 text-center space-x-2">
                    <button onClick={() => openEdit(daily)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button onClick={() => deleteMutation.mutate(daily.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </td>
                </tr>
              );
            })}
            {dailies?.length === 0 && (
              <tr>
                <td colSpan={11} className="p-4 text-center text-gray-500">No entries found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDaily ? 'Edit Entry' : 'Add Entry'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bus</label>
              <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.busId} onChange={e => setFormData({...formData, busId: e.target.value})}>
                <option value="">Select a Bus</option>
                {buses?.map((bus: any) => (
                  <option key={bus.id} value={bus.id}>{bus.registrationNumber}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Driver</label>
              <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})}>
                <option value="">Select a Driver</option>
                {drivers?.map((driver: any) => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Conductor</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.conductorId} onChange={e => setFormData({...formData, conductorId: e.target.value})}>
                <option value="">Select a Conductor (Optional)</option>
                {conductors?.map((conductor: any) => (
                  <option key={conductor.id} value={conductor.id}>{conductor.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Collection (₹)</label>
            <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-green-50 text-green-900 font-bold" value={formData.totalCollection} onChange={e => setFormData({...formData, totalCollection: Number(e.target.value)})} />
          </div>
          
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="font-semibold text-gray-700 mb-2">Daily Expenses</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Diesel Expense (₹)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.dieselExpense} onChange={e => setFormData({...formData, dieselExpense: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maintenance Expense (₹)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.maintenanceExpense} onChange={e => setFormData({...formData, maintenanceExpense: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Driver Salary (₹)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.driverSalaryExpense} onChange={e => setFormData({...formData, driverSalaryExpense: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Conductor Salary (₹)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.conductorSalaryExpense} onChange={e => setFormData({...formData, conductorSalaryExpense: Number(e.target.value)})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Other Expense (₹)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.otherExpense} onChange={e => setFormData({...formData, otherExpense: Number(e.target.value)})} />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border text-right">
            <p className="text-sm text-gray-600">Total Daily Expenses: <span className="font-semibold text-red-600">₹{(formData.dieselExpense || 0) + (formData.driverSalaryExpense || 0) + (formData.conductorSalaryExpense || 0) + (formData.maintenanceExpense || 0) + (formData.otherExpense || 0)}</span></p>
            <p className="text-lg font-bold mt-1 text-gray-800">Remaining: <span className="text-blue-600">₹{formData.totalCollection - ((formData.dieselExpense || 0) + (formData.driverSalaryExpense || 0) + (formData.conductorSalaryExpense || 0) + (formData.maintenanceExpense || 0) + (formData.otherExpense || 0))}</span></p>
          </div>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={!formData.busId || !formData.driverId}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
