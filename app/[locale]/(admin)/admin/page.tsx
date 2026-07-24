"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DollarSign, ShoppingCart, Users, Tractor } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics/dashboard');
      return data.data;
    },
  });

  if (isLoading) return <div className="text-center py-20">Loading dashboard...</div>;

  const cards = [
    { title: 'Total Revenue', value: `LKR ${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-500' },
    { title: 'Active Farmers', value: stats?.totalFarmers || 0, icon: Tractor, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}