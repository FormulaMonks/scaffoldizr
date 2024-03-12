## Contribute

### Documentation

To preview GitHub Pages locally:

1. Run `mise install`
2. Run `mise run docs:dev`. This will start a Jekyll live reload server
3. Navigate to `http://localhost:4000`
4. Documentation source code is located in `docs` folder.

### Remote include

In order to avoid duplicated documentation, Github Pages docs are generated from Architecture docs. Assuming a variable located in `docs/_data/settings.yml` named `content_url`, the way include docs into Jekyll pages is as follows:

```liquid
{% if site.data.settings.content_url %}
    {% capture data_url %}{{ site.data.settings.content_url }}architecture/docs/path/to/file.md{% endcapture %}
    {% remote_include {{ data_url }} %}
{% endif %}
```

These files need to be already located in the repository's `main` branch, therefore a best practice is to add them first and then sync them in the Jekyll GH pages, to avoid build errors.
