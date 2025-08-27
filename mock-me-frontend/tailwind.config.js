/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        animation: {
          'spin-slow': 'spin 3s linear infinite',
        },
        colors: {
          // Add custom colors if needed
          primary: {
            50: '#f0fdfa',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
          },
        },
      },
    },
    plugins: [
      // Add any Tailwind plugins here
    ],
  };