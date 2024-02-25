/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    // ...
    require('@tailwindcss/forms'),
  ],
  options: {
    safelist: ['swal'], 
  },
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
        'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'credimonto-green': '#a4e786',
        'credimonto-blue': '#131338',
        'credimonto-white': '#FFFFFF',
        'credimonto-lightgreen': '#e9fce1',
        'credimonto-lightblue': '#51517d'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    
  ],
}
