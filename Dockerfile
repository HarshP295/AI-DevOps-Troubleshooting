# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /build

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build the application (skip tests — they need a live DB)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the fat jar produced by the build stage
COPY --from=builder /build/target/*.jar app.jar

# Copy the knowledge-base data folder and evaluation set
COPY data ./data
COPY eval-set.json ./eval-set.json

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

