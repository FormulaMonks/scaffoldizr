---
layout: default
permalink: /adrs
---

# Decisions

[< Back]({% if site.baseurl %}{{ site.baseurl }}{% else %}/{% endif %})

{% for adr in site.adrs %}
  [{{ adr.name }}]({{ site.baseurl }}/adrs/{{ adr.name }})
{% endfor %}
