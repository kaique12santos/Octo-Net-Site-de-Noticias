import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  PenLine, 
  Files, 
  Users, 
  ShieldAlert,
  Bell, 
  Settings, 
  LogOut,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/store/AuthContext.jsx";

// Configuração centralizada do menu lateral
const SIDEBAR_MENU = [
  {
    title: "Início",
    path: "/dashboard",
    icon: LayoutGrid,
    allowedRoles: ["redator", "editor", "admin", "super_admin"]
  },
  {
    title: "Escrever Notícia",
    path: "/nova-noticia",
    icon: PenLine,
    allowedRoles: ["redator", "editor", "admin", "super_admin"]
  },
  {
    title: "Minhas Publicações",
    path: "/minhas-noticias",
    icon: Files,
    allowedRoles: ["redator", "editor", "admin", "super_admin"]
  },
  {
    title: "Gerenciar Usuários",
    path: "/usuarios",
    icon: Users,
    allowedRoles: ["admin", "super_admin"] 
  },
  {
    title: "Logs do Sistema",
    path: "/auditoria",
    icon: ShieldAlert,
    allowedRoles: ["super_admin"] 
  }
];

export default function AdminLayout() {
  // 1. Otimização: Consome o 'user' e o 'logout' diretamente do contexto
  const { user: userProfile, isProfileIncomplete, loading, logout } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation(); // <-- Para saber a rota atual

  const handleLogout = async () => {
    await logout(); // Usa a função do contexto que já limpa os estados
    navigate("/login");
  };

  // Se ainda estiver carregando o perfil do contexto, mostra tela vazia
  if (loading || !userProfile) return <div className="min-h-screen bg-[#0E121A]"></div>;

  // Filtra o menu com base na role do usuário atual
  const filteredMenu = SIDEBAR_MENU.filter(item => 
    item.allowedRoles.includes(userProfile.role)
  );

  // Verifica se o usuário precisa preencher os dados, mas esconde o alerta se ele JÁ ESTIVER na página de perfil
  const showBlockingModal = isProfileIncomplete && location.pathname !== "/perfil";

  return (
    <div className="min-h-screen flex bg-[#0B0E14] text-slate-200 font-sans relative">
      
      {/* ==========================================
          MODAL DE BLOQUEIO GLOBAL
      ========================================== */}
      {showBlockingModal && (
        <div className="absolute inset-0 z-50 bg-[#0B0E14]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-slate-700 rounded-xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
            <div className="h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="text-yellow-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">Ação Necessária</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Para garantir a segurança e o padrão corporativo, você precisa completar os dados do seu perfil (CPF e Endereço) antes de acessar o painel.
            </p>
            <button
              onClick={() => navigate("/perfil")}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Completar Meu Perfil Agora
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          SIDEBAR (Barra Lateral Esquerda)
      ========================================== */}
      <aside className="w-64 bg-[#121620] border-r border-slate-800 flex flex-col justify-between z-10">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
             <span className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
               OCTO-NEWS
             </span>
          </div>

          {/* Navegação Dinâmica */}
          <nav className="flex flex-col mt-6 gap-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-cyan-400 bg-cyan-400/5 border-l-2 border-cyan-400"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.title}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Botão de Sair */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md w-full transition-colors"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* ==========================================
          ÁREA PRINCIPAL (Header + Conteúdo)
      ========================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Corporativo */}
        <header className="h-20 flex items-center justify-end px-8 bg-[#121620] border-b border-slate-800 gap-6 z-10">
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-cyan-400 transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={() => navigate("/perfil")} className="hover:text-cyan-400 transition-colors">
              <Settings size={20}  />
            </button>
          </div>

          <div className="w-px h-8 bg-slate-700"></div>

          {/* Perfil do Usuário */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-200">{userProfile.nome || "Usuário"}</p>
              <p className="text-xs text-slate-500 capitalize">{userProfile.role?.replace("_", " ")}</p>
            </div>
            <img 
              src={userProfile.avatar_url || "https://github.com/shadcn.png"} 
              alt="Avatar" 
              className="h-10 w-10 rounded-full border border-slate-700 object-cover"
            />
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-grow p-8 overflow-auto bg-[#0B0E14] relative">
          <div className="max-w-5xl mx-auto">
             <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}