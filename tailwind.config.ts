import type { Config } from 'tailwindcss';

export default {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}'
	],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				google: {
					'text-gray': '#3c4043',
					'button-blue': '#1a73e8',
					'button-blue-hover': '#5195ee',
					'button-dark': '#202124',
					'button-dark-hover': '#555658',
					'button-border-light': '#dadce0',
					'logo-blue': '#4285f4',
					'logo-green': '#34a853',
					'logo-yellow': '#fbbc05',
					'logo-red': '#ea4335'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-subtle': 'var(--gradient-subtle)'
			},
			boxShadow: {
				elegant: 'var(--shadow-elegant)',
				glow: 'var(--shadow-glow)',
				card: 'var(--shadow-card)'
			},
			transitionTimingFunction: {
				smooth: 'var(--transition-smooth)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				scroll: {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(-50%)'
					}
				},
				'expand-up-1': {
					'0%, 100%': {
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					},
					'25%': {
						transform: 'translateY(-5px) scale(1.1)',
						opacity: '0.8'
					},
					'50%': {
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					},
					'75%': {
						transform: 'translateY(5px) scale(0.9)',
						opacity: '0.6'
					}
				},
				'expand-down-1': {
					'0%, 100%': {
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					},
					'25%': {
						transform: 'translateY(5px) scale(1.1)',
						opacity: '0.8'
					},
					'50%': {
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					},
					'75%': {
						transform: 'translateY(-5px) scale(0.9)',
						opacity: '0.6'
					}
				},
				'connect-up': {
					'0%, 100%': {
						strokeDasharray: '0, 200'
					},
					'50%': {
						strokeDasharray: '200, 0'
					}
				},
				'connect-down': {
					'0%, 100%': {
						strokeDasharray: '0, 200'
					},
					'50%': {
						strokeDasharray: '200, 0'
					}
				},
				'expand-secondary': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '0.3'
					},
					'50%': {
						transform: 'scale(1.5)',
						opacity: '0.1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				scroll: 'scroll 10s linear infinite',
				'expand-up-1': 'expand-up-1 8s ease-in-out infinite',
				'expand-down-1': 'expand-down-1 8s ease-in-out infinite',
				'connect-up': 'connect-up 8s ease-in-out infinite',
				'connect-down': 'connect-down 8s ease-in-out infinite',
				'expand-secondary': 'expand-secondary 10s ease-in-out infinite 2s'
			}
		}
	},
	plugins: [require('tailwindcss-animate'), require('@tailwindcss/line-clamp')]
} satisfies Config;
