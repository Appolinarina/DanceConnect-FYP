import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DanceClassesContextProvider } from './context/DanceClassContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DanceClassesContextProvider>
      <App />
    </DanceClassesContextProvider>
  </React.StrictMode>
);
