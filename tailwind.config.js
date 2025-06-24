/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'nova-round': ['Nova Round', 'cursive'],
        'chargur': ['Nova Round', 'cursive'],
      },
    },
  },
  plugins: [],
};
