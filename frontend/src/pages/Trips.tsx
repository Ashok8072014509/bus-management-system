import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import Modal from '../components/Modal';

export default function Trips() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);

  const [formData, setFormData] = useState({
    busId: '',
    driverId: '',
    conductorId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'COMPLETED'
  });

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    }
  });

  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const res = await api.get('/buses');
      return res.data;
    }
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return res.data;
    }
  });

  const { data: conductors } = useQuery({
    queryKey: ['conductors'],
    queryFn: async () => {
      const res = await api.get('/conductors');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newTrip: any) => api.post('/trips', newTrip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedTrip: any) => api.put(`/trips/${updatedTrip.id}`, updatedTrip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trips/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      date: new Date(formData.date).toISOString()
    };
    if (editingTrip) {
      updateMutation.mutate({ ...payload, id: editingTrip.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (trip: any) => {
    setEditingTrip(trip);
    setFormData({
      busId: trip.busId,
      driverId: trip.driverId,
      conductorId: trip.conductorId || '',
      date: new Date(trip.date).toISOString().split('T')[0],
      status: trip.status
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTrip(null);
    setFormData({ 
      busId: buses?.[0]?.id || '', 
      driverId: drivers?.[0]?.id || '', 
      conductorId: conductors?.[0]?.id || '',
      date: new Date().toISOString().split('T')[0], 
      status: 'COMPLETED' 
    });
    setIsModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trips</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Trip</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Bus</th>
              <th className="p-4 font-medium text-gray-600">Driver</th>
              <th className="p-4 font-medium text-gray-600">Conductor</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips?.map((trip: any) => (
              <tr key={trip.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{new Date(trip.date).toLocaleDateString()}</td>
                <td className="p-4">{trip.bus?.registrationNumber} - {trip.bus?.route}</td>
                <td className="p-4">{trip.driver?.name}</td>
                <td className="p-4">{trip.conductor?.name || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800`}>
                    {trip.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button onClick={() => openEdit(trip)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => deleteMutation.mutate(trip.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
            {trips?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No trips found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTrip ? 'Edit Trip' : 'Add Trip'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bus</label>
            <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.busId} onChange={e => setFormData({...formData, busId: e.target.value})}>
              <option value="">Select a Bus</option>
              {buses?.map((bus: any) => (
                <option key={bus.id} value={bus.id}>{bus.registrationNumber} - {bus.route}</option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
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
