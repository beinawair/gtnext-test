#!/bin/bash
set -e

cd dist

for file in $(find . -type f -name "*.js"); do mv "$file" "${file%.*}.cjs"; done
