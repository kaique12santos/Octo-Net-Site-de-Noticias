import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Cadastro from './pages/auth/Cadastro';
import Dashboard from './pages/Dashboard';
import ResetSenha from './pages/auth/ResetSenha';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota padrão: redireciona para o login temporariamente */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rota da tela de Login */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/resetsenha" element={<ResetSenha />} />
        {/* <Route path="/home" element={<Home />} /> */}
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;