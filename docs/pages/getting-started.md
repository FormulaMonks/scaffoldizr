---
layout: default
permalink: /getting-started
---

# Getting Started

[< Back](/)

{% if site.data.settings.content_url %}
    {% capture data_url %}{{ site.data.settings.content_url }}architecture/docs/01-usage.md{% endcapture %}
    {% remote_include {{ data_url }} %}
{% endif %}
