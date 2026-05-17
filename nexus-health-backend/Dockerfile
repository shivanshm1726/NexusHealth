# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first (faster rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress

# Build the JAR
COPY src ./src
RUN mvn package -DskipTests --no-transfer-progress

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/nexus-health-backend-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx400m", "-XX:+UseContainerSupport", "-jar", "app.jar"]
