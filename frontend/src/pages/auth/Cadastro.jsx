import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordRequirement from "@/components/Checklist";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";

import { AuthServices } from "@/services/AuthServices";

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const passwordsMatch = password === confirmPassword || confirmPassword === "";
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isPasswordValid) {
      setError(
        "A senha deve conter no mínimo 8 caracteres, uma letra maiúscula e um número.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { data, error } = await AuthServices.signUpWithEmail(email, password, name);

    if (error) setError("Erro ao criar conta. Tente novamente.");

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

      {/* Renderiza a mensagem de sucesso ou o formulário */}
      {success ? (
        <Alert className="bg-slate-900 border-emerald-500/50 mt-8 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MailCheck className="h-12 w-12 text-emerald-400 mb-2 relative static" style={{ position: 'static' }} />
            <AlertTitle className="text-emerald-400 font-semibold text-xl tracking-wide">
              Quase lá!
            </AlertTitle>
            <AlertDescription className="text-slate-300 mt-2 leading-relaxed text-sm">
              Enviamos um link de confirmação para <br />
              <strong className="text-white text-base">{email}</strong>.
              <br /><br />
              Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
            </AlertDescription>
          </Alert>
      ) : (
        <>
          <form onSubmit={handleCadastro} className="space-y-6 mt-8">
            {error && (
              <div className="text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 text-xs">
                Informe o seu nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 h-11"
                required
              />
            </div>
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
                Confirme sua senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 h-11"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs">As senhas não coincidem.</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white">
                Já tem uma conta? {" "}
                <a href="/login" className="text-blue-400 hover:text-blue-300">
                  Faça login
                </a>
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
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
        </>
      )}
      </div>
    </div>
    
  );
}
