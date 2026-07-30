import axios from 'axios';
import { supabase } from '@/lib/supabase';

// Cria a instância apontando para o seu FastAPI
export const api = axios.create({
  baseURL: 'http://localhost:8000', // Ajuste para a porta que seu Uvicorn roda
});

// Interceptador: Antes de qualquer requisição sair, ele injeta o token
api.interceptors.request.use(async (config) => {
  // Pega a sessão atual do Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  // Se o usuário estiver logado, anexa o token no padrão Bearer
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});