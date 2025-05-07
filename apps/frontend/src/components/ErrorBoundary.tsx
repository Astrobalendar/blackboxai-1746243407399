import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    console.error("❌ ErrorBoundary caught an error:", {
      error: error,
      errorDetails,
      componentStack: errorInfo.componentStack,
      timestamp: errorDetails.timestamp,
      // Add more context
      routePath: window.location.pathname,
      routeParams: new URLSearchParams(window.location.search).toString()
    });

    // Log to console for debugging
    console.error("❌ Detailed Error Info:", {
      error: error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      message: error.message,
      stack: error.stack,
      location: window.location.href
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo: errorDetails.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.errorInfo}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
