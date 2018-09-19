#!/usr/bin/env bash
for file in `find www/static -name '*.png'`; do
	echo $file
    pngquant --verbose --speed 1 --force --ext '.png' --skip-if-larger $file
done