import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WalletProvider } from './context/WalletContext';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = 'pk_test_Zm9uZC1tdXN0YW5nLTMwLmNsZXJrLmFjY291bnRzLmRldiQ'

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <WalletProvider>
        <App />
      </WalletProvider>
    </ClerkProvider>
  </React.StrictMode>
);
