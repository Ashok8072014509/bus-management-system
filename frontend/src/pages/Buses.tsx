import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';

export default function Buses() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    busName: '',
    route: '',
    capacity: 40,
    status: 'ACTIVE'
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const res = await api.get('/buses');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newBus: any) => api.post('/buses', newBus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedBus: any) => api.put(`/buses/${updatedBus.id}`, updatedBus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/buses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBus) {
      updateMutation.mutate({ ...formData, id: editingBus.id, capacity: Number(formData.capacity) });
    } else {
      createMutation.mutate({ ...formData, capacity: Number(formData.capacity) });
    }
  };

  const openEdit = (bus: any) => {
    setEditingBus(bus);
    setFormData({
      registrationNumber: bus.registrationNumber,
      busName: bus.busName,
      route: bus.route,
      capacity: bus.capacity,
      status: bus.status
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingBus(null);
    setFormData({ registrationNumber: '', busName: '', route: '', capacity: 40, status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuses = data?.filter((bus: any) => 
    bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to load data. Please ensure the backend server is running and you are logged in. (Error: {(error as any)?.message})</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Buses</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Bus</button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <input 
          type="text" 
          placeholder="Search buses by Registration Number, Name, or Route..." 
          className="w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Reg. Number</th>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Route</th>
              <th className="p-4 font-medium text-gray-600">Capacity</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses?.map((bus: any) => (
              <tr key={bus.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-blue-600 hover:text-blue-800">
                  <Link to={`/buses/${bus.id}`}>{bus.registrationNumber}</Link>
                </td>
                <td className="p-4">{bus.busName}</td>
                <td className="p-4">{bus.route}</td>
                <td className="p-4">{bus.capacity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bus.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button onClick={() => openEdit(bus)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => deleteMutation.mutate(bus.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No buses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBus ? 'Edit Bus' : 'Add Bus'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
            <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bus Name</label>
            <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.busName} onChange={e => setFormData({...formData, busName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Route</label>
            <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
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
