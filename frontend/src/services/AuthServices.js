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

  // Solicita a redefinição de senha enviando um e-mail com o token
  async requestPasswordReset(email) {
    try {
      // Consome a rota do FastAPI que criamos (enviando o JSON esperado)
      const response = await api.post('/auth/forgot-password', { email });
      return { data: response.data, error: null };
    } catch (error) {
      console.error("Erro ao solicitar reset:", error);
      return { 
        data: null, 
        error: error.response?.data?.message || "Erro ao solicitar a redefinição de senha." 
      };
    }
  },

  // Redefine a senha usando o token recebido por e-mail
  async resetPasswordWithToken(token, newPassword) {
    try {
      // Consome a rota do FastAPI enviando o token e a "nova_senha"
      const response = await api.post('/auth/reset-password', {
        token: token,
        nova_senha: newPassword
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      return { 
        data: null, 
        error: error.response?.data?.message || "Código inválido ou expirado." 
      };
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