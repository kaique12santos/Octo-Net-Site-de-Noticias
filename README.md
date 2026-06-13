
# Octo-Net Site de Notícias

Bem-vindo ao repositório do Octo-Net! Este projeto é um monorepo dividido em Frontend (React + Vite + Tailwind + shadcn) e Backend (FastAPI + Python).

## ⚠️ Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas na sua máquina:
* [Git](https://git-scm.com/)
* [GitHub Desktop](https://desktop.github.com/) (Se preferir tudo por interface amigavel)
* [Node.js](https://nodejs.org/) (Versão LTS recomendada)
* [Python](https://www.python.org/downloads/) (Recomendado versão 3.10 ou 3.11. **Atenção:** No Windows, não esqueça de marcar a caixa "Add Python to PATH" durante a instalação).

---
## 📝 Padrão de Commits (Conventional Commits)

Este projeto utiliza o padrão [Conventional Commits](https://www.conventionalcommits.org/) para manter o histórico de alterações rastreável e semântico. Todos os commits devem seguir a estrutura abaixo:

`<tipo>: <descrição curta no imperativo>`

### Tipos Permitidos:
* **`feat`**: Uma nova funcionalidade.
  * *Ex: `feat: adiciona model e controller de usuarios`*
* **`fix`**: Correção de um bug.
  * *Ex: `fix: corrige foreign key da tabela categories`*
* **`chore`**: Tarefas de manutenção, atualização de dependências ou configurações que não alteram código de produção.
  * *Ex: `chore: atualiza requirements.txt com psycopg2`*
* **`docs`**: Alterações apenas na documentação.
  * *Ex: `docs: adiciona tutorial de setup do ambiente virtual`*
* **`refactor`**: Uma alteração de código que não corrige um bug nem adiciona uma feature (ex: melhoria de performance ou organização MSC).
  * *Ex: `refactor: move logica de banco para services`*
* **`test`**: Adição ou correção de testes automatizados.
  * *Ex: `test: adiciona teste unitario para o endpoint health check`*
* **`style`**: Mudanças de formatação (espaços, aspas, linting) que não afetam a lógica.
---

## 🚀 Como rodar o projeto localmente

Primeiro, clone o repositório para a sua máquina:
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd octo-net-site-de-noticias

```

### 1. Configurando o Backend (Python/FastAPI)

Abra um terminal e navegue até a pasta do backend:

```bash
cd backend

```

Crie o ambiente virtual (isso isola as dependências do projeto):

```bash
python -m venv venv

```

Ative o ambiente virtual:

* **No Windows:** `.\venv\Scripts\activate`
* **No Linux/Mac:** `source venv/bin/activate`

*(Você saberá que deu certo quando aparecer um `(venv)` no início da linha do terminal)*.

Com o ambiente ativado, instale as dependências:

```bash
pip install -r requirements.txt

```

Para rodar o servidor do backend:

```bash
fastapi dev app/main.py
# Ou usando o uvicorn diretamente: uvicorn app.main:app --reload

```

O backend estará rodando em: `http://localhost:8000`

---

### 2. Configurando o Frontend (React/Vite/Tailwind)

Abra **outro terminal** (mantenha o do backend rodando) e navegue até a pasta do frontend a partir da raiz do projeto:

```bash
cd frontend

```

Instale todas as dependências do Node:

```bash
npm install

```

Para rodar o servidor de desenvolvimento do frontend:

```bash
npm run dev

```

O terminal mostrará a URL local (geralmente `http://localhost:5173`).

---


## 🛠️ Tecnologias Utilizadas

* **Frontend:** React, Vite, Tailwind CSS (v3), shadcn/ui.
* **Backend:** Python, FastAPI, Uvicorn, Pydantic.