---
layout: default
title: Git
permalink: git
nav_order: 1
---

<details close markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# `git checkout <branch> -- <path>`

Branch A에서 특정 폴더의 변경된 파일들만 커밋하고 싶을 때.

```bash
# folderA의 변경된 파일들만 커밋할 새로운 브랜치 생성
git checkout -b branch-b

# branch-a에서 folderA 폴더만 현재 브랜치로 가져오기
git checkout branch-a -- folderA
```

<table>
<tr>
<th> Before </th>
<th> After </th>
</tr>
<tr>
<td>


<pre>
# branch-a

folderA/
  folderA1/
    fileA11 (untracked)
  fileA1 (modified)
  fileA2
folderB/
  fileB1 (modified)
  fileB2
  fileB3 (untracked)
</pre>

</td>
<td>

<pre>
# branch-b

folderA/
  folderA1/
    fileA11 (untracked)
  fileA1 (modified)
  fileA2
folderB/
  fileB1
  fileB2
</pre>

</td>
</tr>
</table>