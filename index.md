---
title: Home
layout: home
nav_order: 0
---

{% assign top_pages = site.html_pages
  | where_exp: "p", "p.nav_exclude != true"
  | where_exp: "p", "p.parent == nil or p.parent == ''"
  | sort: "nav_order" %}

Top Pages

<ul>
{% for p in top_pages %}
{% unless p.url == "/" or p.url == "" %}
<li><a href="{{ p.url | relative_url }}">{{ p.title | default: p.name }}</a></li>
{% endunless %}
{% endfor %}
</ul>