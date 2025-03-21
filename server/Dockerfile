FROM node:20-alpine

# Install PostgreSQL client for database migration
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Make scripts executable
RUN chmod +x /app/scripts/*.sh

EXPOSE 5000

# Set environment variable to run migrations on first start
ENV RUN_MIGRATIONS=true

CMD ["/app/scripts/startup.sh"]