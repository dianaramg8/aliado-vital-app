import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Users, Activity, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  // Datos de ejemplo, se deben cargar dinámicamente desde Firestore
  const stats = [
    {
      title: 'Pacientes Registrados',
      value: 120,
      icon: <Users className="text-green-600" />,
    },
    {
      title: 'Cuidadores Activos',
      value: 34,
      icon: <BarChart3 className="text-blue-600" />,
    },
    {
      title: 'Signos Hoy',
      value: 245,
      icon: <Activity className="text-purple-600" />,
    },
    {
      title: 'Alertas Críticas',
      value: 5,
      icon: <AlertTriangle className="text-red-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administrador</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-2xl shadow-md hover:shadow-lg transition bg-white">
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="text-4xl">{stat.icon}</div>
              <div>
                <p className="text-gray-600 text-sm uppercase font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
