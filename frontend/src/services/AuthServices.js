import { supabase } from "@/lib/supabase";

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
  }
};