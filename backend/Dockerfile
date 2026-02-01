# 使用 JDK 21 執行環境
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 將編譯好的 jar 複製進去
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]