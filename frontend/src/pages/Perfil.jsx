import React, { useState, useEffect } from "react";
import { User, Bookmark, MessageSquare, LogOut, ShieldCheck, AlertCircle } from "lucide-react";
import { AuthServices } from "@/services/AuthServices";
import { ViaCepServices } from "@/services/ViaCepServices";
import { validarCPF } from "@/utils/validators";
import { useNavigate } from "react-router-dom";

// Componentes da UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Perfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    biografia: "",
    avatar_url: "",
    cpf: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Estados de controle e validação
  const [cepError, setCepError] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Estados dos Modais
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await AuthServices.getCurrentUserProfile();
      if (data) {
        setProfile(data);
        setFormData((prev) => ({
          ...prev,
          nome: data.nome || "",
          biografia: data.biografia || "",
          avatar_url: data.avatar_url || "",
          cpf: data.cpf || "",
          cep: data.cep || "",
          rua: data.rua || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
        }));
      }
    };
    loadProfile();
  }, []);

  const isCorporateUser = profile && ["redator", "editor", "admin", "super_admin"].includes(profile.role);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormError(""); 
    setSuccessMessage("");
    
    if (name === "cep") {
      let cepFormatado = value.replace(/\D/g, "");
      if (cepFormatado.length > 5) cepFormatado = cepFormatado.replace(/^(\d{5})(\d)/, "$1-$2");
      setFormData((prev) => ({ ...prev, [name]: cepFormatado }));
    } else if (name === "cpf") {
      let cpfFormatado = value.replace(/\D/g, "");
      cpfFormatado = cpfFormatado.replace(/(\d{3})(\d)/, "$1.$2");
      cpfFormatado = cpfFormatado.replace(/(\d{3})(\d)/, "$1.$2");
      cpfFormatado = cpfFormatado.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setFormData((prev) => ({ ...prev, [name]: cpfFormatado }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCpfBlur = (e) => {
    const cpfDigitado = e.target.value;
    if (cpfDigitado.trim() === "") {
      setCpfError("");
      return;
    }
    const isValid = validarCPF(cpfDigitado);
    setCpfError(isValid ? "" : "CPF inválido. Verifique os números digitados.");
  };

  const handleCepBlur = async (e) => {
    const cepOriginal = e.target.value;
    const cepLimpo = cepOriginal.replace(/\D/g, "");

    if (cepLimpo.length === 0) {
      setCepError("");
      setFormData(prev => ({ ...prev, rua: "", bairro: "", cidade: "", estado: "" }));
      return;
    }

    if (cepLimpo.length > 0 && cepLimpo.length < 8) {
      setCepError("CEP incompleto. Digite os 8 números.");
      setFormData(prev => ({ ...prev, rua: "", bairro: "", cidade: "", estado: "" }));
      return;
    }

    setLoadingCep(true);
    setCepError("");

    const response = await ViaCepServices.buscarEnderecoPorCep(cepLimpo);

    if (response.error) {
      setCepError(response.error);
      setFormData(prev => ({ ...prev, rua: "", bairro: "", cidade: "", estado: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        rua: response.data.rua,
        bairro: response.data.bairro,
        cidade: response.data.cidade,
        estado: response.data.estado,
      }));
      document.getElementById("numero")?.focus();
    }
    setLoadingCep(false);
  };

  // 1. Botão "Salvar" aciona a validação primeiro
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validações Base
    if (!formData.nome.trim()) {
      return setFormError("O campo Nome de Exibição é obrigatório.");
    }

    // Validações 
    if (isCorporateUser) {
      if (!formData.cpf || cpfError) return setFormError("Verifique o CPF informado.");
      if (!formData.cep || cepError) return setFormError("Verifique o CEP informado.");
      if (!formData.numero.trim()) return setFormError("O número do endereço é obrigatório.");
      if (!formData.rua || !formData.bairro || !formData.cidade || !formData.estado) {
         return setFormError("Endereço incompleto. Busque um CEP válido.");
      }
    }

    setIsSaveModalOpen(true);
  };

  // 2. Confirmação do Modal executa o envio real
  const executeSave = async () => {
    setIsSaving(true);
    
    const payload = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ""),
      cep: formData.cep.replace(/\D/g, "")
    };

    const { error } = await AuthServices.updateUserProfile(payload);
    
    setIsSaving(false);
    
    if (error) {
      setFormError(error);
    } else {
      setSuccessMessage("Perfil atualizado com sucesso!");
      setProfile((prev) => ({ ...prev, ...payload }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); 
      setFormError(""); 
      setSuccessMessage("");
    }
  };
  const handleLogout = async () => {
    await AuthServices.signOut();
    navigate("/login");
  };

  if (!profile) return <div className="min-h-screen bg-[#050810] flex items-center justify-center text-slate-400">Carregando perfil...</div>;

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 font-sans p-6 md:p-12">
      
      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minha Conta</h1>
          <p className="text-slate-400 text-sm">Gerencie suas informações pessoais e preferências.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">{profile.nome || "Usuário"}</p>
            <p className="text-xs text-slate-500 capitalize">{profile.role?.replace("_", " ")}</p>
          </div>
          <img 
            src={avatarPreview || formData.avatar_url || profile.avatar_url || "https://github.com/shadcn.png"} 
            alt="Avatar" 
            className="h-12 w-12 rounded-full border border-slate-800 object-cover"
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* SIDEBAR INTERNA */}
        <aside className="w-full md:w-64 flex flex-col gap-6 shrink-0">
          <div>
            <h3 className="text-slate-200 font-bold mb-4 px-3">Dados Pessoais</h3>
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-start text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 hover:text-cyan-300">
                <User className="mr-2 h-4 w-4" /> Meu Perfil
              </Button>
              <Button variant="ghost" disabled className="w-full justify-between text-slate-400">
                <div className="flex items-center"><Bookmark className="mr-2 h-4 w-4" /> Salvos</div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Em breve</span>
              </Button>
              <Button variant="ghost" disabled className="w-full justify-between text-slate-400">
                <div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Comentários</div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Em breve</span>
              </Button>
            </nav>
          </div>
          <Separator className="bg-slate-800" />
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <LogOut className="mr-2 h-4 w-4" /> Sair da Conta
          </Button>
        </aside>

        {/* FORMULÁRIO CENTRAL */}
        <form onSubmit={handlePreSubmit} className="flex-1 bg-[#0A0D16] border border-slate-800 rounded-xl p-8 shadow-xl">
          
          {formError && (
            <Alert variant="destructive" className="mb-6 bg-red-950/50 border-red-900">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-6 bg-emerald-950/50 border-emerald-900 text-emerald-400">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* INFORMAÇÕES PÚBLICAS */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-800 p-2 rounded-lg text-slate-300"><User size={20} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-200">Informações Públicas</h2>
                <p className="text-xs text-slate-400">Estes dados identificam você na comunidade.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-400">Nome de Exibição <span className="text-red-400">*</span></Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} className="bg-[#121620] border-slate-700 text-slate-200 focus-visible:ring-cyan-500"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar_file" className="text-slate-400">Foto de Perfil (Upload)</Label>
                  <Input 
                    id="avatar_file" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="bg-[#121620] border-slate-700 text-slate-200 focus-visible:ring-cyan-500 cursor-pointer file:border-0 file:bg-transparent file:text-cyan-400 file:font-medium file:cursor-pointer hover:file:text-cyan-300 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500">Recomendado: PNG ou JPG, tamanho quadrado.</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="biografia" className="text-slate-400">Biografia</Label>
                  <span className="text-xs text-slate-500">{formData.biografia.length} / 250</span>
                </div>
                <Textarea id="biografia" name="biografia" value={formData.biografia} onChange={handleInputChange} maxLength="250" className="bg-[#121620] border-slate-700 text-slate-200 focus-visible:ring-cyan-500 h-24 resize-none" placeholder="Escreva um pouco sobre você..."/>
              </div>
            </div>
          </section>

          {/* DADOS CORPORATIVOS */}
          {isCorporateUser && (
            <section className="mb-10 border border-purple-500/20 bg-purple-500/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><ShieldCheck size={20} /></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-200">Dados Corporativos</h2>
                  <p className="text-xs text-slate-400">Obrigatórios para publicação de conteúdo.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-slate-400">CPF <span className="text-red-400">*</span></Label>
                  <Input id="cpf" type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} onBlur={handleCpfBlur} maxLength="14" className={`md:w-1/2 bg-[#121620] text-slate-200 focus-visible:ring-purple-500 ${cpfError ? 'border-red-500' : 'border-slate-700'}`} placeholder="000.000.000-00"/>
                  {cpfError && <Alert variant="destructive" className="mt-2 py-2 px-3 bg-red-950/50 border-red-900 md:w-1/2"><AlertDescription className="text-xs">{cpfError}</AlertDescription></Alert>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="cep" className="text-slate-400">CEP <span className="text-red-400">*</span></Label>
                    <Input id="cep" type="text" name="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} maxLength="9" className={`bg-[#121620] text-slate-200 focus-visible:ring-purple-500 ${cepError ? 'border-red-500' : 'border-slate-700'}`} placeholder="00000-000"/>
                    {loadingCep && <span className="text-xs text-purple-400 block animate-pulse">Buscando...</span>}
                    {cepError && <Alert variant="destructive" className="mt-2 py-2 px-3 bg-red-950/50 border-red-900"><AlertDescription className="text-xs">{cepError}</AlertDescription></Alert>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="rua" className="text-slate-400">Rua / Logradouro</Label>
                    <Input id="rua" type="text" name="rua" value={formData.rua} readOnly disabled className="bg-[#0b0e14] border-slate-800 text-slate-500 cursor-not-allowed opacity-70"/>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <Label htmlFor="numero" className="text-slate-400">Número <span className="text-red-400">*</span></Label>
                    <Input id="numero" type="text" name="numero" value={formData.numero} onChange={handleInputChange} className="bg-[#121620] border-slate-700 text-slate-200 focus-visible:ring-purple-500"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro" className="text-slate-400">Bairro</Label>
                    <Input id="bairro" type="text" name="bairro" value={formData.bairro} readOnly disabled className="bg-[#0b0e14] border-slate-800 text-slate-500 cursor-not-allowed opacity-70"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="text-slate-400">Cidade</Label>
                    <Input id="cidade" type="text" name="cidade" value={formData.cidade} readOnly disabled className="bg-[#0b0e14] border-slate-800 text-slate-500 cursor-not-allowed opacity-70"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-slate-400">Estado (UF)</Label>
                    <Input id="estado" type="text" name="estado" value={formData.estado} readOnly disabled className="bg-[#0b0e14] border-slate-800 text-slate-500 cursor-not-allowed opacity-70 uppercase"/>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ACESSO E SEGURANÇA */}
          <section className="mb-10">
             <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-800 p-2 rounded-lg text-slate-300"><AlertCircle size={20} /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-200">Acesso e Segurança</h2>
                <p className="text-xs text-slate-400">Gerencie o seu acesso ao portal.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 w-full">
                <Label className="text-slate-400">Email Cadastrado</Label>
                <Input type="email" value={profile?.email || ""} disabled className="bg-[#121620] border-slate-800 text-slate-500 opacity-70"/>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1 w-full">
                  <Label className="text-slate-400">Senha</Label>
                  <Input type="password" value="********" disabled className="bg-[#121620] border-slate-800 text-slate-500 opacity-70"/>
                </div>
                <Button type="button" variant="outline" onClick={() => navigate('/resetsenha')} className="w-full sm:w-auto border-slate-700 text-slate-400 bg-slate-800 hover:bg-slate-600 hover:text-white">
                  Alterar Senha
                </Button>
              </div>
            </div>
          </section>

          <Separator className="bg-slate-800 mb-6" />

          {/* AÇÕES FINAIS (Rodapé) */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button type="button" variant="link" onClick={() => setIsDeleteModalOpen(true)} className="text-red-400 hover:text-red-300 px-0 w-full sm:w-auto justify-start">
              Excluir Conta Permanentemente
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-500 text-white w-full sm:w-auto">
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>

        </form>
      </div>

      {/* ==========================================
          MODAIS DE CONFIRMAÇÃO (Alert Dialogs)
      ========================================== */}
      
      {/* Modal Salvar */}
      <AlertDialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <AlertDialogContent className="bg-[#0A0D16] border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar alterações?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Isso atualizará suas informações públicas e corporativas no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeSave} className="bg-cyan-600 hover:bg-cyan-500 text-white">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Excluir */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-[#0A0D16] border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Excluir conta definitivamente?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Todos os seus dados, comentários e históricos serão apagados dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => alert("Função de exclusão em desenvolvimento")} className="bg-red-600 hover:bg-red-500 text-white">
              Sim, excluir minha conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}