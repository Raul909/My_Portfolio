#!/bin/bash
# Exit if the key isn't found
if [ -z "$WEB3FORMS_KEY" ]; then
  echo "Error: WEB3FORMS_KEY environment variable is not set."
  # We won't exit 1 to not break the build if they forget, just warn
else
  # Inject the key into the HTML file
  sed -i "s/{{WEB3FORMS_KEY}}/$WEB3FORMS_KEY/g" index.html
  echo "Web3Forms key securely injected."
fi
