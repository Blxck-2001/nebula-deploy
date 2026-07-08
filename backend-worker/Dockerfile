FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jdk-jammy

# Use noninteractive frontend for apt
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   git \
	   openssh-client \
	   docker.io \
	   curl \
	   ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir -p /usr/lib/docker/cli-plugins

# Install docker buildx cli plugin (latest release)
RUN TAG=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/') \
	&& echo "Downloading buildx $TAG" \
	&& curl -fsSL "https://github.com/docker/buildx/releases/download/${TAG}/buildx-${TAG}.linux-amd64" -o /usr/lib/docker/cli-plugins/docker-buildx \
	&& chmod +x /usr/lib/docker/cli-plugins/docker-buildx || true

# Create application user to avoid running as root
RUN groupadd -r nebula && useradd -r -g nebula -m -d /home/nebula -s /sbin/nologin nebula || true

WORKDIR /app
COPY --from=build /app/target/backend-worker-0.0.1-SNAPSHOT.jar /app/app.jar

# Create worker work dir and give ownership to non-root user
RUN mkdir -p /tmp/worker && chown -R nebula:nebula /tmp/worker /app

EXPOSE 8080

# Run as non-root user
USER nebula

CMD ["java","-jar","/app/app.jar"]
