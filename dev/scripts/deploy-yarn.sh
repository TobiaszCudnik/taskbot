#!/usr/bin/env sh

# refresh the main deps
echo "node modules 1"
ssh dev@dev1 'cd apps/taskbot.app; and yarn install'

# refresh the www deps
echo "node modules 2"
ssh dev@dev1 'cd apps/taskbot.app/www; and yarn install'
