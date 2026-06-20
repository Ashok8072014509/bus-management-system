import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Modal from '../components/Modal';

export default function Drivers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    salary: 0,
    status: 'ACTIVE'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newDriver: any) => api.post('/drivers', newDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedDriver: any) => api.put(`/drivers/${updatedDriver.id}`, updatedDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateMutation.mutate({ ...formData, id: editingDriver.id, salary: Number(formData.salary) });
    } else {
      createMutation.mutate({ ...formData, salary: Number(formData.salary) });
    }
  };

  const openEdit = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      salary: driver.salary,
      status: driver.status
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingDriver(null);
    setFormData({ name: '', phone: '', licenseNumber: '', salary: 0, status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Drivers</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Driver</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Phone</th>
              <th className="p-4 font-medium text-gray-600">License</th>
              <th className="p-4 font-medium text-gray-600">Salary</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((driver: any) => (
              <tr key={driver.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{driver.name}</td>
                <td className="p-4">{driver.phone}</td>
                <td className="p-4">{driver.licenseNumber}</td>
                <td className="p-4">₹{driver.salary}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${driver.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {driver.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button onClick={() => openEdit(driver)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => deleteMutation.mutate(driver.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No drivers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDriver ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Salary (₹)</label>
            <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_LEAVE">ON_LEAVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
