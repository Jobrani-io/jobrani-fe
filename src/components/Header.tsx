import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = () => {
	const scrollToHeroAndExpand = () => {
		window.location.href = '/signup';
	};
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<header
			className={`sticky top-0 z-50 w-full backdrop-blur-sm transition-all duration-300 ${
				isScrolled ? '' : 'bg-gradient-subtle'
			}`}>
			<div className="container mx-auto px-6 py-2">
				<div className="flex items-center justify-between">
					<Link to="/">
						<img
							src="/lovable-uploads/842cbe3a-c994-426d-a877-1d4a7bdf2ea8.png"
							alt="Jobrani"
							className="h-12 w-auto hover:opacity-80 transition-opacity cursor-pointer"
						/>
					</Link>

					<nav className="flex items-center gap-4">
						<Link to="/login">
							<Button variant="ghost" className="text-foreground hover:text-primary">
								Login
							</Button>
						</Link>
						<Button
							variant="default"
							className="bg-primary hover:bg-primary/90"
							onClick={scrollToHeroAndExpand}>
							Get Started
						</Button>
					</nav>
				</div>
			</div>
		</header>
	);
};

export default Header;
