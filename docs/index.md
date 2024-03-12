---
layout: default
permalink: /
---

{% comment %}<!-- markdownlint-disable MD041 -->{% endcomment %}

{% if site.data.settings.content_url %}
    {% capture data_url %}{{ site.data.settings.content_url }}architecture/docs/01-motivation.md{% endcapture %}
    {% remote_include {{ data_url }} %}
{% endif %}

## Contents

- [Getting Started]({{ site.baseurl }}/getting-started)
- [Usage]({{ site.baseurl }}/usage)
- [Workspace]({{ site.baseurl }}/workspace)
- [Contribute]({{ site.baseurl }}/contribute)
