#!/bin/bash

# Run a command inside the Rust docker container
docker run --rm -v $(pwd):/app -w /app rust:1.88.0 "$@"