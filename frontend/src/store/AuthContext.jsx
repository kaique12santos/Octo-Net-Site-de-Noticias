import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthServices } from "../services/AuthServices";

// Criação do Contexto
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  // Função para checar as regras de negócio do perfil
  const checkProfileCompletion = (userData) => {
    if (!userData) {
      setIsProfileIncomplete(false);
      return;
    }

    // 1. Array com as roles que exigem dados completos
    const restrictedRoles = ["reader", "editor", "admin", "super_admin"];
    const needsFullProfile = restrictedRoles.includes(userData.role);

    // 2. Checa se algum campo obrigatório está ausente ou nulo
    const isMissingData = !userData.cpf || !userData.cep;

    // 3. Atualiza o estado global
    if (needsFullProfile && isMissingData) {
      setIsProfileIncomplete(true);
    } else {
      setIsProfileIncomplete(false);
    }
  };

  // Função central para buscar e setar o usuário
  const loadUser = async () => {
    setLoading(true);
    const userData = await AuthServices.getCurrentUserProfile();
    setUser(userData);
    checkProfileCompletion(userData);
    setLoading(false);
  };

  // Executa ao carregar a aplicação
  useEffect(() => {
    loadUser();
  }, []);

  // Atualiza o contexto após o usuário salvar o formulário no Perfil.jsx
  const refreshUser = async () => {
    await loadUser();
  };

  // Função de Login 
  const login = async (email, password) => {
    const { data, error } = await AuthServices.signInWithEmail(email, password);
    if (!error) {
      await loadUser(); // Carrega o perfil do backend após autenticar no Supabase
    }
    return { data, error };
  };

  // Função de Logout
  const logout = async () => {
    await AuthServices.signOut();
    setUser(null);
    setIsProfileIncomplete(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isProfileIncomplete,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do Contexto nos componentes
export const useAuth = () => {
  return useContext(AuthContext);
};