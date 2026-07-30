import React, { useEffect, useState } from "react";
import { AuthServices } from "@/services/AuthServices";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await AuthServices.getCurrentUserProfile();
      setProfile(data);
    };
    loadProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Geral</h1>
      </div>
      
      {/* Cards de Métricas e Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#121620] border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Perfil Ativo</h3>
          <p className="text-cyan-400 font-mono text-xl uppercase tracking-widest">
            {profile ? profile.role : "Carregando..."}
          </p>
        </div>

        <div className="bg-[#121620] border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Status da API</h3>
          <p className="text-emerald-400 font-mono text-xl">
            {profile ? "200 OK" : "---"}
          </p>
        </div>

        <div className="bg-[#121620] border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 text-sm font-medium mb-1">ID do Usuário</h3>
          <p className="text-slate-300 font-mono text-xs truncate mt-2">
            {profile ? profile.user_id : "..."}
          </p>
        </div>

      </div>

      {/* Exemplo de área de conteúdo */}
      <div className="bg-[#121620] border border-slate-800 p-8 rounded-xl h-64 flex items-center justify-center text-slate-500 border-dashed border-2">
        Área para gráficos ou lista rápida de matérias recentes...
      </div>
    </div>
  );
}