import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function GraficoVital({ data, dataKey, titulo, color, unidad, domain }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-sm text-gray-800">
          <p><strong>{label}</strong></p>
          <p>{`${titulo}: ${payload[0].value} ${unidad}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{titulo}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={domain} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500">No hay datos suficientes para mostrar el gráfico.</p>
      )}
    </div>
  );
}
