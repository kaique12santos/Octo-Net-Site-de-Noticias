import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthServices } from "@/services/AuthServices";

export default function PortalLayout() {

  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await AuthServices.getCurrentUserProfile();
      if (data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await AuthServices.signOut();
    setProfile(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810] text-slate-200 font-sans">

      {/* ==========================================
          TOP BAR (Ticker Ao Vivo)
      ========================================== */}
      <div className="bg-[#050810] border-b border-slate-800 flex items-center text-xs overflow-hidden h-8">
        <div className="bg-cyan-500 text-[#050810] font-bold px-4 py-1 h-full flex items-center shrink-0">
          <span className="animate-pulse mr-2">●</span> AO VIVO
        </div>
        <div className="text-slate-400 whitespace-nowrap px-4 animate-[marquee_30s_linear_infinite] flex gap-4">
          <span>OCTO-AI detecta padrão inédito em dados climáticos</span>
          <span>•</span>
          <span>Startup brasileira capta R$ 400M em rodada Série B</span>
          <span>•</span>
          <span>NASA confirma missão lunar para 2027</span>
          <span>•</span>
          <span>ChatGPT atinge 1 bilhão de usuários ativos</span>
        </div>
      </div>

      {/* ==========================================
          HEADER PRINCIPAL
      ========================================== */}
      <header className="bg-[#050810] border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center w-full">

          {/* Logo */}
          <Link to="/home" className="flex-shrink-0">
            <img
              src="/src/public/octo_news_logo.png"
              alt="Octo-News"
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback em texto caso a imagem não carregue
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="hidden text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              OCTO-NEWS
            </span>
          </Link>

          {/* Navegação Principal (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link to="/tecnologia" className="hover:text-white transition-colors">Tecnologia</Link>

            {/* Exemplo de link ativo (IA) com base no protótipo */}
            <Link to="/ia" className="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded transition-colors hover:bg-purple-500/20">
              IA
            </Link>

            <Link to="/educacao" className="hover:text-white transition-colors">Educação</Link>
            <Link to="/ciencia" className="hover:text-white transition-colors">Ciência</Link>
            <Link to="/negocios" className="hover:text-white transition-colors">Negócios</Link>
            <Link to="/mundo" className="hover:text-white transition-colors">Mundo</Link>
          </nav>

          {/* Ações (Busca, Avatar e Login) */}
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-cyan-400 transition-colors">
              <Search size={20} />
            </button>

            {/* Renderização Condicional: Se tem perfil, mostra Avatar. Se não, mostra botão Entrar */}
            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <img
                    src={profile.avatar_url || "https://github.com/shadcn.png"}
                    alt="Avatar do Usuário"
                    className="h-10 w-10 rounded-full border border-slate-700 hover:border-cyan-400 transition-colors object-cover cursor-pointer"
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-[#121620] border-slate-800 text-slate-200 mt-2">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-100">{profile.nome || "Usuário"}</p>
                      <p className="text-xs text-slate-500 leading-none truncate">{profile.email}</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-slate-800" />

                  {/* Exibe o atalho do Dashboard SOMENTE para o Staff */}
                  {['redator', 'editor', 'admin', 'super_admin'].includes(profile.role) && (
                    <DropdownMenuItem asChild className="hover:bg-slate-800 hover:text-cyan-400 focus:bg-slate-800 focus:text-cyan-400 cursor-pointer">
                      <Link to="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Painel Corporativo
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Menu do usuário comum */}
                  <DropdownMenuItem asChild className="hover:bg-slate-800 hover:text-cyan-400 focus:bg-slate-800 focus:text-cyan-400 cursor-pointer">
                    <Link to="/perfil" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-800" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="border border-slate-700 text-slate-300 px-5 py-2 rounded font-medium text-sm hover:bg-slate-800 hover:text-white transition-all"
              >
                Entrar
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ==========================================
          CONTEÚDO DINÂMICO (Outlet)
      ========================================== */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <Outlet />
      </main>

      {/* ==========================================
          FOOTER ROBUSTO
      ========================================== */}
      <footer className="bg-[#080C16] border-t border-slate-800 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Coluna 1: Branding e Redes */}
          <div className="md:col-span-2 space-y-6">
            <span className="flex flex-col gap-2">
              <img
                src="/src/public/octo_news_wordmark.png"
                alt="Octo News"
                className="mr-auto h-12 w-2/3"
              />
            </span>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Jornalismo inteligente para a era da informação. Uma IA organiza o caos. Você consome o essencial.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 border border-slate-800 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="p-2 border border-slate-800 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="p-2 border border-slate-800 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Coluna 2: Editorias */}
          <div className="space-y-4">
            <h4 className="text-slate-200 text-xs font-bold tracking-widest uppercase mb-6">Editorias</h4>
            <nav className="flex flex-col gap-3 text-sm text-slate-400">
              <Link to="/tecnologia" className="hover:text-cyan-400 transition-colors">Tecnologia</Link>
              <Link to="/ia" className="hover:text-cyan-400 transition-colors">IA</Link>
              <Link to="/educacao" className="hover:text-cyan-400 transition-colors">Educação</Link>
              <Link to="/ciencia" className="hover:text-cyan-400 transition-colors">Ciência</Link>
              <Link to="/negocios" className="hover:text-cyan-400 transition-colors">Negócios</Link>
              <Link to="/mundo" className="hover:text-cyan-400 transition-colors">Mundo</Link>
            </nav>
          </div>

          {/* Coluna 3: Institucional */}
          <div className="space-y-4">
            <h4 className="text-slate-200 text-xs font-bold tracking-widest uppercase mb-6">Institucional</h4>
            <nav className="flex flex-col gap-3 text-sm text-slate-400">
              <Link to="/sobre" className="hover:text-cyan-400 transition-colors">Sobre</Link>
              <Link to="/manifesto" className="hover:text-cyan-400 transition-colors">Manifesto</Link>
              <Link to="/privacidade" className="hover:text-cyan-400 transition-colors">Privacidade</Link>
              <Link to="/termos" className="hover:text-cyan-400 transition-colors">Termos</Link>
              <Link to="/anuncie" className="hover:text-cyan-400 transition-colors">Anuncie</Link>
              <Link to="/contato" className="hover:text-cyan-400 transition-colors">Contato</Link>
            </nav>
          </div>

        </div>

        {/* Rodapé / Copyright */}
        <div className="max-w-7xl mx-auto px-6 w-full border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} Octo-News. Todos os direitos reservados.</p>
          <p className="tracking-widest uppercase">Jornalismo Inteligente • Informação em Tempo Real</p>
        </div>
      </footer>

    </div>
  );
}