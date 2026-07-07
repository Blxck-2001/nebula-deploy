FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/backend-spring-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
CMD ["java","-jar","/app/app.jar"]
