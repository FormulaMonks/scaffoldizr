---
layout: default
permalink: /contribute
---

# Contribute

[< Back]({% if site.baseurl %}{{ site.baseurl }}{% else %}/{% endif %})

{% if site.data.settings.content_url %}
    {% capture data_url %}{{ site.data.settings.content_url }}architecture/docs/05-contribute.md{% endcapture %}
    {% remote_include {{ data_url }} %}
{% endif %}
