import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
// Substitua pelo seu método real de buscar o perfil do usuário (Supabase ou seu Backend FastAPI)
import { AuthServices } from "@/services/AuthServices"; 

export default function ProtectedRoute({ allowedRoles }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        // Exemplo: Fazendo a requisição para o seu FastAPI em /api/profile/me
        // que configuramos e validamos com sucesso anteriormente.
        const response = await AuthServices.getCurrentUserProfile();
        
        if (response && response.role) {
          setRole(response.role);
        }
      } catch (error) {
        console.error("Usuário não autenticado ou token inválido.", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080A12] flex items-center justify-center text-slate-300">
        <span className="animate-pulse">Validando acesso...</span>
      </div>
    );
  }

  // Se não tem role, não está logado. Manda pro login.
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Se tem role, mas ela não está na lista de permitidas para esta rota. Manda pra home.
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  // Se passou por tudo, renderiza as rotas filhas (Outlet)
  return <Outlet />;
}