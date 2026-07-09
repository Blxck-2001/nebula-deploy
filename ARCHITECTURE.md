# Arquitetura - Nebula Deploy

Visão geral (fluxo):
React -> Spring Boot API -> RabbitMQ -> Worker -> Docker Engine -> Containers

```mermaid
graph LR
  React[React Frontend]
  API[Spring Boot API<br/> (port 8080)]
  Rabbit[RabbitMQ<br/> (5672 / 15672)]
  Worker[Worker Service<br/> (consumer)]
  DockerEngine[Docker Engine<br/> (/var/run/docker.sock)]
  Containers[Application Containers]

  React --> API
  API --> Rabbit
  Rabbit --> Worker
  Worker --> DockerEngine
  DockerEngine --> Containers
```

Componentes e notas rápidas

- **React (frontend)**: interface do usuário. Porta típica `3000` em desenvolvimento.
- **Spring Boot API (`backend-spring`)**: autenticação (JWT), CRUD, publica mensagens de deploy.
  - Porta: `8080`
  - Variáveis importantes: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `SPRING_RABBITMQ_HOST`, `JWT_SECRET`
- **RabbitMQ**: exchange `deploys-exchange`, queue `deploys`, routing key `deploy.new`.
  - AMQP: `5672`
  - Management: `15672` (usuário `guest:guest` em dev)
- **Worker (`backend-worker`)**: consumidor que executa pipeline git→build→run e grava `deploy_logs` no Postgres.
  - Requer acesso ao Docker: monta `/var/run/docker.sock` (cuidado de segurança)
  - Usa `spring.rabbitmq.host` para conectar
- **Docker Engine**: cria/roda imagens/containers solicitados pelo worker.
  - Em desenvolvimento o worker monta o socket do host para controlar o daemon
- **Postgres**: `5432`, database `nebula`, usuário `nebula`/`nebula` por padrão.
- **Redis**: `6379` (planejado para refresh tokens)

Recomendações (curto-prazo):
- Externalizar `JWT_SECRET` e outras credenciais via env/secrets.
- Adotar migrações com Flyway/Liquibase (evita corrida de schema entre serviços).
- Configurar DLQ e retry para mensagens que falhem na conversão/execução.
- Evitar montar Docker socket em produção; usar runners isolados ou DinD controlado.

Arquivos de interesse:
- `backend-spring/src/main/java/com/nebula/backend/config/RabbitConfig.java`
- `backend-spring/src/main/java/com/nebula/backend/controller/DeployController.java`
- `backend-worker/src/main/java/com/nebula/worker/service/WorkerService.java`
- `docker-compose.yml`

</ARCHITECTURE.md>