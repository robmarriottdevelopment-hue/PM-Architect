'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 m-12 p-12 bg-red-50 border-2 border-dashed border-red-200 rounded-[3rem] text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-red-900 mb-2">Module Exception</h2>
          <p className="text-slate-600 mb-8 max-w-md font-medium">
            The <span className="text-red-600 font-bold underline">{this.props.name}</span> encountered a fatal runtime error: 
            <br/>
            <code className="text-[10px] bg-white p-1 rounded mt-2 block border border-red-100">{this.state.error?.message || 'Unknown exception'}</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
