import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
	siAmericanexpress,
	siClickup,
	siDatadog,
	siMeta,
	siNetflix,
	siSalesforce,
	siZillow
} from 'simple-icons';

const companies = [
	{ name: 'Meta', icon: siMeta },
	{ name: 'Datadog', icon: siDatadog },
	{ name: 'ClickUp', icon: siClickup },
	{ name: 'American Express', icon: siAmericanexpress },
	{ name: 'Netflix', icon: siNetflix },
	{ name: 'Salesforce', icon: siSalesforce },
	{ name: 'Zillow', icon: siZillow }
];

const HeroSection = () => {
	const navigate = useNavigate();
	const { user, loading } = useAuth();

	// Create multiple copies for seamless infinite scroll
	const duplicatedCompanies = [...companies, ...companies];

	const handleStartAutomating = () => {
		navigate('/signup');
	};

	return (
		<section className="relative flex items-center bg-gradient-subtle overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
			<div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-40 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
			<div className="absolute bottom-10 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

			<div className="container mx-auto px-6 pt-4 pb-8 lg:pt-8 lg:pb-12 relative z-10">
				<div className="flex flex-col items-center pt-8 sm:pt-12">
					{/* Text Content */}
					<div className="space-y-4 animate-fade-in text-center max-w-4xl">
						<div className="space-y-3">
							<h1 className="text-5xl lg:text-6xl font-bold leading-tight">
								<span className="sm:hidden">Your Job Hunt</span>
								<span className="hidden sm:inline">Your Job Search</span>{' '}
								<br className="sm:hidden" />
								<span className="bg-gradient-hero bg-clip-text text-transparent">
									on Autopilot
								</span>
							</h1>

							<p className="text-lg text-muted-foreground leading-relaxed">
								Apply to 100 jobs/week. Jobrani handles the outreach -- personalized emails
								and LinkedIn requests, automated in one click.
							</p>
						</div>

						{/* CTA Section */}
						<div className="space-y-4 max-w-md mx-auto">
							<Button
								variant="hero"
								size="lg"
								className="w-fit text-xl px-8 py-6 animate-scale-in transition-all duration-300"
								onClick={handleStartAutomating}>
								Start Automating
							</Button>

							<p className="text-sm text-muted-foreground text-center">
								Free to start. No credit card needed.
							</p>
						</div>
					</div>
				</div>

				{/* Credibility Bar - Integrated */}
				<div className="mt-8 mb-8">
					<div className="text-center mb-6">
						<p className="text-xs text-muted-foreground/80 font-normal">
							Trusted by job seekers interviewing at companies
						</p>
					</div>

					<div className="relative overflow-hidden">
						<div className="flex animate-scroll">
							{duplicatedCompanies.map((company, index) => (
								<div key={`${company.name}-${index}`} className="flex-shrink-0 mx-3">
									<div className="flex items-center space-x-2 px-4 py-2 whitespace-nowrap">
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="currentColor"
											className="text-muted-foreground/60"
											aria-label={`${company.name} logo`}>
											<path d={company.icon.path} />
										</svg>
										<span className="text-sm font-medium text-muted-foreground/80">
											{company.name}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
