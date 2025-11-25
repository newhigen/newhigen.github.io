---
title: Home
layout: home
nav_order: 0
---

{% assign top_pages = site.html_pages
  | where_exp: "p", "p.nav_exclude != true"
  | where_exp: "p", "p.parent == nil or p.parent == ''"
  | sort: "nav_order" %}

## Top Level Pages

{% for p in top_pages %}
{% unless p.url == "/" or p.url == "" %}
- [{{ p.title | default: p.name }}]({{ p.url | relative_url }})
{% endunless %}
{% endfor %}
