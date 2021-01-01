#!/bin/sh

set -e

git config --global user.name "$NAME"
git config --global user.email "$EMAIL"
git remote add origin https://${GITHUB_TOKEN}@github.com/ojdev/ojdev.github.io.git
git pull origin master
git add --all .
git commit -m "github actions"
git push --quiet --force origin HEAD:gh-pages