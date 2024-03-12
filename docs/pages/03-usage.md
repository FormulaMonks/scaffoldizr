---
layout: default
permalink: /usage
---

# Usage

[< Back]({% if site.baseurl %}{{ site.baseurl }}{% else %}/{% endif %})

{% if site.data.settings.content_url %}
    {% capture data_url %}{{ site.data.settings.content_url }}architecture/docs/03-usage.md{% endcapture %}
    {% remote_include {{ data_url }} %}
{% endif %}
