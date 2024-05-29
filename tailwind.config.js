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
					DEFAULT: '#F43D80',
					'50': '#fef1f6',
					'100': '#fde6f0',
					'200': '#fdcde2',
					'300': '#fda4c9',
					'400': '#fa6ca4',
					'500': '#f43d80',
					'600': '#e41e5d',
					'700': '#c61045',
					'800': '#a41039',
					'900': '#881333',
					'950': '#540319',
				},
				'bleu': {
					DEFAULT: '#01238B',
					'50': '#e5f4ff',
					'100': '#cfecff',
					'200': '#a9d8ff',
					'300': '#76bcff',
					'400': '#418eff',
					'500': '#165fff',
					'600': '#0045ff',
					'700': '#0048ff',
					'800': '#003fe1',
					'900': '#01238b',
					'950': '#011765',
				}
			},
			transitionTimingFunction: {
				'bounce': 'cubic-bezier(0.47,1.64,0.41,0.8)'
			},
			keyframes: {
				wrong: {
					'0%, 100%': {transform: 'translate(0, 0)'},
					'50%': {transform: 'translate(-5px, 0)'},
					'25%, 75%': {transform: 'translate(5px, 0)'},
				}
			},
			animation: {
				wrong: 'wrong 0.5s cubic-bezier(0.47,1.64,0.41,0.8)'
			}
		},
	},
	plugins: [
	require('@tailwindcss/forms'),
],
}
