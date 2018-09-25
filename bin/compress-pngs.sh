#!/usr/bin/env bash
for file in `find www/static -name '*.png'`; do
    pngquant --speed 1 --force --ext '.png' --skip-if-larger $file
done