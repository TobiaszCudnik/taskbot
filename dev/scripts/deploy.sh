#!/usr/bin/env sh

# sync
# TODO remove old files at the destination
# TODO .env
rsync -avz -e \
  "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  --exclude=/.git \
  --exclude=/.vscode \
  --exclude=/.alm \
  --exclude=/.idea \
  --exclude=/test \
  --exclude=/logs \
  --exclude=/config* \
  --exclude=/node_modules \
  --exclude=/www/node_modules \
  --exclude=*.ts \
  --exclude=*.js.map \
  --progress ./ dev1:apps/taskbot.app/
