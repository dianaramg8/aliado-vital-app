import React from 'react';
import { FaThermometerHalf, FaTint, FaHeartbeat, FaHourglassHalf, FaVial } from 'react-icons/fa';
import { motion } from 'framer-motion';

const isOutOfRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && (num < min || num > max);
};

const isTensionOutOfRange = (value) => {
  if (!value) return false;
  const [sist, diast] = value.split('/').map(Number);
  return isNaN(sist) || isNaN(diast) || sist < 90 || sist > 140 || diast < 60 || diast > 90;
};

const MotionItem = ({ children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="hover:shadow-lg transform transition duration-300 hover:-translate-y-1 rounded p-3 text-sm"
  >
    {children}
  </motion.div>
);

const ResumenSignos = ({ signos }) => {
  const items = [
    {
      label: 'Temperatura',
      value: `${signos.temperatura} °C`,
      icon: <FaThermometerHalf className="text-red-500 text-xl" />,
      outOfRange: isOutOfRange(signos.temperatura, 36, 37.5),
      bg: 'bg-red-50',
    },
    {
      label: 'Saturación',
      value: `${signos.saturacion} %`,
      icon: <FaTint className="text-blue-500 text-xl" />,
      outOfRange: isOutOfRange(signos.saturacion, 92, 100),
      bg: 'bg-blue-50',
    },
    {
      label: 'Palpitaciones',
      value: `${signos.palpitaciones} lpm`,
      icon: (
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <FaHeartbeat className="text-red-600 text-xl" />
        </motion.span>
      ),
      outOfRange: isOutOfRange(signos.palpitaciones, 60, 100),
      bg: 'bg-red-50',
    },
    {
      label: 'Última Tensión',
      value: signos.tension,
      icon: <FaHourglassHalf className="text-blue-600 text-xl" />,
      outOfRange: isTensionOutOfRange(signos.tension),
      bg: 'bg-blue-50',
    },
    {
      label: 'Glucosa',
      value: signos.glucosa || 'No registrada',
      icon: <FaVial className="text-purple-500 text-xl" />,
      outOfRange: isOutOfRange(signos.glucosa, 70, 140),
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {items.map((item, idx) => (
        <MotionItem key={idx} delay={idx * 0.1}>
          <div className={`flex items-start gap-2 p-3 rounded ${item.outOfRange ? item.bg : 'bg-white'} w-full`}>
            <div className="text-2xl">{item.icon}</div>
            <div>
              <p className="text-gray-500 font-medium leading-tight">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
            </div>
          </div>
        </MotionItem>
      ))}
    </div>
  );
};

export default ResumenSignos;
