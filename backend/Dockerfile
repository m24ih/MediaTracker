# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

# Önce bağımlılıkları indir (Docker cache optimizasyonu)
COPY pom.xml .
RUN mvn dependency:go-offline

# Kaynak kodları kopyala ve derle
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

# JVM bellek ayarları compose.yaml'daki JAVA_TOOL_OPTIONS üzerinden ezilecektir.
ENTRYPOINT ["java", "-jar", "app.jar"]