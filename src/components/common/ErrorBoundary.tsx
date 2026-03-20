import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center max-w-md px-4">
                        <h1 className="font-display text-3xl text-foreground mb-4">
                            Something went wrong
                        </h1>
                        <p className="font-body text-sm text-muted-foreground mb-8">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="inline-block bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-foreground/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
