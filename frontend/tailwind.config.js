/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    500: '#3b82f6',
                    700: '#1d4ed8',
                },
                success: {
                    500: '#10b981',
                    700: '#059669',
                },
                warning: {
                    500: '#f59e0b',
                    700: '#d97706',
                },
                danger: {
                    500: '#ef4444',
                    700: '#dc2626',
                },
            },
        },
    },
    plugins: [],
}