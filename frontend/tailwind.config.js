export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f7ff',
                    100: '#e0efff',
                    200: '#b9ddff',
                    300: '#7cc2ff',
                    400: '#36a5ff',
                    500: '#0d8eff',
                    600: '#006fe3',
                    700: '#0058b7',
                    800: '#064a94',
                    900: '#0a3f79',
                },
                accent: {
                    500: '#16c79a',
                    600: '#0ea67f',
                },
            },
            boxShadow: {
                glow: '0 10px 30px rgba(13, 142, 255, 0.18)',
                card: '0 20px 60px rgba(15, 23, 42, 0.08)',
            },
            backgroundImage: {
                hero: 'radial-gradient(circle at top left, rgba(13, 142, 255, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(22, 199, 154, 0.18), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,247,255,0.95))',
                'hero-dark': 'radial-gradient(circle at top left, rgba(13, 142, 255, 0.18), transparent 32%), radial-gradient(circle at top right, rgba(22, 199, 154, 0.18), transparent 24%), linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.96))',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
            animation: {
                float: 'float 5s ease-in-out infinite',
                pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
