import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui';

/**
 * Route-level error boundary. Keeps one bad screen from blanking the app and
 * shows the real error, which matters in a demo you are walking people through.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Beyond the Crease crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4 py-24 text-center">
          <span className="sticker bg-pomelo-soft text-ink">Something broke</span>
          <h1 className="max-w-xl font-display text-display-sm text-balance text-body">
            This screen hit an error. The rest of the app is fine.
          </h1>
          <p className="max-w-prose font-body text-sm text-muted">
            {this.state.error.message}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => this.setState({ error: null })}>Try the screen again</Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              Back to the feed
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}