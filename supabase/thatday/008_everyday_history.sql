-- Reviewed everyday history. Requires existing thatday schema and review_details migration.
-- INSERT ONLY: existing events, sources, personal records and schema are unchanged.
-- Month/year day 01 is a storage anchor; date_precision preserves uncertainty.
BEGIN;
LOCK TABLE public.thatday_historical_events IN SHARE ROW EXCLUSIVE MODE;
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-plastic-1952','플라스틱 빗과 비눗갑 생산','락희화학이 오리엔탈 상표의 플라스틱 생활용품을 생산했다. 사출성형기를 들여와 빗과 비눗갑을 만들었다.','1952-08-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1952-08","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1952-08-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('플라스틱 빗과 비눗갑 생산','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-plastic-1952:source:0','LG 역사: 창업과 개척','https://lg.co.kr/about/history/1','LG','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-floor-1957','락희화학 비닐장판 개발','락희화학이 비닐장판을 개발했다. 실내 바닥에 쓰이는 합성수지 생활용품의 기록이다.','1957-01-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"뜻밖의 사실","date_basis":"1957-01","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1957-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('락희화학 비닐장판 개발','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-floor-1957:source:0','LG 역사: 창업과 개척','https://lg.co.kr/about/history/1','LG','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-kingdrops-1957','킹드롭프스 출시','동양제과가 킹드롭프스를 선보였다. 근대식 캔디 제조 시설을 도입하던 시기의 사탕이다.','1957-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1957","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1957-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('킹드롭프스 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-kingdrops-1957:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-radio-1959','국산 라디오 금성 A-501 출시','금성사가 A-501 라디오를 판매하기 시작했다. 외국산 라디오가 귀한 물건이던 때 국내에서 만든 탁상형 라디오가 등장했다.','1959-11-15',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1959-11-15","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1959-11-15'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('국산 라디오 금성 A-501 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-radio-1959:source:0','한국의 광고: 국산 라디오 광고','https://contents.history.go.kr/data/pdf/km/km_020.pdf','국사편찬위원회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-radio-1959:source:1','LG전자 역사','https://www.lge.co.kr/company/info/history','LG전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-mommy-1960','마미비스킷 출시','동양제과가 마미비스킷을 출시했다. 회사 연혁에 현대식 비스킷 제품으로 기록되어 있다.','1960-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1960","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1960-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('마미비스킷 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-mommy-1960:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-telephone-1961','금성 자동전화기 GS-1 개발','금성사가 자동전화기 금성 1호 GS-1을 개발했다. 국산 전화기 제조의 초기 기록이다.','1961-07-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1961-07","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1961-07-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('금성 자동전화기 GS-1 개발','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-telephone-1961:source:0','LG전자 역사','https://www.lge.co.kr/company/info/history','LG전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-cream-1964','삼립 크림빵 출시','삼립이 크림빵을 처음 선보였다. 빵을 비닐로 포장해 판매한 제품으로 기록되어 있다.','1964-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1964","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1964-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('삼립 크림빵 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-cream-1964:source:0','삼립 연혁','https://spcsamlip.co.kr/company/history','삼립','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-cream-1964:source:1','SPC: 제빵에서 시작한 기업의 역사','https://imgkr.seoul.co.kr/news/plan/corporate-industry-narrative-2024/2025/10/21/20251021020001','서울신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-fridge-1965','금성 냉장고 GR-120 개발','금성사가 GR-120 냉장고를 개발했다. LG전자 연혁이 국내 첫 냉장고 개발로 기록한 모델이다.','1965-04-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1965-04","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1965-04-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('금성 냉장고 GR-120 개발','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-fridge-1965:source:0','LG전자 역사','https://www.lge.co.kr/company/info/history','LG전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-tv-1966','금성 흑백 TV VD-191 생산','금성사가 국산 흑백 텔레비전 VD-191을 생산했다. 방송국 개국과 구분되는 수상기 제조의 기록이다.','1966-08-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1966-08","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1966-08-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('금성 흑백 TV VD-191 생산','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-tv-1966:source:0','LG전자 역사','https://www.lge.co.kr/company/info/history','LG전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-aircon-1968','금성 에어컨 GA-111 생산','금성사가 에어컨 GA-111을 생산했다. 가정과 건물의 냉방 기기를 국내에서 만들기 시작한 시기의 제품이다.','1968-03-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1968-03","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1968-03-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('금성 에어컨 GA-111 생산','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-aircon-1968:source:0','LG전자 역사','https://www.lge.co.kr/company/info/history','LG전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-washer-1969','금성 세탁기 WP-181 개발','금성사가 세탁기 WP-181을 개발했다. 빨래를 돕는 국산 가전제품의 초기 모델이다.','1969-05-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1969-05","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1969-05-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('금성 세탁기 WP-181 개발','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-washer-1969:source:0','LG전자 역사','https://www.lge.co.kr/company/info/history','LG전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-hoppang-1971','삼립호빵 출시','삼립이 호빵을 처음 출시했다. 연구개발을 거쳐 겨울에 데워 먹는 포장 빵을 선보였다.','1971-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1971","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1971-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('삼립호빵 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-hoppang-1971:source:0','삼립 연혁','https://spcsamlip.co.kr/company/history','삼립','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-hoppang-1971:source:1','SPC: 제빵에서 시작한 기업의 역사','https://imgkr.seoul.co.kr/news/plan/corporate-industry-narrative-2024/2025/10/21/20251021020001','서울신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-shrimp-1971','새우깡 출시','농심이 새우깡을 내놓았다. 라면을 만들던 회사가 새우 맛 스낵으로 제품 영역을 넓힌 기록이다.','1971-12-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1971-12","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1971-12-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('새우깡 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-shrimp-1971:source:0','농심 공식 연혁','https://www.nongshim.com/introduce/history','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-shrimp-1971:source:1','농심 2017 연차보고서: 제품 출시 연표','https://image.nongshim.com/non/cir/Nongshim_2017AR_Korean.pdf','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-chocopie-1974','오리온 초코파이 출시','동양제과가 초코파이를 출시했다. 오늘날 초코파이情으로 이어지는 제품의 첫 출시 연도다.','1974-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1974","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1974-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('오리온 초코파이 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-chocopie-1974:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-together-1974','투게더 아이스크림 출시','대일유업이 생우유를 넣은 투게더 아이스크림을 선보였다. 미국 업체와의 기술 제휴를 바탕으로 만든 제품이다.','1974-01-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1974-01","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1974-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('투게더 아이스크림 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-together-1974:source:0','2025 지속가능경영보고서: 투게더 출시년월','https://www.bing.co.kr/upload/esg/2025%20빙그레%20지속가능경영보고서.pdf','빙그레','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-together-1974:source:1','한국민족문화대백과사전: 빙그레','https://encykorea.aks.ac.kr/Article/E0080075','한국학중앙연구원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-banmilk-1974','바나나맛우유 출시','빙그레의 전신 대일유업이 바나나맛우유를 선보였다. 단지 모양 용기는 반투명하게 만들어 우유의 노란빛이 드러나도록 했다.','1974-06-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1974-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","date_resolution":"백과사전 본문 내 월 표기가 혼재해 제조사 보고서 1974.06과 한국문화원 기사로 확인","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1974-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('바나나맛우유 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-banmilk-1974:source:0','2022 지속가능경영보고서: 바나나맛우유 출시년월','https://www.bing.co.kr/upload/esg/2022빙그레지속가능경영보고서.pdf','빙그레','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-banmilk-1974:source:1','한국의 장수상품: 바나나맛우유','https://www.korean-culture.org/koreanet/view.do?seq=3308','문화체육관광부 해외문화홍보원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-coffee-1976','동서식품 커피믹스 개발','동서식품이 커피와 크림, 설탕을 함께 담은 커피믹스를 개발했다. 재료를 각각 덜지 않고 물에 타 마실 수 있는 방식이었다.','1976-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"뜻밖의 사실","date_basis":"1976","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1976-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('동서식품 커피믹스 개발','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-coffee-1976:source:0','우리나라 커피의 변천사','https://webzine.nfm.go.kr/2021/06/02/우리나라-커피의-변천사/','국립민속박물관','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-coffee-1976:source:1','우리나라를 빛낸 발명품 10선','https://www.korea.kr/briefing/policyBriefingView.do?newsId=148837505','특허청','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-squid-1976','오징어땅콩 출시','동양제과가 오징어땅콩을 출시했다. 회사 공식 연혁에 남아 있는 1970년대 스낵 제품이다.','1976-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1976","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1976-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('오징어땅콩 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-squid-1976:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-banana-1978','바나나킥 출시','농심이 바나나 향을 살린 옥수수 스낵 바나나킥을 출시했다. 옥수수를 주원료로 해 입안에서 부드럽게 녹는 식감을 낸 제품이다.','1978-05-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1978-05","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1978-05-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('바나나킥 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-banana-1978:source:0','바나나킥 브랜드: 출시년월','https://brand.nongshim.com/bananakicksnack/main/index','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-banana-1978:source:1','농심 2017 연차보고서: 제품 출시 연표','https://image.nongshim.com/non/cir/Nongshim_2017AR_Korean.pdf','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-lotteria-1979','롯데리아 소공점 개점','롯데리아 첫 매장이 서울 소공동에 문을 열었다. 호텔롯데 개장과 같은 날 시작한 햄버거 매장이었다.','1979-10-25',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1979-10-25","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1979-10-25'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('롯데리아 소공점 개점','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-lotteria-1979:source:0','프랜차이즈월드: 한국 패스트푸드의 역사','https://www.ikfa.or.kr/data/pdf/world/world_07.pdf','한국프랜차이즈산업협회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-potato-1980','농심 포테토칩 출시','농심이 생감자로 만든 포테토칩을 출시했다. 감자를 원료로 하는 스낵 제품군의 초기 기록이다.','1980-07-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1980-07","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1980-07-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('농심 포테토칩 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-potato-1980:source:0','포테토칩 브랜드관: 출시년월','https://brand.nongshim.com/potatochip/main/index','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-sing-1980','전국노래자랑 첫 방송','KBS 전국노래자랑이 방송을 시작했다. 지역 주민이 무대에서 노래와 장기를 선보이는 공개 참여 프로그램이다.','1980-11-09',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"1980-11-09","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1980-11-09'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('전국노래자랑 첫 방송','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-sing-1980:source:0','KBS사람 719호: 전국노래자랑','https://padmin.static.kbs.co.kr/nbroad/2021/5/17/1621209745010_nbroad.pdf','KBS','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-yukgaejang-1982','육개장 사발면 출시','농심이 육개장 사발면을 출시했다. 봉지에 끓이는 라면과 달리 용기에 물을 부어 먹는 제품이다.','1982-11-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1982-11","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1982-11-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('육개장 사발면 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-yukgaejang-1982:source:0','농심 2017 연차보고서: 제품 출시 연표','https://image.nongshim.com/non/cir/Nongshim_2017AR_Korean.pdf','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-yukgaejang-1982:source:1','육개장사발면 가격 변천사와 1982년 11월 출시','https://news.einfomax.co.kr/news/articleView.html?idxno=4436444','연합인포맥스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-pager-1982','수도권 무선호출기 서비스 시작','수도권에서 무선호출기 서비스가 시작됐다. 초기에는 신호음으로 호출을 알렸고 숫자를 표시하는 방식은 이후 도입됐다.','1982-12-15',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1982-12-15","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1982-12-15'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('수도권 무선호출기 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-pager-1982:source:0','SK텔레콤 40년사','https://www.sktelecom.com/assets/pdf/skt40th_s.pdf','SK텔레콤','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-pager-1982:source:1','새국어생활 2013 봄: 무선호출기와 숫자 의사소통','https://www.korean.go.kr/nkview/nklife/2013_1/23_0102.pdf','국립국어원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-diget-1983','다이제 출시','동양제과가 비스킷 다이제를 출시했다. 회사 공식 연혁에서 확인되는 장수 과자의 출발점이다.','1983-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1983","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1983-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('다이제 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-diget-1983:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-uniform-1983','중·고등학교 교복 자율화 전면 시행','중·고등학교에서 자유복 등교가 전면 시행됐다. 1982년의 시범 실시와 구분되는 조치다.','1983-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1983","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1983-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('중·고등학교 교복 자율화 전면 시행','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-uniform-1983:source:0','기록으로 살펴보는 의식주: 교복자율화','https://theme.archives.go.kr/next/education2010/wear04.do','국가기록원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-uniform-1983:source:1','교복·두발 자율화 조치','https://encykorea.aks.ac.kr/Article/E0076165','한국학중앙연구원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-dooly-1983','아기공룡 둘리 연재 시작','김수정의 아기공룡 둘리가 만화잡지 보물섬에 처음 실렸다. TV 애니메이션보다 먼저 만화로 독자를 만났다.','1983-04-22',NULL,'day','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"1983-04-22","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1983-04-22'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('아기공룡 둘리 연재 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-dooly-1983:source:0','둘리가 벌써 서른: 보물섬 첫 연재','https://imnews.imbc.com/replay/2013/nwdesk/article/3271179_30357.html','MBC','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-dooly-1983:source:1','오늘은 둘리 32살 생일','https://view.asiae.co.kr/article/2015042210290804356','아시아경제','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-ansung-1983','안성탕면 출시','농심이 안성탕면을 출시했다. 스프 전문 공장을 세운 뒤 진공 건조 방식의 스프를 적용한 제품이었다.','1983-09-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1983-09","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1983-09-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('안성탕면 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-ansung-1983:source:0','안성탕면 브랜드관: 출시년월','https://brand.nongshim.com/ansung/product/index','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-ansung-1983:source:1','1983년 9월 출시된 안성탕면 35년','https://www.edaily.co.kr/News/Read?mediaCodeNo=257&newsId=01866326619311912','이데일리','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-jjapa-1984','짜파게티 출시','농심이 짜파게티를 출시했다. 집에서 조리해 먹는 짜장 라면 제품의 기록이다.','1984-03-19',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1984-03-19","date_note":"제조사 출시 기념 보도자료와 언론 기사에 명시된 발매일","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1984-03-19'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('짜파게티 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-jjapa-1984:source:0','짜파게티 36주년: 1984년 3월 19일 출시','https://www.nongshim.com/promotion/notice/press_view?groupCode=003&groupId=505&page=10','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-jjapa-1984:source:1','기생충 열풍에 짜파게티 해외서 제2 전성기','https://www.hankyung.com/article/202003181022i','한국경제','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-paldo-bibim-1984','팔도 비빔면 출시','팔도가 비빔면을 출시했다. 국물 라면과 달리 삶은 면을 비벼 먹는 제품이었다.','1984-06-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1984-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"제조사 공식 연혁의 출시년월 확인"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1984-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('팔도 비빔면 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-paldo-bibim-1984:source:0','팔도 공식 연혁: 비빔면 출시','https://paldofood.co.kr/intro/history','팔도','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-shin-1986','신라면 출시','농심이 신라면을 출시했다. 출시 시점은 회사 공식 제품 연표의 1986년 10월을 기준으로 삼았다.','1986-10-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1986-10","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1986-10-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('신라면 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-shin-1986:source:0','농심 2017 연차보고서: 제품 출시 연표','https://image.nongshim.com/non/cir/Nongshim_2017AR_Korean.pdf','농심','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-phonecard-1986','카드식 공중전화 설치','전화카드를 사용하는 공중전화가 설치됐다. 동전만 넣던 방식과 구분되는 공중전화의 변화다.','1986-10-20',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1986-10-20","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1986-10-20'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카드식 공중전화 설치','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-phonecard-1986:source:0','정책연구 10-15: 국내 번호제도 및 체계 59쪽','https://www.kcc.go.kr/download.do?fileSeq=32037','방송통신위원회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-poca-1988','포카칩 출시','동양제과가 생감자 스낵 포카칩을 출시했다. 같은 해 감자연구소도 설립했다.','1988-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1988","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1988-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('포카칩 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-poca-1988:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-mcd-1988','맥도날드 압구정점 개점','한국 첫 맥도날드 매장이 서울 압구정동에 문을 열었다. 서울올림픽이 열리던 해 등장한 외식 공간이다.','1988-03-29',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1988-03-29","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1988-03-29'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('맥도날드 압구정점 개점','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-mcd-1988:source:0','1988년 맥도날드 국내 1호점 개점','https://v.daum.net/v/20100328175310746','경향신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-mcd-1988:source:1','맥도날드의 35년 한국 사회 정착 이야기','https://www.segye.com/newsView/20230714515540','세계일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-mobile-1988','한국이동통신 휴대전화 서비스 시작','한국이동통신이 서울에서 아날로그 휴대전화 서비스를 시작했다. 자동차에 설치하는 카폰과 구분되는 손에 들고 쓰는 이동전화였다.','1988-07-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1988-07","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1988-07-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('한국이동통신 휴대전화 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-mobile-1988:source:0','SK텔레콤 40년사','https://www.sktelecom.com/assets/pdf/skt40th_s.pdf','SK텔레콤','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-collect-1988','수신자부담 공중전화 서비스 시작','공중전화에서 전화를 받는 사람이 요금을 내는 서비스가 시작됐다. 통화 요금을 부담하는 쪽을 바꾼 전화 서비스다.','1988-09-01',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1988-09-01","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1988-09-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('수신자부담 공중전화 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-collect-1988:source:0','정책연구 10-15: 국내 번호제도 및 체계 59쪽','https://www.kcc.go.kr/download.do?fileSeq=32037','방송통신위원회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-hwp-1989','아래아한글 1.0 출시','국산 워드프로세서 아래아한글 1.0이 출시됐다. 한글과컴퓨터 법인 설립보다 앞선 소프트웨어의 출발점이다.','1989-01-01',NULL,'year','기술','verified','{"batch":"everyday-history-20261101","theme":"뜻밖의 사실","date_basis":"1989","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1989-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('아래아한글 1.0 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-hwp-1989:source:0','1989년 아래아한글 1.0 출시','https://www.khan.co.kr/article/201004231753145','경향신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-hwp-1989:source:1','창립 21주년 보도자료: 1989년 아래아한글','https://www.newswire.co.kr/newsRead.php?no=574984','한글과컴퓨터','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-seven-1989','세븐일레븐 올림픽점 개점','서울 방이동에 세븐일레븐 올림픽점이 문을 열었다. 한국 편의점 산업의 초기 매장으로 기록된다.','1989-05-06',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1989-05-06","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1989-05-06'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('세븐일레븐 올림픽점 개점','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-seven-1989:source:0','기업탐방: 코리아세븐','https://www.korearatings.com/component/webzine/674/kr674.pdf','한국기업평가','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-gs-1990','LG25 경희점 개점','오늘날 GS25로 이어지는 LG25의 첫 매장이 문을 열었다. 서울 경희대학교 앞에서 시작한 편의점이다.','1990-12-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1990-12","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1990-12-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('LG25 경희점 개점','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-gs-1990:source:0','기업연혁: LG25 경희점 개점','https://hpimg.gsretail.com/gsretail/ko/intro/history','GS리테일','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-gs-1990:source:1','서른 살 GS25','https://www.khan.co.kr/article/202001021836001','경향신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-seo-1992','서태지와 아이들 정규 1집 발매','난 알아요가 수록된 서태지와 아이들의 첫 음반이 나왔다. 방송 출연일과 구분되는 앨범 발매일이다.','1992-03-23',NULL,'day','음악','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"1992-03-23","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1992-03-23'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('서태지와 아이들 정규 1집 발매','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-seo-1992:source:0','아카이브조선: 서태지와 아이들 첫 음반 발매','https://history.chosun.com/history/popup.jsp?id=20000421_0002','조선일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-seo-1992:source:1','서태지 데뷔 30주년: 정규 1집 발매','https://mobile.newsis.com/view/NISX20220306_0001783107','뉴시스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-emart-1993','이마트 창동점 개점','신세계가 서울 창동에 이마트 첫 매장을 열었다. 할인마트라는 새로운 장보기 공간이 등장했다.','1993-11-12',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"1993-11-12","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1993-11-12'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('이마트 창동점 개점','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-emart-1993:source:0','서울미래유산: 이마트 창동점','https://futureheritage.seoul.go.kr/futureHeritageMeet/futureHeritage/view.do?htNo=498','서울특별시','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-now-1994','PC통신 나우누리 등장','나우누리가 PC통신 서비스에 합류했다. 하이텔·천리안과 함께 1990년대 게시판과 동호회 문화를 이루었다.','1994-01-01',NULL,'year','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1994","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1994-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('PC통신 나우누리 등장','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-now-1994:source:0','디지털 기억: 온라인 서비스 판도 변화','https://weekly.khan.co.kr/article/201302251623081','경향신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-now-1994:source:1','접속만 해도 가슴 벅차던 그 시절의 천리안','https://www.ilovepc.co.kr/news/articleView.html?idxno=3114','PC사랑','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-dimchae-1995','김치냉장고 딤채 출시','김치 숙성과 보관을 위한 딤채가 출시됐다. 김치를 뜻하는 옛말을 제품 이름으로 삼았다.','1995-11-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"뜻밖의 사실","date_basis":"1995-11","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1995-11-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('김치냉장고 딤채 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-dimchae-1995:source:0','딤채 브랜드 역사','https://winia.com/brand/brand/brandInfo?type=3','위니아','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-dimchae-1995:source:1','도메인 분쟁 결정 D2007-0658: 딤채 출시 사실관계','https://www.wipo.int/amc/en/domains/decisions/pdf/2007/d2007-0658.pdf','세계지식재산기구','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-uni-1996','PC통신 유니텔 등장','삼성SDS의 유니텔이 서비스를 시작했다. 영화 접속의 채팅 장면에도 등장한 PC통신 공간이다.','1996-01-01',NULL,'year','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1996","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1996-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('PC통신 유니텔 등장','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-uni-1996:source:0','유니텔 6월 30일 서비스 종료 안내','https://www.donga.com/news/It/article/all/20220306/112194183/9','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-uni-1996:source:1','디지털 기억: 온라인 서비스 판도 변화','https://weekly.khan.co.kr/article/201302251623081','경향신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-cdma-1996','한국이동통신 CDMA 가입자 개통','한국이동통신 남인천영업소에서 CDMA 이동전화 가입자가 개통했다. 아날로그 이동전화와 구분되는 디지털 이동통신의 초기 장면이다.','1996-01-03',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"1996-01-03","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1996-01-03'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('한국이동통신 CDMA 가입자 개통','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-cdma-1996:source:0','담대한 도전이 만든 신화, CDMA 30년','https://news.sktelecom.com/223649','SK텔레콤','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-cdma-1996:source:1','SK텔레콤 40년사','https://www.sktelecom.com/assets/pdf/skt40th_s.pdf','SK텔레콤','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-school-1996','국민학교 명칭을 초등학교로 변경','교육법 개정에 따라 국민학교의 공식 명칭이 초등학교로 바뀌었다. 법률 개정일이 아닌 실제 시행일의 기록이다.','1996-03-01',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"1996-03-01","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1996-03-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('국민학교 명칭을 초등학교로 변경','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-school-1996:source:0','사료로 본 한국사: 국민학교 명칭 변경','https://contents.history.go.kr/front/hm/view.do?levelId=hm_125_0150','국사편찬위원회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-baram-1996','바람의나라 상용 서비스 시작','넥슨이 PC통신 천리안에서 바람의나라 상용 서비스를 시작했다. 김진의 만화를 바탕으로 한 그래픽 온라인 게임이다.','1996-04-05',NULL,'day','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"1996-04-05","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1996-04-05'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('바람의나라 상용 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-baram-1996:source:0','디지털 기업인 박물관: 바람의나라 서비스','https://fki-emuseum.or.kr/main/history/1990.do','한국경제인협회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-baram-1996:source:1','넥슨 사회공헌보고서 2022','https://ssl.nexon.com/s2/corporation/NXK/01company/Contribution2022/NEXON_Contribution_2022.pdf','넥슨','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-hatban-1996','햇반 출시','제일제당이 즉석밥 햇반을 출시했다. 밥을 상품으로 포장해 판매한 식생활의 기록이다.','1996-12-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"1996-12","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1996-12-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('햇반 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-hatban-1996:source:0','CJ제일제당 연혁','https://www.cj.co.kr/kr/aboutus/cj-cheiljedang/history','CJ제일제당','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-daiso-1997','아스코 이븐 플라자 천호동 매장 개점','다이소의 출발점이 된 균일가 생활용품점이 서울 천호동에 문을 열었다. 당시 간판 이름은 다이소가 아닌 아스코 이븐 플라자였다.','1997-05-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"뜻밖의 사실","date_basis":"1997-05","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1997-05-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('아스코 이븐 플라자 천호동 매장 개점','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-daiso-1997:source:0','다이소 천호동 첫 매장의 시작','https://www.daiso.co.kr/cs/notice/28','아성다이소','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-hanmail-1997','한메일 서비스 시작','다음이 무료 웹메일 한메일을 시작했다. 웹브라우저를 통해 전자우편을 이용하는 서비스였다.','1997-05-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"1997-05","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1997-05-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('한메일 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-hanmail-1997:source:0','카카오 연혁: 한메일과 서비스 개시','https://www.kakaocorp.com/page/about/milestones','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-lineage-1998','리니지 정식 서비스 시작','엔씨소프트가 리니지 정식 서비스를 시작했다. 첫 서버 이름은 원작 만화의 주인공 이름을 딴 데포로쥬였다.','1998-09-01',NULL,'month','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"1998-09","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1998-09-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('리니지 정식 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-lineage-1998:source:0','리니지 디지털 아트북: 첫 정식 서비스','https://about.ncsoft.com/artbook/kr/lineage/','엔씨소프트','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-daumcafe-1999','다음카페 서비스 시작','다음이 관심사가 비슷한 이용자들이 모이는 카페 서비스를 시작했다. 정보 교환과 친목을 위한 온라인 커뮤니티 공간이었다.','1999-01-01',NULL,'year','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"1999","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1999-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('다음카페 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-daumcafe-1999:source:0','다음카페 서비스 소개: Since 1999','https://www.kakaocorp.com/page/service/service/DaumCafe','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-junior-1999','쥬니어네이버 서비스 시작','네이버가 어린이 전용 포털 쥬니어네이버를 선보였다. 성인용 포털과 구분해 어린이 이용자를 위한 공간을 마련했다.','1999-06-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"1999-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1999-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('쥬니어네이버 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-junior-1999:source:0','네이버 주요 연혁','https://www.navercorp.com/company/history','네이버','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-naver-1999','네이버 검색 포털 서비스 시작','네이버가 검색 포털 서비스를 시작했다. 회사 설립과 함께 검색 서비스를 내놓은 달이다.','1999-06-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"1999-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1999-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('네이버 검색 포털 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-naver-1999:source:0','네이버 주요 연혁','https://www.navercorp.com/company/history','네이버','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-hangame-1999','한게임 정식 서비스 시작','게임 포털 한게임이 정식으로 문을 열었다. 여러 온라인 게임을 한곳에서 제공하는 서비스였다.','1999-12-01',NULL,'month','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"1999-12","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='1999-12-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('한게임 정식 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-hangame-1999:source:0','NHN 회사소개와 연혁','https://www.nhn.com/en-US/company','NHN','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-hangame-1999:source:1','네이버 주요 연혁','https://www.navercorp.com/company/history','네이버','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-cy-2001','싸이월드 미니홈피 서비스 시작','싸이월드가 개인 중심의 미니홈피 서비스를 선보였다. 사진과 글을 올리고 미니룸을 꾸미는 공간으로 확장됐다.','2001-09-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2001-09","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2001-09-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('싸이월드 미니홈피 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-cy-2001:source:0','개인 미니홈피 세상 싸이월드 열풍','https://www.joongang.co.kr/article/317229','중앙일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-cy-2001:source:1','싸이월드 방문 수업: 회사 소개','https://biz.korea.ac.kr/news/news_view.html?no=85','고려대학교','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-kin-2002','네이버 지식iN 서비스 시작','이용자가 질문하고 다른 이용자가 답하는 지식iN이 문을 열었다. 검색 결과에 이용자들의 문답이 쌓이기 시작했다.','2002-10-07',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2002-10-07","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2002-10-07'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('네이버 지식iN 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-kin-2002:source:0','지식iN 10주년: 서비스 개시일','https://www.navercorp.com/media/pressReleasesDetail?seq=28650','네이버','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-kin-2002:source:1','디지털 기업인 박물관: 지식iN 론칭','https://www.fki-emuseum.or.kr/main/history/2000.do','한국경제인협회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-maple-2003','메이플스토리 서비스 시작','넥슨이 메이플스토리 서비스를 시작했다. 옆으로 이동하는 화면에서 캐릭터를 성장시키는 온라인 게임이다.','2003-04-29',NULL,'day','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2003-04-29","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2003-04-29'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('메이플스토리 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-maple-2003:source:0','메이플스토리 10주년 기념사','https://archive.maplestory.nexon.com/News/GMsDiary/127?p=4','넥슨','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-maple-2003:source:1','메이플스토리 서비스 4주년','https://www.etnews.com/200704240034','전자신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-blog-2003','네이버 블로그 서비스 시작','네이버가 블로그 서비스를 시작했다. 개인이 글과 사진을 쌓아 가는 온라인 기록 공간이었다.','2003-10-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2003-10","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2003-10-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('네이버 블로그 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-blog-2003:source:0','14년 역사 네이버 블로그','https://news.bizwatch.co.kr/article/mobile/2017/12/06/0010','비즈워치','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-blog-2003:source:1','네이버 파워블로거 제도 종료와 블로그 연혁','https://www.ytn.co.kr/_ln/0103_201604141700063095','YTN','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-pororo-2003','뽀롱뽀롱 뽀로로 첫 방송','뽀롱뽀롱 뽀로로가 EBS에서 처음 방송됐다. 기획·제작사가 함께 만든 유아용 3D 애니메이션이다.','2003-11-27',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2003-11-27","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2003-11-27'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('뽀롱뽀롱 뽀로로 첫 방송','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-pororo-2003:source:0','뽀롱뽀롱 뽀로로','https://encykorea.aks.ac.kr/Article/E0074414','한국학중앙연구원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-pororo-2003:source:1','캐릭터산업백서: 뽀로로 첫 방송','https://www.kocca.kr/knowledge/publication/indu/__icsFiles/afieldfile/2012/12/06/C71RmQUXTPSz.pdf','한국콘텐츠진흥원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-010-2004','휴대전화 통합 식별번호 010 도입','휴대전화 신규 가입자 등에 공통 식별번호 010이 부여되기 시작했다. 기존 가입자의 모든 번호가 이날 일괄 변경된 것은 아니다.','2004-01-01',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2004-01-01","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2004-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('휴대전화 통합 식별번호 010 도입','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-010-2004:source:0','이동전화 번호제도 개선계획','https://www.kisdi.re.kr/report/fileView.do?arrMasterId=3934566&id=528874&key=m2101113025931','정보통신정책연구원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-010-2004:source:1','010 통합번호 도입과 가입자 변화','https://www.mk.co.kr/news/all/3852432','매일경제','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-webtoon-2004','네이버 웹툰 서비스 시작','네이버가 웹툰 서비스를 시작했다. 이후 도전만화 등을 통해 새 작가와 작품을 만나는 플랫폼으로 이어졌다.','2004-06-01',NULL,'month','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2004-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2004-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('네이버 웹툰 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-webtoon-2004:source:0','마음의 소리 1000회로 보는 네이버 웹툰의 역사','https://byline.network/2015/12/1-19/','바이라인네트워크','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-bus-2004','서울 대중교통체계 개편 시행','서울에서 버스 노선과 중앙버스전용차로, 환승할인 체계가 개편됐다. 시행 초기에는 단말기 오류와 노선 변경으로 혼란도 겪었다.','2004-07-01',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2004-07-01","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2004-07-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('서울 대중교통체계 개편 시행','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-bus-2004:source:0','서울시 교통·환경정책의 평가','https://www.si.re.kr/sites/default/files/2005-R-12_0.pdf','서울연구원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-bus-2004:source:1','다시 쓰는 2004뉴스: 서울 대중교통체계 개편','https://www.donga.com/news/IssueSerial/article/all/20041223/8142281/1','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-kart-2004','카트라이더 상용 서비스 시작','카트라이더가 상용 서비스를 시작했다. 6월의 공개 시험 서비스와 구분되는 정식 상용화 기록이다.','2004-08-18',NULL,'day','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2004-08-18","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2004-08-18'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카트라이더 상용 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-kart-2004:source:0','카트라이더가 걸어온 길','https://www.etnews.com/200607080020','전자신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-kart-2004:source:1','카트라이더 서비스 연표','https://dh.aks.ac.kr/Edu/wiki/index.php/카트라이더','한국학중앙연구원 DH 교육용 위키','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-happybean-2005','해피빈 서비스 시작','네이버가 온라인 기부 포털 해피빈을 시작했다. 인터넷에서 기부 활동을 연결하는 서비스였다.','2005-07-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2005-07","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2005-07-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('해피빈 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-happybean-2005:source:0','네이버 주요 연혁','https://www.navercorp.com/company/history','네이버','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-infinite-2006','무한도전 독립 프로그램 첫 방송','무한도전이 독립 프로그램으로 방송을 시작했다. 2005년 코너로 출발한 무모한 도전과 구분되는 편성의 기록이다.','2006-05-06',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2006-05-06","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2006-05-06'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('무한도전 독립 프로그램 첫 방송','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-infinite-2006:source:0','무한도전 500회: 2006년 5월 6일 시작','https://m.imbc.com/Vod/VodPlay?broadcastID=1000786100692100000&progCode=1000786100000100000&type=VOD','MBC','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-infinite-2006:source:1','무한도전 400회: 독립 편성 첫 방송','https://www.kmib.co.kr/article/view.asp?arcid=0922812089','국민일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-hitelend-2007','하이텔VT 서비스 종료','KTH가 하이텔의 문자 기반 VT 서비스를 종료했다. 이후에도 남은 웹 서비스 전체의 종료와는 다른 기록이다.','2007-02-28',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2007-02-28","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2007-02-28'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('하이텔VT 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-hitelend-2007:source:0','하이텔VT 2007년 2월 28일 종료 안내','https://m.etnews.com/200701290166','전자신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-hitelend-2007:source:1','접속만 해도 가슴 벅차던 그 시절의 천리안','https://www.ilovepc.co.kr/news/articleView.html?idxno=3114','PC사랑','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-ticket-2009','수도권 지하철 1회용 교통카드 도입','종이승차권을 대체하는 1회용 교통카드가 도입됐다. 운임에 보증금 500원을 더 내고 도착 후 카드를 반환하면 돌려받는 방식이었다.','2009-05-01',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2009-05-01","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2009-05-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('수도권 지하철 1회용 교통카드 도입','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-ticket-2009:source:0','1회용 교통카드 정착: 시스템 오픈 2009.5.1','https://ms.smc.seoul.kr/attach/record/SEOUL/appendix/a08/A0026299.pdf?time=20260415193819','서울특별시의회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-ticket-2009:source:1','지하철 1회용 교통카드 도입','https://news.imbc.com/replay/2009/nwdesk/article/2327118_30553.html','MBC','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-iphone-2009','아이폰 국내 공식 출시','KT가 아이폰의 국내 판매와 개통을 시작했다. 잠실실내체육관에서 예약 고객을 대상으로 출시 행사를 열었다.','2009-11-28',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2009-11-28","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2009-11-28'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('아이폰 국내 공식 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-iphone-2009:source:0','아이폰 오늘 공식 출시','https://www.yna.co.kr/amp/view/AKR20091128034700017','연합뉴스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-iphone-2009:source:1','아이폰 개통행사 런칭 페스티벌 개막','https://www.newspim.com/news/view/20091128000072','뉴스핌','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-kakao-2010','카카오톡 아이폰용 출시','아이폰용 카카오톡이 앱스토어에 등장했다. 인터넷 연결로 메시지를 주고받는 모바일 메신저였다.','2010-03-18',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2010-03-18","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2010-03-18'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오톡 아이폰용 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-kakao-2010:source:0','카카오톡의 역사와 주요 기능 연표','https://www.kakaocorp.com/page/detail/10810?lang=KOR','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-running-2010','런닝맨 첫 방송','SBS 런닝맨이 방송을 시작했다. 출연자들이 야외에서 달리고 미션을 해결하는 예능 프로그램이다.','2010-07-11',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2010-07-11","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2010-07-11'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('런닝맨 첫 방송','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-running-2010:source:0','SBS 사보 1082호: 런닝맨 7주년','https://www.sbssau.co.kr/file_news/3_662_a/SBS사보-1082.pdf','SBS','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-running-2010:source:1','런닝맨 첫 방송 이후 시청률 20% 돌파','https://www.donga.com/news/List/article/all/20120116/43346466/3','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-gift-2010','카카오톡 선물하기 서비스 시작','카카오톡 안에서 선물을 주고받는 선물하기가 시작됐다. 대화 상대에게 모바일로 선물을 보내는 서비스였다.','2010-12-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2010-12","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2010-12-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오톡 선물하기 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-gift-2010:source:0','카카오톡의 역사와 주요 기능 연표','https://www.kakaocorp.com/page/detail/10810?lang=KOR','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-lte-2011','SK텔레콤·LG유플러스 LTE 상용화','두 통신사가 한국에서 LTE 서비스를 시작했다. 첫 상용 서비스와 전국망 완성 시점은 구분된다.','2011-07-01',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2011-07-01","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2011-07-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('SK텔레콤·LG유플러스 LTE 상용화','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-lte-2011:source:0','LTE 상용화 3년: 2011년 7월 1일 개시','https://www.yna.co.kr/view/AKR20140629001451017','연합뉴스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-lte-2011:source:1','SK텔레콤 40년사','https://www.sktelecom.com/assets/pdf/skt40th_s.pdf','SK텔레콤','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-emoji-2011','카카오톡 이모티콘 출시','카카오톡 대화에 이모티콘이 도입됐다. 문자 외에 캐릭터 이미지로 감정을 표현하는 상품이 등장했다.','2011-11-01',NULL,'month','문화','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2011-11","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2011-11-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오톡 이모티콘 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-emoji-2011:source:0','카카오톡의 역사와 주요 기능 연표','https://www.kakaocorp.com/page/detail/10810?lang=KOR','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-fiveday-2012','주5일 수업제 전면 도입','전국 학교에 주5일 수업제가 전면 도입됐다. 학교 여건에 따른 자율 시행과 함께 토요 프로그램도 마련됐다.','2012-03-01',NULL,'month','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2012-03","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2012-03-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('주5일 수업제 전면 도입','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-fiveday-2012:source:0','교육개발 2012 여름: 주5일 수업제 시행','https://www.kedi.re.kr/edzine/ednews/2012_06m/images/download.pdf','한국교육개발원','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-fiveday-2012:source:1','주5일 수업제 2012년 3월 도입','https://hangyo.com/news/article.html?no=76378','한국교육신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-story-2012','카카오스토리 출시','사진과 글로 일상을 공유하는 카카오스토리가 출시됐다. 카카오톡 친구 관계와 연결되는 모바일 SNS였다.','2012-03-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2012-03","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2012-03-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오스토리 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-story-2012:source:0','카카오스토리 스토리수 10억건 돌파','https://www.kakaocorp.com/page/detail/7958','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-voice-2012','카카오톡 보이스톡 출시','카카오톡에 인터넷 음성통화 기능 보이스톡이 추가됐다. 메시지 대화에서 목소리로도 연락할 수 있게 됐다.','2012-06-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2012-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2012-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오톡 보이스톡 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-voice-2012:source:0','카카오톡의 역사와 주요 기능 연표','https://www.kakaocorp.com/page/detail/10810?lang=KOR','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-paranend-2012','포털 파란닷컴 서비스 종료','KTH가 파란닷컴 포털 서비스를 종료했다. 메일과 블로그 자료는 다음의 서비스로 이전할 수 있도록 안내했다.','2012-07-31',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2012-07-31","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2012-07-31'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('포털 파란닷컴 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-paranend-2012:source:0','포털 파란닷컴 7월 31일 종료 안내','https://www.etnews.com/201206150143','전자신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-yahooend-2012','야후코리아 서비스 종료','야후코리아가 한국 포털 서비스를 종료했다. 미국 야후로 이전한 계정의 서비스와는 구분되는 한국 사업의 마무리다.','2012-12-31',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2012-12-31","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2012-12-31'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('야후코리아 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-yahooend-2012:source:0','야후코리아 15년 만에 서비스 종료','https://www.newspim.com/news/view/20121231000511','뉴스핌','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-yahooend-2012:source:1','야후 한국 포털사이트 철수','https://www.donga.com/news/home/article/all/20121231/51956709/3','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-nowend-2013','나우누리 서비스 종료','PC통신 나우누리가 서비스를 종료했다. 종료 전에는 자료 백업과 이전을 위해 무료 이용 기간을 운영했다.','2013-01-31',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2013-01-31","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2013-01-31'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('나우누리 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-nowend-2013:source:0','하이텔 이어 나우누리도 1월 31일 종료','https://inews24.com/view/721146','아이뉴스24','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-nowend-2013:source:1','나우누리 2013년 1월 말 서비스 종료','https://news.nate.com/view/20121208n04146','머니투데이','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-freechalend-2013','프리챌 커뮤니티 서비스 종료','프리챌의 커뮤니티 서비스가 문을 닫았다. 게임과 파일구리 서비스까지 모두 종료된 것은 아니었다.','2013-02-18',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2013-02-18","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2013-02-18'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('프리챌 커뮤니티 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-freechalend-2013:source:0','인터넷의 추억: 프리챌 커뮤니티 종료','https://weekly.khan.co.kr/article/201302251623051','경향신문','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-pcchat-2013','카카오톡 PC 버전 정식 출시','카카오톡 PC 버전이 정식 출시됐다. 휴대전화에서 하던 대화를 컴퓨터에서도 이어갈 수 있게 됐다.','2013-06-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2013-06","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2013-06-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오톡 PC 버전 정식 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-pcchat-2013:source:0','카카오톡의 역사와 주요 기능 연표','https://www.kakaocorp.com/page/detail/10810?lang=KOR','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-pay-2014','카카오페이 서비스 시작','카카오톡에 카드를 등록하고 비밀번호로 결제하는 카카오페이가 시작됐다. 출시 기념 이벤트가 열린 9월 15일과는 다른 날짜다.','2014-09-05',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2014-09-05","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2014-09-05'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오페이 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-pay-2014:source:0','카카오페이 출시 기념 이벤트: 9월 5일 서비스 시작','https://www.kakaocorp.com/page/detail/7576','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-taxi-2015','카카오택시 정식 서비스 시작','택시 기사와 승객을 앱으로 연결하는 카카오택시가 정식 출시됐다. 고급택시 서비스 블랙의 시작과는 구분된다.','2015-03-31',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2015-03-31","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2015-03-31'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오택시 정식 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-taxi-2015:source:0','카카오택시 블랙 운행 시작: 일반 카카오택시 개시일','https://www.kakaocorp.com/page/detail/7849','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-openchat-2015','카카오톡 오픈채팅 출시','카카오톡에 오픈채팅 기능이 추가됐다. 기존 친구 목록 밖에서도 주제별 대화방에 참여하는 기능이다.','2015-08-01',NULL,'month','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2015-08","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2015-08-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('카카오톡 오픈채팅 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-openchat-2015:source:0','카카오톡의 역사와 주요 기능 연표','https://www.kakaocorp.com/page/detail/10810?lang=KOR','카카오','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-sampay-2015','삼성페이 국내 서비스 시작','삼성전자가 한국에서 삼성페이를 선보였다. 스마트폰을 카드 결제 단말기에 가까이 대어 결제하는 서비스였다.','2015-08-20',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2015-08-20","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2015-08-20'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('삼성페이 국내 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-sampay-2015:source:0','삼성월렛 10주년','https://www.samsung.com/sec/business/insights/news/news_250825_05/','삼성전자','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-sampay-2015:source:1','삼성페이 국내 출시','https://www.donga.com/news/It/article/all/20150820/73152228/2','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-bike-2015','서울 공공자전거 따릉이 본격 운영','따릉이가 서울의 다섯 거점 지역에서 본격 운영을 시작했다. 150개 대여소와 자전거 2천 대 규모로 출발했다.','2015-10-15',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2015-10-15","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2015-10-15'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('서울 공공자전거 따릉이 본격 운영','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-bike-2015:source:0','서울 공공자전거 따릉이 본격 운영일','https://news.seoul.go.kr/traffic/archives/28411','서울특별시','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-bike-2015:source:1','서울 공공자전거 따릉이 15일부터 운영','https://www.donga.com/news/Society/article/all/20151015/74176530/1','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-netflix-2016','넷플릭스 한국 서비스 시작','넷플릭스가 한국에서 서비스를 시작했다. 미국 서부의 1월 6일 발표와 구분해 한국 날짜인 1월 7일로 기록했다.','2016-01-07',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2016-01-07","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2016-01-07'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('넷플릭스 한국 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-netflix-2016:source:0','한국 서비스 10주년: 한국 날짜 기준 2016년 1월 7일','https://about.netflix.com/ko/news/netflixkorea10yearanniversary','넷플릭스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-turtle-2017','꼬북칩 출시','오리온이 네 겹으로 만든 스낵 꼬북칩을 출시했다. 회사 공식 연혁에 4겹 스낵의 등장으로 기록되어 있다.','2017-01-01',NULL,'year','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"2017","date_note":"연도·월 정확도의 01은 저장용 기준값이며 실제 발생일을 뜻하지 않음","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2017-01-01'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('꼬북칩 출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-turtle-2017:source:0','오리온 연혁','https://www.orionworld.com/html/13','오리온','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-peng-2019','자이언트 펭TV 첫 방송','펭수가 등장하는 자이언트 펭TV가 EBS1에서 방송을 시작했다. 크리에이터를 꿈꾸는 펭귄 캐릭터의 성장기를 다뤘다.','2019-04-02',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2019-04-02","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2019-04-02'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('자이언트 펭TV 첫 방송','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-peng-2019:source:0','자이언트 펭TV 첫 방송 안내','https://about.ebs.co.kr/board/bbs?boardId=31&boardTypeId=1&cmd=view&no=15&option=&pageNo=461&postId=10004993123&searchCondition=title&searchKeyword=','EBS','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-mask-2020','공적 마스크 구매 5부제 시행','출생연도 끝자리에 따라 마스크를 살 수 있는 요일을 나누었다. 초기 구매 한도는 한 사람당 일주일에 두 장이었다.','2020-03-09',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2020-03-09","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2020-03-09'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('공적 마스크 구매 5부제 시행','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-mask-2020:source:0','마스크 5부제 시행 현황','https://eiec.kdi.re.kr/policy/materialView.do?datecount=&num=198536&pg=&pp=20&recommend=&topic=O','식품의약품안전처·KDI','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-mask-2020:source:1','공적 마스크 5부제 안내','https://www.gangnam.go.kr/board/article/4379/view.do?mid=ID01_05013','강남구','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-disney-2021','디즈니플러스 한국 서비스 시작','디즈니플러스가 한국에서 서비스를 시작했다. 웹사이트와 모바일 앱으로 영화와 시리즈를 제공했다.','2021-11-12',NULL,'day','영화·방송','verified','{"batch":"everyday-history-20261101","theme":"대중문화","date_basis":"2021-11-12","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2021-11-12'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('디즈니플러스 한국 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-disney-2021:source:0','Disney+ lands in South Korea','https://en.yna.co.kr/view/AEN20211112001200320','연합뉴스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-pokemon-2022','돌아온 포켓몬빵 재출시','삼립이 포켓몬빵을 다시 판매하기 시작했다. 최초 출시가 아닌 추억의 제품을 되살린 재출시 기록이다.','2022-02-24',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"음식·소비","date_basis":"2022-02-24","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2022-02-24'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('돌아온 포켓몬빵 재출시','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-pokemon-2022:source:0','포켓몬빵 2월 24일 재출시','https://www.newspim.com/news/view/20220303000775','뉴스핌','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-pokemon-2022:source:1','2022년 유통결산: 포켓몬빵','https://news.nate.com/view/20221228n28197','스포츠한국','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-cyback-2022','싸이월드 서비스 재개','싸이월드가 모바일 앱으로 서비스를 다시 열었다. 첫날에는 로그인 등이 가능했지만 사진첩 복원은 순차적으로 진행됐다.','2022-04-02',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2022-04-02","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2022-04-02'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('싸이월드 서비스 재개','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-cyback-2022:source:0','싸이월드 서비스 재개','https://www.donga.com/news/article/all/20220402/112660634/1','뉴시스','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-uniend-2022','유니텔 서비스 종료','유니텔이 서비스를 종료했다. 1996년 시작한 PC통신에서 웹 포털로 이어졌던 공간이 문을 닫았다.','2022-06-30',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2022-06-30","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2022-06-30'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('유니텔 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-uniend-2022:source:0','유니텔 6월 30일 서비스 종료 안내','https://www.donga.com/news/It/article/all/20220306/112194183/9','동아일보','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-mobileid-2022','모바일 운전면허증 전국 발급 시작','모바일 운전면허증을 전국에서 발급하기 시작했다. 일부 지역 시범 발급과 구분되는 전국 확대 기록이다.','2022-07-28',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2022-07-28","date_note":"출처에 명시된 사건 발생일 사용","source_count":2,"crosscheck_note":"서로 다른 발행기관 자료를 함께 확인함. 기업 제공 자료를 인용한 보도는 완전한 독립 증거로 단정하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2022-07-28'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('모바일 운전면허증 전국 발급 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-mobileid-2022:source:0','모바일 운전면허증 전국 발급 개시','https://www.mois.go.kr/frt/bbs/type013/commonSelectBoardArticle.do%3Bjsessionid%3D2s3H-8LTdf-c8pNG45eDFZ32.node50?bbsId=BBSMSTR_000000000411&nttId=95297','행정안전부','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01'),
('kr-life-mobileid-2022:source:1','7월 28일부터 전국 발급 가능한 모바일 운전면허증','https://www.fsc.go.kr/no040101?cnId=1264&curPage=236&pastPage=236&srchKey=&srchText=','금융위원회','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-applepay-2023','애플페이 한국 서비스 시작','애플페이가 한국에서 이용 가능해졌다. 출시 당시에는 현대카드를 등록해 지원 가맹점에서 사용할 수 있었다.','2023-03-21',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"인터넷·IT","date_basis":"2023-03-21","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2023-03-21'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('애플페이 한국 서비스 시작','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-applepay-2023:source:0','Apple Pay 대한민국 출시','https://www.apple.com/kr/newsroom/2023/03/apple-pay-launches-in-south-korea/','Apple','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-age-2023','만 나이 계산·표시 원칙 시행','민법과 행정기본법의 나이 계산·표시 원칙이 만 나이로 통일됐다. 별도 규정이 있는 법령까지 모두 같은 방식으로 바뀐 것은 아니다.','2023-06-28',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2023-06-28","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2023-06-28'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('만 나이 계산·표시 원칙 시행','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-age-2023:source:0','만 나이 개정 민법·행정기본법 시행','https://m.easylaw.go.kr/MOB/NtcInfoRetrieve.laf?ntcSeq=1442','법제처','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-chollend-2024','천리안 포털 서비스 종료','PC통신에서 출발해 포털로 이어진 천리안 서비스가 종료됐다. 옛 PC통신 접속 방식의 종료일과는 구분되는 기록이다.','2024-10-31',NULL,'day','기술','verified','{"batch":"everyday-history-20261101","theme":"사라진 일상","date_basis":"2024-10-31","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2024-10-31'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('천리안 포털 서비스 종료','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-chollend-2024:source:0','천리안 10월 31일 서비스 종료 안내','https://www.edaily.co.kr/News/Read?mediaCodeNo=257&newsId=03466966638952880','이데일리','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
WITH added AS (
 INSERT INTO public.thatday_historical_events(id,title,description,date_start,date_end,date_precision,category,verification_status,review_details)
 SELECT 'kr-life-resident-2025','모바일 주민등록증 전국 어디서나 발급','주민등록지와 관계없이 전국 행정복지센터에서 모바일 주민등록증을 신청할 수 있게 됐다. 2024년 시범 발급과 2025년 지역별 확대를 거친 조치다.','2025-03-28',NULL,'day','생활','verified','{"batch":"everyday-history-20261101","theme":"생활문화","date_basis":"2025-03-28","date_note":"출처에 명시된 사건 발생일 사용","source_count":1,"crosscheck_note":"1개 발행기관의 자료로 확인; 독립적인 2개 출처 검증으로 표시하지 않음"}'
 WHERE NOT EXISTS (SELECT 1 FROM public.thatday_historical_events
  WHERE date_start='2025-03-28'::date
  AND regexp_replace(title,'[[:space:][:punct:]]','','g')=regexp_replace('모바일 주민등록증 전국 어디서나 발급','[[:space:][:punct:]]','','g'))
 ON CONFLICT(id) DO NOTHING RETURNING id
)
INSERT INTO public.thatday_event_sources(id,event_id,source_title,source_url,publisher,license,retrieved_at)
SELECT s.id,added.id,s.title,s.url,s.publisher,s.license,s.retrieved::date
FROM added CROSS JOIN (VALUES ('kr-life-resident-2025:source:0','모바일 주민등록증 단계별 전국 시행 안내','https://www.incheon.go.kr/ml_kr/MLKR020401/3000625','인천광역시','Facts-only extraction; independently worded factual labels and context; original source rights reserved','2026-11-01')) AS s(id,title,url,publisher,license,retrieved);
COMMIT;
-- Read-only verification; 100 on a clean baseline, unchanged on repeat runs.
SELECT count(*) AS everyday_batch_events FROM public.thatday_historical_events WHERE review_details->>'batch'='everyday-history-20261101';
