Ontology → Design System Template Extractor 제품 명세서

이미 만든 문서들:

* [브랜드 온톨로지 기반 디자인 시스템 설정 방법론](sandbox:/mnt/data/DR_O_Ontology_Based_Design_System_Methodology.md)
* [AI홈페이지 디자인 시스템 설정 템플릿 구조 및 적용 가이드](sandbox:/mnt/data/AI_Homepage_Design_System_Template_and_Application_Guide.md)
* [Ontology → Design System Template Extractor 제품 명세서](sandbox:/mnt/data/Ontology_to_Design_System_Template_Extractor_Product_Spec.md)

이번 문서의 핵심은 이거다.

**브랜드 온톨로지에서 디자인 시스템 템플릿을 자동 추출하는 기능은 매우 유망하고, AI홈페이지 팩토리 SaaS의 핵심 모듈이 될 수 있다.**

왜냐하면 이 기능이 해결하는 문제가 분명하기 때문이다.

* 온톨로지와 디자인 시스템이 끊어지는 문제
* question-first 구조가 storefront로 회귀하는 문제
* compare / routine / trust 문법이 디자인 시스템에 반영되지 않는 문제
* tenant마다 zero-base로 디자인 시스템을 다시 만드는 문제

그래서 제품 명세서는 아래 구조로 잡았다.

* 입력: brand truth, question capital, ontology, product fit, trust rules, visual references
* 출력: design system foundation draft, settings template JSON, token profile, component contracts, prompt addendum, confidence report
* 파이프라인: signal extraction → visual parsing → design synthesis → template composition → token/component mapping → human review
* 가드레일: ontology incomplete, fit split 없음, trust architecture 없음, proof-style before/after 자동 생성 금지 등
* MVP: 신규 스킨케어 tenant 1개에 대해 foundation draft와 settings template draft 생성

정리하면,
이 기능은 **디자인을 자동으로 예쁘게 그리는 생성기**가 아니라,
**브랜드 의미 체계를 디자인 시스템 실행 규칙으로 번역하는 설계 자동화 엔진**으로 정의하는 것이 맞다.


