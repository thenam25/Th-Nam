import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary that catches unhandled errors in the component tree
 * and displays a user-friendly fallback UI instead of a blank white screen.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-lg w-full text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Đã xảy ra lỗi không mong muốn
            </h1>
            <p className="text-sm text-slate-600">
              Rất tiếc, trang web đã gặp sự cố kỹ thuật. Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ kỹ thuật.
            </p>
            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                  Chi tiết lỗi (dành cho kỹ thuật viên)
                </summary>
                <pre className="mt-2 text-xs text-red-700 bg-red-50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Thử lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lighter error boundary for section-level error isolation.
 * Catches errors within a specific section without taking down the entire page.
 */
export function SectionErrorFallback({ message = 'Không thể hiển thị nội dung này' }: { message?: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-2">
      <span className="text-2xl">🔧</span>
      <p className="text-xs text-amber-800 font-medium">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs text-amber-700 underline hover:text-amber-900 mt-1"
      >
        Tải lại trang
      </button>
    </div>
  );
}
