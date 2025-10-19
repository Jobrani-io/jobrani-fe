import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
	{
		id: 1,
		question: 'Is Jobrani ready to use now?',
		answer:
			"Yes! We're currently in private beta — you get early access to all features while we fine-tune the experience based on feedback."
	},
	{
		id: 2,
		question: 'How much does Jobrani cost?',
		answer:
			"Right now, Jobrani is free to use while we're in beta. We're planning to launch with plans starting at $8.99/week, with optional monthly plans available — but early users get full access at no cost while in beta."
	},
	{
		id: 3,
		question: 'Do I need a LinkedIn account to use Jobrani?',
		answer:
			'Yes. Jobrani automates your LinkedIn outreach — finding hiring managers, writing messages, and tracking responses — so an active LinkedIn account is required.'
	},
	{
		id: 4,
		question: 'Will Jobrani apply to jobs for me?',
		answer:
			"Yes — but not the way you're used to. Cold applying alone doesn't cut it. Jobrani helps you reach decision-makers directly, while also submitting formal apps when needed."
	},
	{
		id: 5,
		question: 'How many hiring managers can I reach each week?',
		answer:
			'Up to 100+ per week, all through LinkedIn — personalized, automated, and reviewed by you before sending.'
	},
	{
		id: 6,
		question: 'Will Jobrani send anything without my approval?',
		answer:
			"Nope. Every message is drafted by AI — but you review, edit, and approve before anything is sent. You're always in control of what goes out, so nothing happens without your sign-off."
	}
];

const FAQSection = () => {
	const [openFAQ, setOpenFAQ] = useState<number | null>(null);

	const toggleFAQ = (id: number) => {
		setOpenFAQ(openFAQ === id ? null : id);
	};

	return (
		<section
			className="py-8 md:py-16 relative"
			style={{
				background:
					'linear-gradient(to bottom, hsl(var(--gradient-subtle)), hsl(var(--background)) 30%, hsl(var(--background)) 70%, hsl(var(--gradient-subtle)))'
			}}>
			<div className="container mx-auto px-4 md:px-6 relative">
				<div className="text-center mb-8 md:mb-12 animate-fade-in">
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight">
						<span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-sm">
							Your questions,
							<br />
							answered.
						</span>
					</h2>
				</div>

				<div className="max-w-4xl mx-auto space-y-2 md:space-y-3">
					{faqs.map((faq, index) => (
						<div
							key={faq.id}
							className={`group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-elegant hover-scale ${
								openFAQ === faq.id ? 'border-primary/40 shadow-glow bg-card' : ''
							}`}
							style={{
								animationDelay: `${index * 100}ms`
							}}>
							<button
								onClick={() => toggleFAQ(faq.id)}
								className="w-full px-4 md:px-6 py-3 md:py-4 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 group">
								<h3 className="text-base md:text-lg font-bold text-foreground pr-4 md:pr-6 group-hover:text-primary transition-colors duration-300">
									{faq.question}
								</h3>
								<div
									className={`transition-all duration-300 ${
										openFAQ === faq.id
											? 'rotate-180 text-primary'
											: 'text-muted-foreground group-hover:text-primary'
									}`}>
									<ChevronDown className="w-5 h-5 flex-shrink-0" />
								</div>
							</button>

							{openFAQ === faq.id && (
								<div className="px-4 md:px-6 pb-3 md:pb-4 animate-accordion-down">
									<div className="pt-2 border-t border-border/30">
										<p className="text-sm md:text-base text-muted-foreground leading-relaxed">
											{faq.answer}
										</p>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
