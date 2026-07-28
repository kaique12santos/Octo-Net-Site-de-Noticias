import { supabase } from "@/lib/supabase";
import {api} from "@/services/api";

export const AuthServices = {
  // Cadastro tradicional via e-mail e senha
  async signUpWithEmail(email, password, name) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: name, 
        },
      },
    });
  },

  // Login tradicional via e-mail e senha
  async signInWithEmail(email, password) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Login/Cadastro via Google OAuth
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  },

  // Encerramento de sessão
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Busca o usuário logado atualmente
  async getCurrentUser() {
    return await supabase.auth.getUser();
  },

  // Solicita o link de redefinição de senha (envia e-mail)
  async requestPasswordReset(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetsenha`, 
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  },

  // Atualiza a senha do usuário logado
  async updateUserPassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  },
  // Busca o perfil completo do usuário logado, incluindo dados do backend
  async getCurrentUserProfile() {
    try {
      // 1. Verifica se há uma sessão ativa no Supabase local
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return null;

      // 2. Busca o perfil completo e validado
      const response = await api.get('/api/profile/me');
      console.log("Perfil do usuário logado:", response.data);
      return response.data; 

    } catch (error) {
      console.error("Erro ao buscar perfil do backend:", error);
      return null;
    }
  },
  // Atualiza os dados do perfil
  async updateUserProfile(profileData) {
    try {
      const response = await api.patch('/api/profile/me', profileData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { 
        data: null, 
        error: error.response?.data?.message || "Falha ao atualizar os dados. Tente novamente." 
      };
    }
  },
};