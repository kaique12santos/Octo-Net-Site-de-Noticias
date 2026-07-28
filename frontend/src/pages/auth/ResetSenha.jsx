import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordRequirement from "@/components/Checklist";
import { AuthServices } from "@/services/AuthServices";

export default function ResetPassword() {
  const [step, setStep] = useState("request");

  // Estados dos formulários
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Validação da senha
  const passwordsMatch = password === confirmPassword || confirmPassword === "";
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  // Verifica se o usuário chegou aqui através do link do e-mail
  useEffect(() => {
    const hash = window.location.hash;
    const query = window.location.search;

    if (hash.includes("type=recovery") || query.includes("code=")) {
      setStep("update");
    }
  }, []);

  // Função 1: Solicitar o link de recuperação
  const handleRequestLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await AuthServices.requestPasswordReset(email);

    if (error) {
      setError("Erro ao solicitar o link. Verifique o e-mail digitado.");
    } else {
      setMessage("Link de recuperação enviado! Verifique sua caixa de entrada.");
      setEmail(""); // Limpa o campo
    }

    setLoading(false);
  };

  // Função 2: Salvar a nova senha
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    if (!isPasswordValid) {
      setError("A senha deve conter no mínimo 8 caracteres, uma letra maiúscula e um número.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const { error } = await AuthServices.updateUserPassword(password);

    if (error) {
      console.log("🔥 Erro do Supabase:", error); 

      if (error.status === 422) {
        if (error.message.includes("different from the old password") || error.message.includes("same password")) {
          setError("A nova senha não pode ser igual à senha atual.");
        } else {
          setError("Senha inválida. Certifique-se de que atende aos requisitos de segurança.");
        }
      } 
      else if (error.status === 401 || error.status === 403) {
        setError("O link de redefinição expirou. Por favor, solicite um novo link.");
      } 
      else {
        setError("Ocorreu um erro ao tentar redefinir a senha. Tente novamente mais tarde.");
      }
      
      setLoading(false);
      return; 
    } else {
      setMessage("Senha alterada com sucesso! Redirecionando...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }

    setLoading(false);
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

        {/* Mensagens de Sucesso ou Erro Globais */}
        {error && (
          <div className="text-red-400 text-sm text-center font-medium bg-red-900/20 p-3 rounded border border-red-800">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-400 text-sm text-center font-medium bg-green-900/20 p-3 rounded border border-green-800">
            {message}
          </div>
        )}

        {/* CONDICIONAL: TELA 1 - Solicitar Link */}
        {step === "request" && (
          <form onSubmit={handleRequestLink} className="space-y-6 mt-8">
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
            >
              {loading ? "Enviando..." : "Solicitar link"}
            </Button>

            <div className="flex items-center justify-center pt-2">
              <a href="/login" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Voltar para o login
              </a>
            </div>
          </form>
        )}

        {/* CONDICIONAL: TELA 2 - Redefinir Senha */}
        {step === "update" && (
          <form onSubmit={handleUpdatePassword} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs">
                Informe sua nova senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 h-11 tracking-widest"
                required
                minLength={6}
              />

              <PasswordRequirement valid={hasMinLength}>
                Pelo menos 8 caracteres
              </PasswordRequirement>

              <PasswordRequirement valid={hasUppercase}>
                Uma letra maiúscula
              </PasswordRequirement>

              <PasswordRequirement valid={hasNumber}>
                Um número
              </PasswordRequirement>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300 text-xs">
                Confirmação de senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 h-11 tracking-widest"
                required
                minLength={6}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs">As senhas não coincidem.</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !passwordsMatch || !isPasswordValid}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
            >
              {loading ? "Salvando..." : "Redefinir"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}