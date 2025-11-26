---
layout: default-with-date
title: MongoDB
permalink: mongodb
published_date: 2025-11-26
nav_order: 2
---

## MongoDB에 Data Versioning System은 적합하지 않다?

**결론은 MongoDB에 data versioning system(예: DVC, LakeFS 등)은 적합하지 않고, 내부에서 구현하는 것이 좋다.**

MongoDB 데이터 폴더 자체를 버저닝 해볼 수 있겠지만 MongoDB는 WiredTiger라는 파일 구조를 가지고 있어서 작은 업데이트도 전체가 바뀌는 것처럼 보이게 된다고 한다. (GPT 문답을 참고함)
* WiredTiger에 대해서 더 알아보고 싶다면: [MongoDB WiredTiger의 파일 구조](https://tech.kakao.com/posts/670)

**Q. MongoDB는 data versioning 기능을 내장하고 있는가?**

**A. 그렇지는 않은 것 같다.** 문서를 보면 기능이 아니라 패턴으로 소개하고 있다: [Keep a History of Document Versions](https://www.mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/document-versioning/)

따라서 내부에서 버저닝 기능을 구현해야한다.

여러 회사들에서도 **내부에서 구현하는 방식을 차용한다**고 하는데 소스가 많지는 않다.
* [올리브영 전시영역 MongoDB 도입하기](https://oliveyoung.tech/2023-01-04/oliveyoung-discovery-mongodb/) 여기서도 MongoDB 공식 document versioning 패턴을 적용했다.

[How to Build an End-to-End ML Pipeline with MongoDB, DVC, and MLflow](https://www.mohamedgad.com/articles/end-to-end-heart-disease-pipeline) 이 포스팅에서는 DVC와 MongoDB 둘 다 사용했다고는 하지만, 들어가보면 MongoDB는 데이터용으로 DVC는 ML artifact용으로 사용한 것이여서 해당되지 않는다.

여기까지의 이해로는 data versioning system은 NoSQL보다는 테이블 형태의 DB에 어울려서 ML metadata용으로 사용되는 것으로 보인다.

ML 파이프라인 재현성을 위해서 feature engineering 후 학습 직전에 immutable(더이상 데이터가 바뀌지 않는) 상태에서 data versioning을 적용한다.

여기서 아이디어는 DB에 대한 query를 실험 configuration으로 넣고 해당 query가 동일하면 DB가 아닌 version system에서 가져오도록 한다.

## MongoDB GUI: MongoDB Compass

[다운로드(mongodb.com/try/download/compass)](https://www.mongodb.com/try/download/compass)