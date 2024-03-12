---
layout: default
permalink: /getting-started
---

# Getting Started

[< Back]({% if site.baseurl %}{{ site.baseurl }}{% else %}/{% endif %})

{% if site.data.settings.content_url %}
    {% capture data_url %}{{ site.data.settings.content_url }}architecture/docs/02-getting-started.md{% endcapture %}
    {% remote_include {{ data_url }} %}
{% endif %}
