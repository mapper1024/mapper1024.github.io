#!/bin/bash
set -ex

DEFAULT=sample_map_0.6.2

if ! [ -f update.sh ] || ! [ -f ../index.html ]; then
	echo "Must run $0 in the screenshots directory."
	exit 1
fi

find -maxdepth 1 -name "*.thumb.png" -delete
rm -f default.png default.thumb.png

find -name "*.png" -prune | while read n; do
	convert -resize 25% -strip "$n" "${n%.*}.thumb.png" &
done

wait

ln -s "$DEFAULT.png" default.png
ln -s "$DEFAULT.thumb.png" default.thumb.png
