# 무료 위키 API 자료 수집

일반 공개 Wikidata·MediaWiki API를 사용합니다. API 키·유료 서비스·Supabase 비밀 키가 필요하지 않습니다. 방문자가 사이트를 열 때는 기존 Supabase 자료만 조회하며, 위키 API를 방문자마다 호출하지 않습니다.

## 실행

작업 원본 프로젝트:

```sh
npm run wiki:sync
```

기존 후보 4,565개 중 기본 100개를 확인하고 `outputs/wiki-review/`에 저장합니다. 다음 묶음은 `npm run wiki:sync -- --offset 100`으로 확인합니다. 한 번에 최대 500개, 실제 HTTP 요청은 25개씩 묶어 순차 실행합니다. 요청 사이 1.1초를 두고, 메타데이터는 7일간 재사용합니다. HTTP 429, maxlag, 네트워크 오류가 발생하면 반복 재시도 없이 중단하고 불완전한 결과임을 보고합니다.

새 후보 수집부터 실행하려면:

```sh
node scripts/collect-history.mjs --from 2024-01-01 --to 2026-11-01 --out outputs/wiki-collection
node scripts/sync-wiki.mjs --input outputs/wiki-collection/candidates.json --out outputs/wiki-review --limit 100
```

배포 Git 저장소에서는 위의 `scripts/`를 `tools/thatday/`로 바꿉니다. 기본 후보 파일은 원본 프로젝트에만 있으므로 Git 저장소에서는 새 후보 수집 명령부터 실행합니다.

## 생성 파일

- `review.html`: 사건명·날짜 정확도·검토 표시·출처를 모은 읽기 전용 검토 화면
- `candidates.json`: 검토 대상 사건과 Wikidata 최신 날짜 주장, 위키백과 문서 수정본 정보
- `report.json`: 성공/누락/오류·실제 API 요청 수·다음 시작 위치
- `pending.sql`: Supabase에 **검토 대기** 상태로 넣는 반복 실행 가능한 SQL
- `cache.json`: 다음 실행에서 재사용할 공개 API 메타데이터

## 공개 전 검토

자동 수집 결과는 전부 `pending_review`입니다. 날짜가 확인됐다는 이유만으로 대한민국의 주요 역사 사건이라는 의미는 아닙니다. 주요 사건 여부, 기존 사건과의 중복, 날짜·정확도, 출처를 검토해야 합니다. 월·연도 자료의 1일은 정렬 기준일이며 정확한 사건 날짜로 바꾸지 않습니다. 최신 주장과 기존 날짜가 다르면 원래 날짜를 덮어쓰지 않고 표시합니다.

Wikidata 항목의 한국어 문서 연결을 사용하고, Wikipedia API의 `wikibase_item`이 같은 Q ID인지 확인합니다. 동음이의 문서는 연결하지 않습니다. 임의의 검색 첫 결과를 정답으로 채택하지 않습니다. 문서 ID가 일치해도 역사적 사실의 독립적인 검증을 대신하지는 않습니다.

`pending.sql`을 실행해도 검토 대기는 공개 연대기에 나오지 않습니다. 기존 검증 사건은 덮어쓰지 않습니다. 승인하려면 검토한 항목만 별도 JSON으로 선택하고 출처·중복을 정리한 뒤 `verification_status`를 `verified`로 바꾸고 `import-history.mjs`로 별도 SQL을 생성합니다. 기존 사건과 같은 내용이라면 새 ID로 추가하지 않고 기존 ID를 유지해야 합니다.

## 저작권·개인정보

Wikidata 구조화 데이터의 CC0 정보를 보관합니다. 위키백과는 제목·공개 URL·수정본 번호·시간·문서 식별자만 받아 출처 링크로 연결하며, 본문·줄거리·사진·영상은 복사하지 않습니다. 추후 본문이나 미디어를 재사용하면 해당 자료의 라이선스와 기여자 표시 조건을 별도로 구현해야 합니다. 개인 기록, 사용자 식별자, 로그인 정보는 위키 API로 보내지 않습니다.

## 주기 수집

GitHub Actions `Thatday wiki research`는 매주 일요일 03:23 UTC에 최근 2개년부터 현재까지 후보를 수집해 최대 100개를 보완합니다. Actions의 Run workflow에서 시작·종료일과 다음 후보 위치를 지정할 수도 있습니다. 결과는 14일 보관하는 artifact로 내려받습니다. 자동 커밋·자동 공개·운영 DB 자동 수정은 하지 않습니다. GitHub의 예약 실행은 지연되거나 비활성화될 수 있으며 API 응답 실패는 실행 실패로 표시됩니다.

## 첫 실제 실행

2026-11-01: 기존 후보 100개 처리, 한국어 위키백과 수정본 링크 75개, 실제 요청 8회, 오류 0개. 승인된 공개 사건은 기존 639개를 유지합니다.

공식 문서:
- https://www.wikidata.org/wiki/Wikidata:Data_access
- https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
- https://www.mediawiki.org/wiki/API:Pageprops
- https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits

첫 묶음 100개는 운영 Supabase에도 `pending_review`로 저장했습니다. 공개 자료 639개(검증 634개 + 기존 예시 5개)는 유지하며 개인 기록은 수정하지 않았습니다. 전체 테스트 52개와 구문 검사를 통과했고, 재실행에서는 캐시 100개를 재사용하여 외부 API 요청 0회를 확인했습니다.
