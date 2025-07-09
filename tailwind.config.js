/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2ecc71',   // Verde para éxito y confirmaciones
        secondary: '#3498db', // Azul para botones y enlaces
        background: '#ffffff', // Blanco para fondo
        textPrimary: '#2c3e50', // Texto principal
        textSecondary: '#95a5a6', // Texto secundario
        error: '#e74c3c',      // Rojo para alertas
        success: '#1abc9c',    // Verde para éxitos
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
