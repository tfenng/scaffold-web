#!/usr/bin/env sh

set -eu

mkdir -p out

cat > out/index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=/users/" />
    <meta name="robots" content="noindex" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="/users/" />
  </head>
  <body>
    <main>
      <p>Redirecting to <a href="/users/">/users/</a>...</p>
    </main>
  </body>
</html>
EOF
