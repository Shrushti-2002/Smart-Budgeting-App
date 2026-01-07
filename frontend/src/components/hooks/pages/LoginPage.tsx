import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, PieChart, FileText } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Budgeting
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Take control of your finances with intelligent expense tracking and automatic categorization
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Categorization</h3>
              <p className="text-muted-foreground text-sm">
                Automatically categorize expenses using intelligent keyword-based rules
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visual Insights</h3>
              <p className="text-muted-foreground text-sm">
                Beautiful charts and graphs to understand your spending patterns
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold mb-2">CSV Import</h3>
              <p className="text-muted-foreground text-sm">
                Import transactions from CSV files for quick bulk entry
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Connecting...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025. Built with love using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
