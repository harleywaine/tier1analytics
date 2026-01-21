/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base Colors
        'bg-primary': '#000000',
        'bg-secondary': '#0F0F0F',
        'bg-tertiary': '#0C0C0C',
        'card-bg': 'rgba(17, 20, 27, 0.55)',
        
        // Text Colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-tertiary': '#666666',
        'text-accent': '#4D5260',
        
        // Accent Colors
        'accent-primary': '#4D5260',
        'accent-primary-glow': 'rgba(77, 82, 96, 0.4)',
        'accent-primary-subtle': 'rgba(77, 82, 96, 0.1)',
        'accent-primary-border': 'rgba(77, 82, 96, 0.2)',
        'accent-primary-bg': 'rgba(77, 82, 96, 0.08)',
        
        'accent-secondary': '#A8C8E8',
        'accent-secondary-glow': 'rgba(168, 200, 232, 0.45)',
        'accent-secondary-subtle': 'rgba(168, 200, 232, 0.18)',
        'accent-secondary-border': 'rgba(168, 200, 232, 0.35)',
        'accent-secondary-bg': 'rgba(168, 200, 232, 0.12)',
        
        // Theme Colors
        'theme-blue': '#3B82F6',
        'theme-blue-glow': 'rgba(59, 130, 246, 0.4)',
        'theme-green': '#22C55E',
        'theme-green-glow': 'rgba(34, 197, 94, 0.4)',
        'theme-red': '#EF4444',
        'theme-red-glow': 'rgba(239, 68, 68, 0.4)',
        
        // Status Colors
        'status-success': '#22c55e',
        'status-error': '#ef4444',
        'status-warning': '#f59e0b',
        'status-info': '#4D5260',
        
        // Border Colors
        'border-primary': '#4D5260',
        'border-secondary': 'rgba(77, 82, 96, 0.2)',
        'border-card': 'rgba(255, 255, 255, 0.08)',
        'border-accent': 'rgba(77, 82, 96, 0.3)',
        
        // Button Colors
        'button-primary': '#FFFFFF',
        'button-primary-text': '#0D1016',
        'button-secondary-bg': 'rgba(77, 82, 96, 0.08)',
        'button-danger-bg': 'rgba(220, 38, 38, 0.15)',
        'button-danger-text': '#ff6b6b',
        'button-success': '#22c55e',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro', 'Roboto', 'sans-serif'],
        mono: ['IBMPlexMono', 'monospace'],
      },
      fontSize: {
        'xs': ['9px', { lineHeight: '1.5', letterSpacing: '0.5px' }],
        'sm': ['11px', { lineHeight: '1.5', letterSpacing: '0px' }],
        'base': ['12px', { lineHeight: '1.5', letterSpacing: '0px' }],
        'lg': ['14px', { lineHeight: '1.5', letterSpacing: '0px' }],
        'xl': ['16px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        '2xl': ['18px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        '3xl': ['21px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        '4xl': ['24px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
        '5xl': ['30px', { lineHeight: '1.2', letterSpacing: '-0.5px' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        '0.5': '4px',
        '1.5': '12px',
        '2.5': '20px',
      },
      borderRadius: {
        'card': '20px',
        'button': '24px',
        'input': '12px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(77, 82, 96, 0.2)',
        'button': '0 6px 8px rgba(77, 82, 96, 0.3)',
        'subtle': '0 2px 8px rgba(77, 82, 96, 0.1)',
        'glow-primary': '0 0 20px rgba(77, 82, 96, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
      },
      backdropBlur: {
        'glass': '25px',
      },
    },
  },
  plugins: [],
}
