from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    # Testando a conexão do backend, imprimindo uma mensagem no console para verificar se a requisição foi recebida
    print("[SERVER LOG] O Backend do Octo-Net recebeu uma requisição com sucesso!", flush=True)
    return {"status": "online", "projeto": "Octo-Net"}