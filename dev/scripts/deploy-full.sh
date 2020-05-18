#!/usr/bin/env sh

make build
./dev/scripts/deploy.sh
./dev/scripts/deploy-yarn.sh
