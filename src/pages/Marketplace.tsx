import Header from "@/components/Header";

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
          <p className="text-muted-foreground mb-8">
            Discover and access premium job search tools and services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Premium Templates</h3>
              <p className="text-muted-foreground">
                Access exclusive message templates crafted by industry experts.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Career Coaching</h3>
              <p className="text-muted-foreground">
                Get personalized career advice and job search strategy sessions.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Resume Review</h3>
              <p className="text-muted-foreground">
                Professional resume review and optimization services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;