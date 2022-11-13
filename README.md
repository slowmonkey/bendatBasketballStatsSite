# How to run locally

`docker-compose up`

Navigate to `http://localhost:8080`

# How to run in debug mode

`docker-compose -f docker.compose.11tydebug.yml up`

Navigate to `http://localhost:8080`

# How to run for production deployment

`docker-compose -f docker-compose.11ty.yml run --rm eleventy bash`

Run `npm run build`

ignore the EACCESS errors.

Wait for the _site contents to be generated.

```
git add src
git add docs

git commit -m ""
git push origin master
```

# References

https://sia.codes/posts/architecting-data-in-eleventy/


https://www.hockeycomputindo.com/2022/04/cuteblog-11ty-for-eleventy-generator.html
https://github.com/mesinkasir/cuteblog11ty



https://github.com/smccracken/chocolatesculptress.com

https://lea-tortay.com/content/writings/github-pages-eleventy/

## Sortable tables

https://www.w3schools.com/howto/howto_js_sort_table.asp
https://www.kryogenix.org/code/browser/sorttable/

## Filterable tables

https://www.w3schools.com/howto/howto_js_filter_table.asp

## Fixing path prefix when deploying to github pages.

https://www.rockyourcode.com/how-to-deploy-eleventy-to-github-pages-with-github-actions/


# Eleventy - What I've learnt

.eleventy files are loaded and not reloaded on npx eleventy --watch --serve option. This makes it harder to develop on.

There's a DEBUG feature to eleventy. See the docker-compose.11tydebug.yml. It's all around having the DEBUG environment variable.

# queryselector doesn't allow you to select based on a greater than or less than operator.

# To concatenate strings in nunjucks

https://michaelheap.com/nunjucks-concatenate-string/