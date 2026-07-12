import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Busca os dados do usuário logado na sessão atual do navegador
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    // Encerra a sessão no Supabase e redireciona pro login
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#080A12] flex flex-col justify-center items-center p-4 text-slate-50">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg w-full max-w-md space-y-6 text-center">
        
        <h1 className="text-2xl font-bold text-indigo-400">
          Autenticação Concluída!
        </h1>
        
        <p className="text-slate-300 text-sm">
          Bem-vindo ao painel interno do Octo News. Se você está vendo esta tela, a integração com o Supabase foi um sucesso.
        </p>

        {/* Renderiza o e-mail do usuário se ele estiver logado */}
        {user && (
          <div className="bg-slate-950 p-4 rounded text-left overflow-hidden text-ellipsis border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Logado como:</p>
            <p className="font-mono text-sm text-green-400">{user.email}</p>
          </div>
        )}

        <Button 
          onClick={handleLogout} 
          variant="destructive" 
          className="w-full font-semibold"
        >
          Sair (Logout)
        </Button>

      </div>
    </div>
  );
}