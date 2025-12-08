---
title: Home
layout: home
nav_order: 0
featured_posts:
  - permalink: moral-uncertainty
    note:
  - permalink: fake-senior-junior
    note:
  - permalink: feeling-good-at-work
    note:
  - permalink: stare-at-professional
    note:
  - permalink: breaking-bias
    note:
topics:
  - title: 코드 리뷰
    links:
      - permalink: code-review
        note: 효과적인 코드 리뷰에 대하여
  - title: MongoDB
    links:
      - permalink: mongodb
        note: MongoDB와 데이터 버저닝
  - title: Git
    links:
      - permalink: git
        note: 자주 쓰는 Git 명령어들
  - title: GitHub
    links:
      - permalink: github
        note: 자주 쓰는 GitHub 기능들
---

{% assign featured_posts = page.featured_posts | default: site.featured_posts | default: [] %}
{% assign topics = page.topics | default: site.topics | default: [] %}


## 주제들
{% if topics != empty %}
{% assign has_topic_links = false %}
<ul class="home-compact">
{% for topic in topics %}
{% if topic.links and topic.links != empty %}
{% assign has_topic_links = true %}
{% for link in topic.links %}
{% assign topic_page = site.pages | where: "permalink", link.permalink | first %}
{% assign link_url = topic_page.url | relative_url | default: link.url %}
{% assign link_title = topic_page.title | default: link.title %}
{% if link_url and link_title %}
  <li><a href="{{ link_url }}">{{ link_title }}</a>{% if link.note %} — {{ link.note }}{% endif %}</li>
{% endif %}
{% endfor %}
{% endif %}
{% endfor %}
</ul>
{% unless has_topic_links %}
링크를 추가해 주세요.
{% endunless %}
{% else %}
주제별 링크를 설정해 주세요.
{% endif %}

## 대표 글
{% if featured_posts != empty %}
<ul class="home-compact">
  {% for item in featured_posts %}
    {% assign featured_page = site.pages | where: "permalink", item.permalink | first %}
    {% assign featured_url = featured_page.url | relative_url | default: item.url %}
    {% assign featured_title = featured_page.title | default: item.title %}
    {% if featured_url and featured_title %}
    <li><a href="{{ featured_url }}">{{ featured_title }}</a>{% if item.note %} — {{ item.note }}{% endif %}</li>
    {% endif %}
  {% endfor %}
</ul>
{% else %}
표시할 글을 설정해 주세요.
{% endif %}
