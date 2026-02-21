import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Result
            status="error"
            title="Terjadi Kesalahan"
            subTitle="Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi."
            extra={[
              <Button
                type="primary"
                key="reload"
                onClick={this.handleReset}
                style={{ backgroundColor: '#FA6978' }}
              >
                Muat Ulang Halaman
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                <p className="font-mono text-sm text-red-600">
                  {this.state.error.message}
                </p>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
