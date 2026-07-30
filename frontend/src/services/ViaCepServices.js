export const ViaCepServices = {
  
  async buscarEnderecoPorCep(cep) {
    // 1. Limpeza de dados: Remove hifens, espaços ou letras (deixa só números)
    const cepLimpo = cep.replace(/\D/g, '');

    // 2. Validação inicial: O CEP no Brasil sempre tem 8 dígitos
    if (cepLimpo.length !== 8) {
      return { error: "Formato de CEP inválido. O CEP deve ter 8 números." };
    }

    try {
      // 3. Chamada à API pública
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      // 4. Tratamento da "pegadinha" do ViaCEP:
      // Quando um CEP não existe (ex: 99999999), o ViaCEP não retorna erro HTTP 404.
      // Ele retorna HTTP 200 (Sucesso), mas com um JSON contendo { erro: true }.
      if (data.erro) {
        return { error: "CEP não encontrado na base de dados." };
      }

      // 5. Retorno padronizado em caso de sucesso
      return {
        data: {
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }
      };

    } catch (error) {
      // Captura erros de rede
      console.error("Falha na comunicação com o ViaCEP:", error);
      return { error: "Erro de comunicação com o serviço de CEP. Tente novamente." };
    }
  }
};