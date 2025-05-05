#!/bin/bash

URL="https://akuraastrology.netlify.app"

echo "Checking homepage..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$URL"

echo "Extracting asset links from homepage..."
curl -s "$URL" | grep -Eo 'src="[^"]+"|href="[^"]+"' | sed 's/src=//;s/href=//' | tr -d '"' | grep -v '^/' | while read -r asset; do
  echo -n "$asset → "
  curl -s -o /dev/null -w "%{http_code}\n" "$URL/$asset"
done
