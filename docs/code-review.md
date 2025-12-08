---
layout: default
title: Code Review
permalink: code-review
nav_order: 1
---

## 효과적인 코드 리뷰란

- 맥락[^toss-cr]

## 코드 리뷰 경험으로 느낀점

> (주의) 기능 조직이 아닌 목적 조직, 개발팀이 아닌 연구팀의 경험이기 때문에 감안하고 참고하면 좋습니다.
> * 전자 - 리뷰어들이 스페셜리스트보다는 제너럴리스트에 가깝다.
> * 후자 - 빠르게 변화하는 실험과 data-intensive한 코드 변경점들이 있다.

필요에 따라서 line-by-line 리뷰와 추상적 관점 리뷰를 비율을 조절한다.
* 시간이 충분하다면 가능하겠지만, 시간이라는 자원을 효율적으로 사용해야한다.
* 그렇다고 해서 모두 대충 보라는 뜻이 아니다.
* 맥락에 따라서 달라진다.
  * 중요한 코드인 경우 line-by-line과 목적에 부합하는지 자세하게 본다.
  * 덜 중요하거나 실험적인 코드의 경우 전체적인 흐름과 테스트 코드를 보며 최종 목적 위주로 본다.
얼마나 빠르게 리뷰를 해주느냐도 회사/팀 상황에 따라 다르다.
* 아래 구글의 작성자 가이드를 참고하면 좋다: [Speed of Code Reviews](https://google.github.io/eng-practices/review/reviewer/speed.html)
* 글에서는 최대 하루를 넘기지 말라고 하지만, 쉽지는 않다고 생각한다.
* 글에서도 언급되었듯이 내가 어떤 일에 집중하고 있으면 리뷰로 전환하는 것도 비용이 든다.
* 따라서 어떤 일에 몰입하고 있을 때는 리뷰를 미루더라도 일의 몰입이 어느정도 끝나면 리뷰를 진행한다.
* 아무리 못해도 working day 기준 2-3일내로 리뷰를 해주어야 작성자도 까먹지 않고 리뷰를 반영할 수 있다.
* 만약에 내 일이 너무 바쁘다면 리뷰어에게 바빠서 리뷰를 못한다고 말해주어야 리뷰어도 기다리지 않고 진행할 수 있다.

코드에 대한 지적을 나 자신에 대한 지적으로 받아들이면 안되고 코드 자체를 어떻게 개선할지에 집중해야 한다.
* 물론 표현에 따라 받아들이는 차이도 있을 수 있기 때문에 적절한 표현을 쓰는 것을 추천한다. e.g., `A 대신 B는 어떨까요?`
* 잘 작성한 부분에 대해서는 Impression을 적어두어도 좋다. e.g., `이런 방법으로 구현할 수도 있군요! 👍`

### 리뷰를 잘 받으려면 작성자도 노력해야한다.

리뷰를 받기 적절한 크기의 PR을 제공해야한다.
* 하나의 PR에 너무 많은 변경점이 들어가있으면 리뷰어가 파악하기 어렵다.

따라서 Trunk-based Development를 지향하는 것이 좋다: [DORA \| Capabilities: Trunk-based Development](https://dora.dev/capabilities/trunk-based-development/)

작업 단위를 작게 유지하면 피드백을 받기 훨씬 수월해진다: [DORA \| Capabilities: Working in Small Batches](https://dora.dev/capabilities/working-in-small-batches/)
* 작업을 쪼개는 방법:
  1. `git checkout <branch> -- <path>` - 참고: [Git \| newhigen](https://newhigen.github.io/git)
  2. ...

### 추천 가이드: [Google Engineering Practices Documentation](https://google.github.io/eng-practices/)

리뷰어와 작성자 각각 가이드가 잘 작성되어있음.
* 리뷰어 가이드: [How to do a code review](https://google.github.io/eng-practices/review/reviewer/)
* 작성자 가이드: [The CL author’s guide to getting through code review](https://google.github.io/eng-practices/review/developer/)

### 자료

* LINE - [효과적인 코드 리뷰를 위해서](https://engineering.linecorp.com/ko/blog/effective-codereview)
* Kakao - [효과적인 코드리뷰를 위한 리뷰어의 자세](https://tech.kakao.com/posts/498) / [재택근무 환경에서 효율적인 코드 리뷰 방법: 팀 그라운드 룰 정하기](https://tech.kakaopay.com/post/remote-work-code-review/)
* 삼성SDS - [글로벌기업은 코드 리뷰를 어떻게 할까요?](https://www.samsungsds.com/kr/insights/global_code_review.html)
* 뱅크샐러드 - [코드 리뷰 in 뱅크샐러드 개발 문화](https://blog.banksalad.com/tech/banksalad-code-review-culture/)
* Etc. - [코드 리뷰가 개발 문화에 미치는 영향](https://yozm.wishket.com/magazine/detail/1957/)

## Commit Message 잘 작성하는 방법

의도를 적는다. ('무엇을'보다 '왜')

여기에 더해서 한 커밋이 한 가지의 의도를 담는다.
* 의도의 범위는 주관적이기 때문에 보편적인 기준을 잡기 어렵다. 맥락을 생각한다.[^context]
* 되돌리는 시나리오를 생각해보면 좋다. 커밋 단위로 되돌리기 작업을 해야하는데, 의도로 쪼개져있으면 의도 단위로 다루기 좋다.

### 자료

* [How to Write a Git Commit Message](https://cbea.ms/git-commit/)



[^context]: [도서] 실용주의 사고와 학습
[^toss-cr]: [저맥락, 고맥락 _ 코드 리뷰할 시간이 어딨어요? 모닥불 | EP.12](https://toss.im/career/recruit/tech-blog/code-review)