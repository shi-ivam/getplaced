FROM node:20-alpine

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
