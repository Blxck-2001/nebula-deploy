# Nebula Deploy

Elevator pitch
---------------
Nebula Deploy é uma plataforma leve para orquestrar deploys de aplicações Dockerizadas: uma API que recebe pedidos de deploy, publica mensagens em RabbitMQ, e um worker que clona repositórios, executa comandos de build/run, persiste logs e status em PostgreSQL e trata retries + DLQ. Projetado com foco em testabilidade, observabilidade e segurança (máscara de segredos).

Por que este projeto importa
---------------------------
- Demonstra decisões arquiteturais para sistemas distribuídos: separação entre API e worker, mensageria (RabbitMQ), persistência robusta (Postgres) e processamento assíncrono.
- Mostra atenção prática à confiabilidade: retries com backoff, Dead Letter Queue, controle de timeouts e mascaramento de segredos em logs.
- Projetado para ser testável: abstração de execução de comandos (`CommandRunner`) e testes que dispensam um daemon Docker local.

Meu papel e decisões chave
-------------------------
- Liderança técnica e implementação end-to-end (API, worker, modelagem DB, scripts de demo).  
- Priorizei testabilidade: extraí interação com o sistema (`CommandRunner`) para permitir testes unitários/integração sem Docker.  
- Corrigi problemas práticos encontrados em execução (migração de esquema para `deploy_logs`, tratamento de ausência de `git`, ajustes no CI).  

Arquitetura
-----------------------
- API (Spring Boot) — autenticação JWT, endpoints para criar projetos e publicar `DeployMessage` em RabbitMQ.  
- Worker (Java) — consumidor RabbitMQ; clona repositórios, executa `buildCommand`/`runCommand`, stream de logs para Postgres, retries + DLQ.  
- Mensageria — RabbitMQ com exchange `deploys-exchange` e fila `deploys` (mais `deploys-dlq`).  
- Banco — PostgreSQL armazena `deploys` e `deploy_logs` (logs com `id` e `created_at`).  
- Frontend — pequena interface de demonstração (opcional).  

Tecnologias
-----------
- Java 21, Spring Boot 3.x
- RabbitMQ
- PostgreSQL
- Docker / docker-compose
- Maven, JUnit 5 (Testcontainers opt-in)
- GitHub Actions (CI)

Destaques técnicos
------------------
- `CommandRunner` abstrai execução de processos para facilitar mocks em testes E2E.  
- Logs persistidos por linha em `deploy_logs` com `created_at` para ordenação e investigação.  
- Máscara de segredos em logs (`GIT_TOKEN`, `GIT_SSH_PRIVATE_KEY`) para evitar vazamento de credenciais.  
- Migração aplicada para adicionar `id` e `created_at` em `deploy_logs` (arquivo `scripts/db/0001_add_deploy_logs.sql`).

Como avaliar rapidamente
----------------------- 
1. Use o endpoint `POST /projects/{id}/deploy` para criar um deploy e acompanhe `deploys` + `deploy_logs` no Postgres.  
2. Veja `WorkerService` para o fluxo de consumo e `CommandRunner` para a estratégia de testabilidade.

Documentação e manutenção
-------------------------
- `docs/GETTING_STARTED.md` — guias para rodar localmente e como reproduzir o demo (destinado a engenheiros).  
- `scripts/db/0001_add_deploy_logs.sql` — migração usada em ambiente de demo/prod.  

Licença e contribuição
----------------------
Este repositório está licenciado sob MIT — veja `LICENSE`. Para contribuidores, veja `CONTRIBUTING.md`.

Contato
-------
Se quiser conversar sobre decisões técnicas ou uma avaliação do código, me marque no PR ou acesse meu perfil.
