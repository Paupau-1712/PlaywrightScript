# Docker Configuration

This directory contains Docker-related files.

## Files

- **Dockerfile**: Container configuration for running tests (also in root for convenience)
- **.dockerignore**: Files to exclude from Docker build

## Usage

### Build Docker Image
```bash
cd ../..
docker build -t playwright-tests .
```

### Run Tests in Container
```bash
docker run --rm \
  -v $(pwd)/report-summary:/app/report-summary \
  -v $(pwd)/screenshots:/app/screenshots \
  -v $(pwd)/playwright-report:/app/playwright-report \
  playwright-tests
```

### Quick Test
```bash
docker run --rm playwright-tests
```

## Note

The `Dockerfile` is kept in both root directory and `.ci/docker/` for:
- **Root**: Docker build convenience (default location)
- **`.ci/docker/`**: Organization and backup
