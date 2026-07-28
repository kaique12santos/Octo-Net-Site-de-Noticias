import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  PenLine, 
  Files, 
  Users, 
  ShieldAlert,
  Bell, 
  Settings, 
  LogOut 
} from "lucide-react";
import { AuthServices } from "@/services/AuthServices";

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
    // Apenas cargos altos veem esta opção
    allowedRoles: ["admin", "super_admin"] 
  },
  {
    title: "Logs do Sistema",
    path: "/auditoria",
    icon: ShieldAlert,
    // Apenas o super admin vê esta opção
    allowedRoles: ["super_admin"] 
  }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Busca os dados do usuário para preencher o Header e filtrar o menu
    const fetchProfile = async () => {
      const response = await AuthServices.getCurrentUserProfile();
      if (response) {
        setUserProfile(response);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AuthServices.signOut(); // Seu método de deslogar
    navigate("/login");
  };

  // Se ainda não carregou o perfil, mostra tela vazia ou skeleton
  if (!userProfile) return <div className="min-h-screen bg-[#0E121A]"></div>;

  // Filtra o menu com base na role do usuário atual
  const filteredMenu = SIDEBAR_MENU.filter(item => 
    item.allowedRoles.includes(userProfile.role)
  );

  return (
    <div className="min-h-screen flex bg-[#0B0E14] text-slate-200 font-sans">
      
      {/* ==========================================
          SIDEBAR (Barra Lateral Esquerda)
      ========================================== */}
      <aside className="w-64 bg-[#121620] border-r border-slate-800 flex flex-col justify-between">
        
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
             {/* Substitua pela sua imagem real, mantive o texto estilizado como na imagem */}
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

        {/* Botão de Sair (Fixo no rodapé da Sidebar) */}
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
        <header className="h-20 flex items-center justify-end px-8 bg-[#121620] border-b border-slate-800 gap-6">
          
          {/* Ícones de Ação */}
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

        {/* Conteúdo Dinâmico (onde entra o formulário de criar notícia) */}
        <main className="flex-grow p-8 overflow-auto bg-[#0B0E14]">
          <div className="max-w-5xl mx-auto">
             <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
}