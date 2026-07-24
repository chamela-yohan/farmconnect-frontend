"use client";

import { useAdminUsers, useToggleUserStatus, useVerifyFarmer } from '@/lib/api/admin';
import { CheckCircle2, XCircle, ShieldCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers(0, 50);
  const toggleStatus = useToggleUserStatus();
  const verifyFarmer = useVerifyFarmer();

  if (isLoading) return <div className="text-center py-20">Loading users...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">User Management</h2>
      
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.content?.map((user: any) => (
                <tr key={user.id} className="bg-background hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'FARMER' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.isVerified ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      {user.isAccountNonLocked ? <span className="text-green-600">Active</span> : <span className="text-red-600">Suspended</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {user.role === 'FARMER' && !user.isVerified && (
                      <button
                        onClick={() => verifyFarmer.mutate(user.id, { onSuccess: () => toast.success('Farmer verified!') })}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Verify
                      </button>
                    )}
                    <button
                      onClick={() => toggleStatus.mutate(user.id, { onSuccess: () => toast.success('User status updated!') })}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs text-white ${
                        user.isAccountNonLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <UserX className="w-3 h-3" /> {user.isAccountNonLocked ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}