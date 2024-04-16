# Use the official Node.js image as the base  
FROM node:18-alpine

LABEL org.opencontainers.image.source = "https://github.com/DavidCraftDev/checkin"

# Set the working directory inside the container  
WORKDIR /app  

# Copy package.json and package-lock.json to the container  
COPY package*.json ./  

# Install dependencies  
RUN npm ci  

# Copy the app source code to the container  
COPY . .  

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app  
RUN npm run build  

# Expose the port the app will run on  
EXPOSE 3000  

# Start the app
ENTRYPOINT ["tini", "--", "scripts/entrypoint.sh"]