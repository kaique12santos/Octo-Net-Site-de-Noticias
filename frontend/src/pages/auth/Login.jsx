import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthServices } from "@/services/AuthServices";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await AuthServices.signInWithEmail(email, password);

    if (error) setError("Credenciais inválidas. Tente novamente.");
    else window.location.href = "/dashboard"; // Redirecionamento de sucesso

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await AuthServices.signInWithGoogle();
    if (error) setError("Erro ao conectar com o Google.");
  };

  return (
    <div className="min-h-screen bg-[#080A12] flex flex-col justify-center items-center p-4 text-slate-50">
      <div className="w-full max-w-md space-y-8">
        {/* Cabeçalho e Logo */}
        <div className="text-center">
          <img
            src="/src/public/octo_news_logo.png"
            alt="Octo News"
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-xl font-semibold">
            Uma conta para explorar o futuro. É Grátis!
          </h2>
        </div>

        {/* Formulário de E-mail/Senha */}
        <form onSubmit={handleEmailLogin} className="space-y-6 mt-8">
          {error && (
            <div className="text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-xs">
              Informe o seu e-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: @gmail, @outlook, @yahoo, etc."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-xs">
              Informe sua senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Ex: Abc123..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 h-11"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <a
              href="/esqueci-senha"
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Esqueceu a senha?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <div className="flex items-center justify-center">
            <span className="text-xs text-white">
              Novo por aqui? <a href="/cadastro" className="text-blue-400 hover:text-blue-300">Crie sua conta</a>
            </span>
          </div>
        </form>

        {/* Divisor */}
        <div className="flex items-center my-6 text-xs uppercase text-white">
          <span className="flex-grow border-t border-white"></span>
          <span className="px-2">ou</span>
          <span className="flex-grow border-t border-white"></span>
        </div>
        

        {/* Botão Google */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-white h-11 flex items-center justify-center gap-2"
        >
          <img
            src="/src/public/redes_sociais/Google-icon.svg"
            alt="Google"
            className="w-5 h-5"
          />
        </Button>
      </div>
    </div>
  );
}
