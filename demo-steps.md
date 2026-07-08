% Demo: passos e gravação (GIF / terminal)

Este arquivo descreve passos rápidos para executar a demo localmente e instruções para gravar um GIF ou gravação do terminal.

Pré-requisitos
- Docker + Docker Compose (ou WSL com Docker funcionando)
- `curl`, `jq` (úteis para chamadas API)
- Para gravação do terminal: `asciinema` (Linux/WSL/Mac) ou `ffmpeg` (Windows/WSL)

Passo a passo para rodar a demo

1) Copie variáveis de ambiente:

```bash
cp .env.example .env
```

2) Subir stack (WSL / Linux):

```bash
./scripts/run-demo.sh
```

ou no Windows (PowerShell):

```powershell
.\scripts\run-demo.ps1
```

3) Registre um usuário (exemplo):

```bash
curl -sS -X POST http://localhost:8080/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo"}' | jq
```

4) Crie um projeto (exemplo rápido usando um repo público):

```bash
curl -sS -X POST http://localhost:8080/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"demo","repo":"https://github.com/docker/getting-started","branch":"main","buildCommand":"docker build -t demo-image .","runCommand":"docker run --rm -d -p 4001:80 demo-image"}' | jq
```

Anote o `id` retornado (UUID) do projeto.

5) Dispare um deploy (via API do backend) — exemplo, substitua `<projectId>`:

```bash
curl -sS -X POST http://localhost:8080/projects/<projectId>/deploy \
  -H 'Content-Type: application/json' \
  -d '{}'
```

Alternativa (via RabbitMQ Management API) — útil para demos de fila:

```bash
curl -u guest:guest -X POST "http://localhost:15672/api/exchanges/%2f/deploys-exchange/publish" \
  -H 'Content-Type: application/json' \
  -d '{"properties":{},"routing_key":"deploy.new","payload":"{\"deployId\":\"<deployId>\",\"projectId\":\"<projectId>\",\"repo\":\"https://github.com/docker/getting-started\",\"branch\":\"main\",\"buildCommand\":\"echo build\",\"runCommand\":\"echo run\",\"env\":{}}","payload_encoding":"string"}'
```

6) Acompanhe logs do worker:

```bash
docker compose logs backend-worker --tail 200 -f
```

7) Parar demo:

```bash
docker compose down
```

Gravando o terminal (asciinema) — Linux / WSL / Mac

1. Instale `asciinema` (ex.: `sudo apt install asciinema` ou `brew install asciinema`).
2. Inicie a gravação antes de executar os comandos da demo:

```bash
asciinema rec demo.cast
# execute: ./scripts/run-demo.sh e os passos 3..6
# pressione Ctrl-D para parar
```

3. Converter para GIF (opções):
- Usar `asciinema2gif` (serviço/CLI de terceiros) ou
- Usar `svg-term-cli` + `gifsicle`. Exemplo rápido com `svg-term-cli`:

```bash
npm install -g svg-term-cli
svg-term --in demo.cast --out demo.svg --window
# então converter SVG para GIF com ferramentas externas (imagem -> gif)
```

Gravando tela/PowerShell no Windows (ffmpeg)

1. Instale `ffmpeg` (ex.: choco install ffmpeg).
2. Grave a janela do PowerShell inteira (exemplo):

```powershell
# grave a janela com título "Windows PowerShell" (ajuste conforme)
ffmpeg -f gdigrab -framerate 15 -i title="Windows PowerShell" -vf scale=1024:-1 -y demo.mp4
# converta para GIF
ffmpeg -i demo.mp4 -vf "fps=15,scale=1024:-1:flags=lanczos" -loop 0 demo.gif
```

Dicas para gravação curta e limpa
- Use repositórios de exemplo que buildem rápido (ex.: repos com Dockerfile pequeno). Evite builds longos no GIF.
- Abrevie logs: antes de gravar, reduza `processTimeoutSeconds` em `backend-worker` para acelerar timeouts em demos (somente local).
- Para GIFs smaller: reduza `fps` e `scale` na conversão.

Quer que eu gere também um `demo-gif-sample` (placeholder) ou prefira que eu gere passos para um vídeo curto (script de screenshots)? Responda aqui e eu preparo o que preferir.
