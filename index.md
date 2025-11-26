---
title: Home
layout: home
nav_order: 0
---

{% assign now_s = 'now' | date: '%s' %}
{% assign latest_pages = site.pages
  | where_exp: "p", "p.published_date"
  | where_exp: "p", "p.nav_exclude != true"
  | where_exp: "p", "p.path contains 'docs/'"
  | sort: "published_date"
  | reverse %}

## 최신 글

{% if latest_pages != empty %}
{% for p in latest_pages limit:3 %}
  {% assign pub_s = p.published_date | date: '%s' %}
  {% assign diff_s = now_s | minus: pub_s %}
  {% assign days = diff_s | divided_by: 86400 %}
  {% if days < 1 %}
    {% assign ago = '오늘' %}
  {% elsif days < 7 %}
    {% assign ago = days | append: '일 전' %}
  {% elsif days < 60 %}
    {% assign weeks = days | divided_by: 7 %}
    {% assign ago = weeks | append: '주 전' %}
  {% elsif days < 730 %}
    {% assign months = days | divided_by: 30 %}
    {% assign ago = months | append: '개월 전' %}
  {% else %}
    {% assign years = days | divided_by: 365 %}
    {% assign ago = years | append: '년 전' %}
  {% endif %}
[{{ p.title | default: p.name }}]({{ p.url | relative_url }}) <span class="text-small">{{ ago }}</span>
{% endfor %}
{% else %}
<p class="text-small">최근 포스트가 없습니다.</p>
{% endif %}
