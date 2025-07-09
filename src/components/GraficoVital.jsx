import React, { useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import html2canvas from 'html2canvas';

export default function GraficoVital({
  data,
  dataKey,
  titulo,
  unidad,
  color,
  domain = ['auto', 'auto'],
  combinada = false,
  ticks = null
}) {
  const chartRef = useRef();

  const exportarComoPNG = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current).then(canvas => {
      const enlace = document.createElement('a');
      enlace.download = `${titulo}.png`;
      enlace.href = canvas.toDataURL('image/png');
      enlace.click();
    });
  };

  const renderDot = ({ cx, cy, value }) => {
    let critico = false;
    if (dataKey === 'temperatura' && (value < 36 || value > 37.5)) critico = true;
    if (dataKey === 'saturacion' && value < 85) critico = true;
    if (dataKey === 'palpitaciones' && (value < 60 || value > 100)) critico = true;
    if (dataKey === 'glucosa' && (value < 70 || value > 140)) critico = true;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke={critico ? 'red' : 'white'}
        strokeWidth={2}
        fill={critico ? 'red' : color}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white p-2 rounded shadow text-sm">
        <p className="font-semibold">{label}</p>
        {payload.map((p, i) => (
          <p key={i}>
            <span style={{ color: p.stroke }}>{p.name}:</span> {p.value} {unidad}
          </p>
        ))}
      </div>
    );
  };

  // Escala personalizada solo para saturación
  const getTicksForSaturacion = () => {
    const ticks = [];
    for (let i = 75; i < 85; i += 4) {
      ticks.push(i);
    }
    for (let i = 85; i <= 100; i++) {
      ticks.push(i);
    }
    return ticks;
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-800">{titulo}</h3>
        <button
          onClick={exportarComoPNG}
          className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
        >
          Exportar PNG
        </button>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" angle={-20} textAnchor="end" height={60} />
            <YAxis
              domain={domain}
              ticks={dataKey === 'saturacion' ? getTicksForSaturacion() : ticks || undefined}
              tick={{ fontSize: 12 }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Zona crítica para saturación (<85%) */}
            {dataKey === 'saturacion' && (
              <ReferenceArea y1={0} y2={85} stroke="none" fill="red" fillOpacity={0.1} />
            )}

            {combinada ? (
              <>
                <Line
                  type="monotone"
                  dataKey="sistolica"
                  name="Sistólica"
                  stroke="#e74c3c"
                  strokeWidth={2}
                  dot={renderDot}
                />
                <Line
                  type="monotone"
                  dataKey="diastolica"
                  name="Diastólica"
                  stroke="#3498db"
                  strokeWidth={2}
                  dot={renderDot}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                name={titulo}
                stroke={color}
                strokeWidth={2}
                dot={renderDot}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
