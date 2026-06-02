"use client";

import { AnimatePresence, m } from "framer-motion";
import { AlertCircle, ArrowLeft, Bug, Home, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  locale?: string;
  message?: string;
  name?: string;
  resetKeys?: Array<unknown>;
  title?: string;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { error, hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ErrorBoundary] Error in ${this.props.name || "Component"}:`,
      error,
      errorInfo,
    );
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && this.props.resetKeys) {
      if (
        prevProps.resetKeys &&
        (this.props.resetKeys.length !== prevProps.resetKeys.length ||
          this.props.resetKeys.some(
            (key, index) => key !== prevProps.resetKeys![index],
          ))
      ) {
        this.setState({ error: null, hasError: false });
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-red-50/20 backdrop-blur-md border border-red-500/10 rounded-3xl">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-red-900 mb-2">
              {this.props.title || "Cosmic Anomaly"}
            </h3>
            <p className="text-sm text-red-700/70 max-w-xs mx-auto mb-6">
              {this.props.message ||
                "The flow of energy was interrupted in this sector."}
            </p>
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-black shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
              onClick={() => this.setState({ error: null, hasError: false })}
            >
              RECALIBRATE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary HOC with full localization support
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: { message?: string; title?: string },
) {
  const wrappedName = Component.displayName || Component.name || "Component";

  return function WrappedComponent(props: P) {
    const t = useTranslations("errorPage");

    return (
      <ErrorBoundary
        fallback={
          <m.div
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-xl border border-green-200 rounded-[4rem] text-center shadow-2xl shadow-green-900/5"
            initial={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
              <AlertCircle className="relative w-16 h-16 text-green-900/40" />
            </div>

            <h3 className="text-3xl font-black italic text-green-950 mb-3 tracking-tighter">
              {options?.title || t("500.title")}
            </h3>

            <p className="text-base text-green-800 max-w-sm mx-auto mb-10 leading-relaxed">
              {options?.message || t("500.description")}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                className="group flex items-center gap-2 px-8 py-3 bg-green-950 text-white rounded-full text-sm font-bold shadow-xl shadow-green-900/20 hover:bg-green-900 transition-all active:scale-95"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                {t("500.retry")}
              </button>

              <button
                className="flex items-center gap-2 px-8 py-3 bg-white border border-green-200 text-green-950 rounded-full text-sm font-bold hover:bg-green-50 transition-all active:scale-95"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="w-4 h-4" />
                {t("homeButton") || "Go Home"}
              </button>
            </div>
          </m.div>
        }
        name={wrappedName}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
