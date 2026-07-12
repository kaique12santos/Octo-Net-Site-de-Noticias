import React, { useEffect, useState } from "react";
import { AuthServices } from "@/services/AuthServices";
import { api } from "@/services/api"; // Importe a API configurada
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [backendData, setBackendData] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Pega os dados básicos da sessão local
      const { data: { user } } = await AuthServices.getCurrentUser();
      setUser(user);

      if (user) {
        // 2. Dispara a requisição para a rota protegida do backend
        try {
          const response = await api.get('/api/profile/me');
          setBackendData(response.data);
        } catch (error) {
          // Se o middleware barrar (Erro 401), vai cair aqui
          setApiError(error.response?.data?.message || "Erro de conexão com o backend");
        }
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await AuthServices.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#080A12] flex flex-col justify-center items-center p-4 text-slate-50">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold text-indigo-400">Painel do Octo News</h1>
        
        {/* Mostra dados locais do Supabase */}
        {user && (
          <div className="bg-slate-950 p-4 rounded text-left border border-slate-800 text-sm">
            <p className="text-slate-400">Sessão Local:</p>
            <p className="text-green-400">{user.email}</p>
          </div>
        )}

        {/* Mostra a resposta do Backend Python */}
        <div className="bg-slate-950 p-4 rounded text-left border border-slate-800 text-sm mt-4">
            <p className="text-slate-400">Resposta da API (FastAPI):</p>
            {backendData ? (
                <div className="text-emerald-400 mt-2 space-y-1 font-mono">
                    <p>Status: {backendData.message}</p>
                    <p>Role: {backendData.role}</p>
                    <p className="truncate">ID: {backendData.user_id}</p>
                </div>
            ) : apiError ? (
                <p className="text-red-400 mt-2 font-mono">Status: 401 - {apiError}</p>
            ) : (
                <p className="text-yellow-400 mt-2 font-mono">Carregando...</p>
            )}
        </div>

        <Button onClick={handleLogout} variant="destructive" className="w-full font-semibold">
          Sair (Logout)
        </Button>
      </div>
    </div>
  );
}