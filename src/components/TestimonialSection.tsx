import { Card, CardContent } from '@/components/ui/card';
import { User, UserRound, UserCircle, Contact, Users } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const avatarVariants = [
	{
		icon: User,
		bgColor: 'bg-blue-100 dark:bg-blue-900/20',
		iconColor: 'text-blue-600 dark:text-blue-400'
	},
	{
		icon: User,
		bgColor: 'bg-green-100 dark:bg-green-900/20',
		iconColor: 'text-green-600 dark:text-green-400'
	},
	{
		icon: User,
		bgColor: 'bg-purple-100 dark:bg-purple-900/20',
		iconColor: 'text-purple-600 dark:text-purple-400'
	},
	{
		icon: User,
		bgColor: 'bg-orange-100 dark:bg-orange-900/20',
		iconColor: 'text-orange-600 dark:text-orange-400'
	},
	{
		icon: User,
		bgColor: 'bg-pink-100 dark:bg-pink-900/20',
		iconColor: 'text-pink-600 dark:text-pink-400'
	},
	{
		icon: User,
		bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
		iconColor: 'text-indigo-600 dark:text-indigo-400'
	},
	{
		icon: User,
		bgColor: 'bg-teal-100 dark:bg-teal-900/20',
		iconColor: 'text-teal-600 dark:text-teal-400'
	},
	{
		icon: User,
		bgColor: 'bg-rose-100 dark:bg-rose-900/20',
		iconColor: 'text-rose-600 dark:text-rose-400'
	},
	{
		icon: User,
		bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
		iconColor: 'text-cyan-600 dark:text-cyan-400'
	}
];

const testimonials = [
	{
		id: 1,
		name: 'Sarah',
		handle: '@sarahc_dev',
		avatar: '',
		content: 'If cold applying is dead, Jobrani is the resurrection.',
		timestamp: 'Using for 2 weeks'
	},
	{
		id: 2,
		name: 'Marcus',
		handle: '@marcusdev',
		avatar: '',
		content: "I'm getting twice the traction in half the time.",
		timestamp: 'Using for 1 month'
	},
	{
		id: 3,
		name: 'Emily',
		handle: '@emilyzhang',
		avatar: '',
		content: 'This actually works. Got 3 interview requests this week.',
		timestamp: 'Using for 6 weeks'
	},
	{
		id: 4,
		name: 'David',
		handle: '@davidpark_eng',
		avatar: '',
		content: "It's not just automation — it's actually strategic.",
		timestamp: 'Using for 3 weeks'
	},
	{
		id: 5,
		name: 'Jessica',
		handle: '@jessicakim',
		avatar: '',
		content: 'Applying to jobs used to feel like screaming into the void. Now I get replies.',
		timestamp: 'Using for 5 weeks'
	},
	{
		id: 6,
		name: 'Alex',
		handle: '@alexthompson',
		avatar: '',
		content: "It's the first tool I've used that feels personal and scalable.",
		timestamp: 'Using for 2 months'
	},
	{
		id: 7,
		name: 'Priya',
		handle: '@priyapatel',
		avatar: '',
		content: "Jobrani made my job search suck less. That's a win.",
		timestamp: 'Using for 4 weeks'
	},
	{
		id: 8,
		name: 'Mike',
		handle: '@mikejohnson',
		avatar: '',
		content:
			'I got more conversations in 10 days with Jobrani than in 3 months of applying the old way.',
		timestamp: 'Using for 8 weeks'
	},
	{
		id: 9,
		name: 'Lisa',
		handle: '@lisawang',
		avatar: '',
		content: 'Wish I found this sooner.',
		timestamp: 'Using for 3 months'
	}
];

const TestimonialSection = () => {
	const [scrollProgress, setScrollProgress] = useState(0);
	const sectionRef = useRef<HTMLElement>(null);
	const mobileTestimonialRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (!mobileTestimonialRef.current) return;

			const element = mobileTestimonialRef.current;
			const rect = element.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			// Calculate progress based on element position in viewport
			const elementTop = rect.top;
			const elementHeight = rect.height;
			const startOffset = windowHeight * 0.85; // Start when element is closer to viewport
			const endOffset = windowHeight * 0.3; // End when element is 30% from top

			let progress = 0;
			if (elementTop <= startOffset && elementTop >= endOffset - elementHeight) {
				const totalDistance = startOffset - endOffset + elementHeight;
				progress = Math.max(0, Math.min(1, (startOffset - elementTop) / totalDistance));
				// Make the animation more snappy with an easing function
				progress = Math.pow(progress, 0.7); // Easing for snappier feel
			} else if (elementTop < endOffset - elementHeight) {
				progress = 1;
			}

			setScrollProgress(progress);
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial calculation

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const featuredTestimonial = testimonials[1]; // Marcus's testimonial
	const words = featuredTestimonial.content.split(' ');

	return (
		<section
			ref={sectionRef}
			className="py-8 md:py-12 bg-gradient-subtle relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
			<div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-40 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-10 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

			<div className="container mx-auto px-6 relative z-10">
				{/* Desktop-only title */}
				<div className="hidden md:block text-center mb-8 animate-fade-in">
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
						<span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-sm">
							Loved by beta users
						</span>
					</h2>
				</div>

				{/* Mobile-only large testimonial */}
				<div className="block md:hidden">
					<div
						ref={mobileTestimonialRef}
						className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
						<div className="max-w-md mx-auto text-center relative">
							<div className="text-5xl sm:text-6xl font-bold leading-tight mb-12 tracking-tight relative">
								<span className="text-8xl opacity-20 absolute -left-8 -top-4">"</span>
								{words.map((word, index) => {
									const totalWords = words.length;
									const wordProgress = Math.max(
										0,
										Math.min(1, scrollProgress * totalWords * 1.5 - index)
									);
									const opacity = 0.2 + wordProgress * 0.8; // From 20% to 100% opacity

									return (
										<span key={index}>
											<span
												className="inline-block transition-opacity duration-800 ease-out"
												style={{
													opacity,
													color: `hsl(var(--foreground) / ${opacity})`
												}}>
												{word}
											</span>
											{index < words.length - 1 && ' '}
										</span>
									);
								})}
								<span className="text-8xl opacity-20 absolute -right-8 -bottom-4">"</span>
							</div>
							<div
								className="text-sm transition-opacity duration-500"
								style={{
									opacity: Math.max(0.4, scrollProgress),
									color: `hsl(var(--muted-foreground) / ${Math.max(0.6, scrollProgress)})`
								}}>
								<div className="font-medium">{featuredTestimonial.name}</div>
								<div className="text-xs mt-1">{featuredTestimonial.timestamp}</div>
							</div>
						</div>
					</div>
				</div>

				{/* Desktop masonry layout */}
				<div
					className="relative max-w-5xl mx-auto hidden md:block"
					style={{ height: '400px', overflow: 'hidden' }}>
					<div
						className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4 h-full"
						style={{
							maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
							WebkitMaskImage:
								'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
						}}>
						{testimonials.map((testimonial) => {
							const avatarVariant =
								avatarVariants[(testimonial.id - 1) % avatarVariants.length];
							const IconComponent = avatarVariant.icon;

							return (
								<div
									key={testimonial.id}
									className="bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors break-inside-avoid mb-4">
									<div className="flex items-start space-x-3">
										<div
											className={`w-10 h-10 rounded-full ${avatarVariant.bgColor} flex items-center justify-center flex-shrink-0`}>
											<IconComponent className={`w-5 h-5 ${avatarVariant.iconColor}`} />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-1 mb-1">
												<h4 className="font-medium text-foreground text-sm">
													{testimonial.name}
												</h4>
												<span className="text-muted-foreground text-xs">·</span>
												<span className="text-muted-foreground text-xs">
													{testimonial.timestamp}
												</span>
											</div>
											<p className="text-foreground text-sm leading-relaxed">
												{testimonial.content}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialSection;
