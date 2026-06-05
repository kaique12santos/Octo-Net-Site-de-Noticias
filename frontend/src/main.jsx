import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <h1 className="text-2xl font-semibold">Frontend pronto para o shadcn</h1>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
