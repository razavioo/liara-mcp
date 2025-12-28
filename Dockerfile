FROM eclipse-temurin:21-jre-alpine

# Install bash for scripting
RUN apk add --no-cache bash

WORKDIR /app

# Copy the fat JAR
COPY build/libs/apkarchitect-*-all.jar app.jar

# Set JVM options for optimal performance
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# Expose both API and worker ports
EXPOSE 8080 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
