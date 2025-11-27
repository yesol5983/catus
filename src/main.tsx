import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

// 에러를 화면에 표시하는 함수
const showError = (error: unknown) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; background: white;">
        <h2>Error:</h2>
        <pre style="white-space: pre-wrap; word-break: break-all;">${error instanceof Error ? error.message : String(error)}</pre>
        <pre style="white-space: pre-wrap; word-break: break-all; font-size: 12px;">${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
};

try {
  // Security initialization 건너뛰기 (Capacitor 앱에서 문제 발생)
  // initializeSecurity();

  // Create QueryClient instance
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
} catch (error) {
  showError(error);
}

// 전역 에러 핸들러
window.onerror = (message, source, lineno, colno, error) => {
  showError(`${message}\n\nSource: ${source}\nLine: ${lineno}`);
};

window.onunhandledrejection = (event) => {
  showError(`Unhandled Promise: ${event.reason}`);
};
