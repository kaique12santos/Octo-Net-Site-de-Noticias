import React from "react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Banner de Boas-vindas para teste */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-white mb-4">Bem-vindo ao Octo-News</h1>
        <p className="text-slate-400 max-w-2xl">
          Esta é a página Home pública. Se você está vendo o Header com a barra de notícias ao vivo no topo e o Footer lá embaixo, o roteamento do <strong>PortalLayout</strong> foi um sucesso absoluto!
        </p>
      </section>

      {/* Grid de Notícias Simulado */}
      <section>
        <h2 className="text-xl font-bold text-slate-200 mb-6 border-b border-slate-800 pb-2">Últimas Notícias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-700 transition-colors cursor-pointer group">
              {/* Imagem simulada */}
              <div className="h-48 bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
              
              <div className="p-5">
                <div className="text-xs text-cyan-400 font-bold tracking-widest uppercase mb-3">Tecnologia</div>
                <h3 className="text-lg font-medium text-slate-100 mb-2 leading-tight">
                  Título da Matéria de Exemplo {i}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2">
                  Um breve resumo da notícia gerado apenas para preencher espaço e testar o alinhamento do grid no layout do portal.
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}