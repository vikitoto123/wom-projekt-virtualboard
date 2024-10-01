# Use the official Node.js image from the Docker Hub as the base image
FROM node:22

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the app
CMD ["sh", "-c", "if [ \"$MODE\" = 'development' ]; then npm run dev; else npm start; fi"]
