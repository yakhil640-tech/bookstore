FROM node:22-bookworm-slim AS frontend-build
WORKDIR /workspace/bookstore/frontend

COPY bookstore/frontend/package.json ./
COPY bookstore/frontend/package-lock.json ./
RUN npm ci

COPY bookstore/frontend/ ./
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace/bookstore/backend

COPY bookstore/backend/pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline

COPY bookstore/backend/ ./
COPY --from=frontend-build /workspace/bookstore/frontend/dist /tmp/frontend-dist
RUN rm -rf src/main/resources/static \
    && mkdir -p src/main/resources/static \
    && cp -r /tmp/frontend-dist/. src/main/resources/static/ \
    && mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=backend-build /workspace/bookstore/backend/target/bookstore-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
