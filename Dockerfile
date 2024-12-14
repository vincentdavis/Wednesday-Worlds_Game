
FROM ghcr.io/astral-sh/uv:python3.13-alpine

# Create and change to the app directory.
WORKDIR /app

# Copy local code to the container image.
COPY . .

# Install project dependencies
RUN uv sync --frozen

# Run the web service on container startup.
CMD uv run hypercorn main:app --bind ::