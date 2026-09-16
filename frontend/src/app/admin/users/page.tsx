'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Edit state
  const [newRole, setNewRole] = useState('PATIENT');
  
  // Action status
  const [actionStatus, setActionStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        setActionStatus({ type: 'success', message: `User role updated to ${newRole}` });
        fetchUsers();
        setIsEditModalOpen(false);
      } else {
        setActionStatus({ type: 'error', message: 'Failed to update user role' });
      }
    } catch (error) {
      setActionStatus({ type: 'error', message: 'An error occurred' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setActionStatus({ type: 'success', message: 'User soft-deleted successfully' });
        fetchUsers();
        setIsDeleteModalOpen(false);
      } else {
        setActionStatus({ type: 'error', message: 'Failed to delete user' });
      }
    } catch (error) {
      setActionStatus({ type: 'error', message: 'An error occurred' });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">User Directory</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Manage access and roles</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {actionStatus && (
        <div className={`p-3 rounded-md text-sm flex items-center justify-between border ${actionStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {actionStatus.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{actionStatus.message}</span>
          </div>
          <button onClick={() => setActionStatus(null)}><X size={16} /></button>
        </div>
      )}

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Joined</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                        ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                          user.role === 'THERAPIST' ? 'bg-teal-50 text-teal-700 border-teal-200' : 
                          'bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => { setSelectedUser(user); setNewRole(user.role); setIsEditModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors mr-2"
                        title="Edit Role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete User"
                        disabled={user.role === 'ADMIN'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900">Modify Access Role</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Target User</label>
                <div className="text-sm font-medium text-slate-900">{selectedUser.email}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">New Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="THERAPIST">Therapist</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateRole}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-red-50 flex justify-between items-center text-red-700">
              <h3 className="text-base font-semibold flex items-center gap-2"><AlertCircle size={18}/> Confirm Revocation</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600">
                Are you sure you want to revoke access for <strong className="text-slate-900">{selectedUser.email}</strong>? 
                This action will soft-delete their account and prevent login.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
