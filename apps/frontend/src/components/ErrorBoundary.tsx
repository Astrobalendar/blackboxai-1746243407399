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
    // Log full error details
    console.error("🔥 FULL ERROR:", {
      error: error,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      location: window.location.href,
      route: window.location.pathname,
      params: new URLSearchParams(window.location.search).toString(),
      userAgent: navigator.userAgent
    });

    // Log error info separately
    console.error("🧠 ERROR INFO:", {
      errorInfo,
      componentStack: errorInfo.componentStack,
      fileName: errorInfo.componentStack?.split('\n')[0]?.split('(')[1]?.split(':')[0]
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      hasError: true,
      errorInfo: `Error: ${error.message}\nStack: ${error.stack || 'No stack trace available'}`
    });
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
