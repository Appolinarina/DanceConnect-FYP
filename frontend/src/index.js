import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DanceClassesContextProvider } from './context/DanceClassContext';
import { AuthContextProvider } from './context/AuthContext';
import { ToastContextProvider } from "./context/ToastContext";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ToastContextProvider>
        <DanceClassesContextProvider>
          <App />
        </DanceClassesContextProvider>
      </ToastContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
