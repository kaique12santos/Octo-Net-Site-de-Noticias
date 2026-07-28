import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas de Autenticação
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import ResetSenha from "./pages/auth/ResetSenha";

// Páginas do Sistema
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";

// Arquitetura de Layouts e Segurança
import PortalLayout from "./layout/PortalLayout";
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==============================================================
            ROTAS DO PORTAL (Públicas e Leitores)
            A raiz do site agora é a vitrine de notícias.
        ============================================================== */}
        <Route element={<PortalLayout />}>
          <Route path="/" element={<Home />} />
          {/* Se alguém digitar /home por costume, redireciona para a raiz limpa */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Futuras rotas públicas entram aqui: */}
          {/* <Route path="/noticia/:slug" element={<LerNoticia />} /> */}
          {/* <Route path="/:editoria" element={<ListaNoticias />} /> */}
        </Route>

        {/* ==============================================================
            ROTAS LIVRES (Login, Cadastro, Esqueceu Senha)
            Ocupam a tela toda, acionadas quando o usuário quer interagir.
        ============================================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/resetsenha" element={<ResetSenha />} />

        {/* ==============================================================
            ROTAS COMUNS PARA TODOS OS LOGADOS (User)
            Ocupam a tela toda (Focus Mode).
        ============================================================== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* ==============================================================
            ROTAS ADMINISTRATIVAS (Somente Staff)
            Protegidas pela Role e usam o AdminLayout (Sidebar)
        ============================================================== */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["editor", "redator", "admin", "super_admin"]}
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/nova-noticia" element={<CriarNoticia />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
