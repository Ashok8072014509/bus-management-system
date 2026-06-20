import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Bus as BusIcon, Wrench, Fuel, CreditCard, Filter } from 'lucide-react';
import api from '../api';
import Modal from '../components/Modal';

const EXPENSE_CATEGORIES = [
  'Diesel', 'Driver Salary', 'Conductor Salary', 'Daily Allowance', 
  'Engine Repair', 'Tyre Replacement', 'Battery Replacement', 'Oil Change', 
  'Service & Maintenance', 'Insurance', 'Permit Renewal', 'Road Tax', 
  'Toll Charges', 'Parking Charges', 'Cleaning', 'Spare Parts', 
  'Emergency Repairs', 'Other Expenses'
];

export default function Expenses() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [busFilter, setBusFilter] = useState('all');

  const [formData, setFormData] = useState({
    busId: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Diesel',
    amount: '',
    description: '',
    notes: '',
    addedBy: ''
  });

  const { data: buses } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const res = await api.get('/buses');
      return res.data;
    }
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/expenses');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newExpense: any) => api.post('/expenses', newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updated: any) => api.put(`/expenses/${updated.id}`, updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      updateMutation.mutate({ ...formData, id: editingExpense.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openCreate = () => {
    setEditingExpense(null);
    setFormData({
      busId: buses?.[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      category: 'Diesel',
      amount: '',
      description: '',
      notes: '',
      addedBy: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      busId: expense.busId,
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || '',
      notes: expense.notes || '',
      addedBy: expense.addedBy || ''
    });
    setIsModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('diesel') || lower.includes('fuel')) return <Fuel size={16} />;
    if (lower.includes('maintenance') || lower.includes('repair') || lower.includes('tyre') || lower.includes('battery')) return <Wrench size={16} />;
    if (lower.includes('salary') || lower.includes('allowance')) return <CreditCard size={16} />;
    return <CreditCard size={16} />;
  };

  const filteredExpenses = expenses?.filter((e: any) => {
    const matchesSearch = e.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesBus = busFilter === 'all' || e.busId === busFilter;
    
    return matchesSearch && matchesCategory && matchesBus;
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
          <p className="text-gray-600 mt-1">Track and manage fleet expenses and maintenance.</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search expenses..." 
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select 
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BusIcon size={18} className="text-gray-400" />
          </div>
          <select 
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
          >
            <option value="all">All Buses</option>
            {buses?.map((b: any) => <option key={b.id} value={b.id}>{b.registrationNumber}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Bus</th>
              <th className="p-4 font-medium text-gray-600">Category</th>
              <th className="p-4 font-medium text-gray-600">Description</th>
              <th className="p-4 font-medium text-gray-600 text-right">Amount</th>
              <th className="p-4 font-medium text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses?.map((expense: any) => (
              <tr key={expense.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</td>
                <td className="p-4 font-medium text-gray-800">{expense.bus.registrationNumber}</td>
                <td className="p-4">
                  <span className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs w-max">
                    {getCategoryIcon(expense.category)}
                    <span>{expense.category}</span>
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{expense.description || '-'}</td>
                <td className="p-4 text-right font-bold text-gray-800">₹{expense.amount.toLocaleString()}</td>
                <td className="p-4 text-center space-x-3">
                  <button onClick={() => openEdit(expense)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  <button onClick={() => deleteMutation.mutate(expense.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {filteredExpenses?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <CreditCard size={48} className="text-gray-300 mb-3" />
                    <p>No expenses found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bus</label>
              <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.busId} onChange={e => setFormData({...formData, busId: e.target.value})}>
                <option value="" disabled>Select Bus</option>
                {buses?.map((b: any) => <option key={b.id} value={b.id}>{b.registrationNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <input type="number" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g. Engine Oil Service" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Added By (Optional)</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.addedBy} onChange={e => setFormData({...formData, addedBy: e.target.value})} />
          </div>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="mr-3 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
