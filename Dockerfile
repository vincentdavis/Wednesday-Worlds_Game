# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Expose port 3000 for the app to be accessible
EXPOSE 3000

# Create a shell script to run multiple commands
RUN echo "#!/bin/sh\n\
npx http-server -p 3001 -a 0.0.0.0 -c-1 ./wednesday-worlds-game/dist/index.html &\n\
node server.js" > run.sh

# Make the shell script executable
RUN chmod +x run.sh

# Run the shell script as the container's command
CMD [ "./run.sh" ]