---
pubDatetime: 2025-11-25
title: git checkout <branch> -- <path>
slug: git-checkout
featured: false
draft: false
tags:
  - git
description: ""
---

## `git checkout <branch> -- <path>`

Branch B에 Branch A의 특정 파일들의 변경점만 가져오고 싶을 때.

```bash
# folderA의 변경된 파일들만 커밋할 새로운 브랜치 생성
git checkout -b branch-b

# branch-a에서 folderA 폴더만 현재 브랜치로 가져오기
git checkout branch-a -- folderA
```

<table>
<tr>
<th> Branch A </th>
<th> Branch B Before </th>
<th> Branch B After </th>
</tr>
<tr>
<td>
<pre>
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
folderA/

fileA1
fileA2
folderB/
fileB1
fileB2

</pre>
</td>
<td>
<pre>
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
