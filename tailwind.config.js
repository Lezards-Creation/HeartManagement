/** @type {import('tailwindcss').Config} */
module.exports = {
      content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
      theme: {
            extend: {
			colors: {
				'rose': {
					DEFAULT: '#ED5390',
					50: '#FEF9FB',
					100: '#FCE7EF',
					200: '#F9C2D8',
					300: '#F59DC0',
					400: '#F178A8',
					500: '#ED5390',
					600: '#E8206F',
					700: '#BC1456',
					800: '#890E3F',
					900: '#570928',
					950: '#3D061C',
				}
			}
		},
      },
      plugins: [
		require('@tailwindcss/forms'),
	],
}
