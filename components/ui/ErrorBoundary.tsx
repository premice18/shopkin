"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-primary">Une erreur est survenue</h2>
            <p className="mt-2 text-sm text-muted">Veuillez rafraîchir la page pour continuer.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
