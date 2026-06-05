from fastapi import FastAPI

app = FastAPI(title="OCTO NET SITE DE NOTÍCIAS API")

@app.get("/")
def read_root():
    return {"message": "Backend pronto"}
