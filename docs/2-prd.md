# PRD (Product Requirements Document)

**프로젝트명:** todolist-app  
**작성일:** 2026-04-01  
**버전:** 1.0.0  
**작성자:** Dan Jung  
**목표 출시일:** 2026-04-03

---

## 변경 이력

| 버전 | 작성일 | 변경 내용 | 작성자 |
|---|---|---|---|
| 1.0.0 | 2026-04-01 | 초안 작성 (1차 출시 범위) | Dan Jung |
| 1.0.1 | 2026-04-01 | 비밀번호 복잡도/길이 규칙 추가, 백엔드 JWT 인증 방식 명확화 | Dan Jung |
| 1.0.2 | 2026-04-01 | UC-05 페이지네이션 상세 명세 추가 (경계값 처리, 응답 구조, status 필터 DB 처리 방식) | Dan Jung |
| 1.0.3 | 2026-04-01 | 기술 스택 일관성 검토 반영: axios 1.x 추가, pg Connection Pool 설명 보완 | Dan Jung |

---

## 1. 제품 개요

### 1.1 배경 및 문제 정의
개인별 할일 관리 웹 애플리케이션입니다. 기존 일정 관리 앱의 한계점을 해결합니다:

- **문제점**
  - 개인 맞춤 관리 부재 (일반 일정 관리만 지원)
  - 할일 시작일/종료일 관리 기능 부족
  - 복수 프로젝트 환경에서 개인별 독립적 관리 불가

- **해결책**
  - 사용자 인증 기반 개인별 독립적인 할일 관리 환경
  - 시작일과 종료일을 구분하여 명확한 일정 관리
  - 할일 상태를 우선순위 기반으로 자동 분류

### 1.2 제품 목표

| 목표 | 설명 |
|---|---|
| **목표 1** | 사용자가 3분 이내에 회원가입/로그인 후 할일 생성 가능 |
| **목표 2** | 시작일/종료일에 기반한 직관적인 할일 상태 관리 |
| **목표 3** | 모든 사용자 세그먼트(10~50대)가 쉽게 이용할 수 있는 UI/UX |
| **목표 4** | 동시접속 500명 환경에서 안정적인 서비스 제공 |

---

## 2. 타겟 사용자

### 2.1 페르소나

**주요 페르소나: 직장인, 학생, 일반인**

| 특성 | 상세 |
|---|---|
| 연령대 | 10대 ~ 50대 (전 연령층) |
| 사용 목적 | 일일 업무, 학과 과제, 개인 프로젝트 관리 |
| 기술 수준 | 초급 ~ 중급 (스마트폰/웹 사용에 능숙) |
| 기기 | 모바일(스마트폰) + 데스크탑(PC/노트북) 병행 |
| 사용 빈도 | 일일 1회 이상 |

### 2.2 사용자 규모

- **등록 사용자:** 10만명
- **동시접속:** 500명
- **초기 타겟:** 국내 웹 서비스 이용자 (향후 국제화 고려)

---

## 3. 기능 요구사항

### 3.1 1차 출시 범위

**출시 기능:** UC-01 ~ UC-08 (8가지 유스케이스)  
**제외 기능:** UC-09 할일 삭제

### 3.2 기능별 상세 요구사항

---

#### **UC-01: 회원가입**

**목적:** 신규 사용자가 계정을 생성하여 서비스에 등록

**입력값**
| 필드 | 타입 | 필수 | 길이/형식 | 설명 |
|---|---|---|---|---|
| email | String | Y | 이메일 형식 | 로그인 아이디로 사용 |
| password | String | Y | 8~20자, 영문 대소문자+숫자+특수문자 각 1자 이상 필수 | 로그인 비밀번호 |
| name | String | Y | 1~100자 | 사용자 표시 이름 |

**출력값**
| 필드 | 타입 | 설명 |
|---|---|---|
| id | UUID | 사용자 고유 식별자 |
| email | String | 등록된 이메일 |
| name | String | 사용자 이름 |
| createdAt | DateTime | 가입일시 |
| message | String | "회원가입 성공" |

**유효성 검사**
- email: 이메일 형식 검증 (RFC 5322)
- email: 중복 여부 확인 → 중복 시 409 Conflict (BR-10)
- password: 아래 복잡도 규칙 모두 충족 필수 (BR-11)
  - 최소 8자, 최대 20자
  - 영문 대문자(A-Z) 1자 이상 포함
  - 영문 소문자(a-z) 1자 이상 포함
  - 숫자(0-9) 1자 이상 포함
  - 특수문자(`!@#$%^&*`) 1자 이상 포함
  - 위 조건 미충족 시 400 Bad Request 반환
- name: 1자 이상 100자 이하, 빈 문자열 불가

**비즈니스 로직**
- BR-01: 비인증 사용자만 가능
- BR-10: 중복 이메일 가입 시 409 반환
- BR-11: 비밀번호 복잡도 규칙 미충족 시 400 반환
- 비밀번호는 bcrypt(cost factor 12 이상)로 암호화 저장 후 DB 기록

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 201 | 회원가입 성공 |
| 400 | 필수값 누락 또는 형식 오류 |
| 409 | 이미 존재하는 이메일 |
| 500 | 서버 오류 |

---

#### **UC-02: 로그인**

**목적:** 사용자가 이메일과 비밀번호로 인증받아 서비스 접근

**입력값**
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| email | String | Y | 가입 시 등록한 이메일 |
| password | String | Y | 가입 시 등록한 비밀번호 |

**출력값**
| 필드 | 타입 | 설명 |
|---|---|---|
| accessToken | String | JWT Bearer Token |
| expiresIn | Number | 토큰 유효시간 (초) |
| user | Object | { id, email, name, createdAt } |

**유효성 검사**
- email: 이메일 형식 검증
- password: 빈 값 불가
- email 존재 여부 확인
- 비밀번호 일치 여부 확인

**비즈니스 로직**
- BR-09: JWT Access Token 유효기간 1시간 (3600초)
- 로그인 성공 시 Bearer Token 발급
- 비밀번호 불일치 시 명확한 오류 메시지 (보안상 이메일 존재 여부 노출 금지)

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 200 | 로그인 성공 |
| 400 | 필수값 누락 |
| 401 | 이메일 미존재 또는 비밀번호 불일치 |
| 500 | 서버 오류 |

---

#### **UC-03: 로그아웃**

**목적:** 인증된 사용자가 세션을 종료

**입력값**
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| Authorization | Header | Y | Bearer [accessToken] |

**출력값**
| 필드 | 타입 | 설명 |
|---|---|---|
| message | String | "로그아웃 성공" |

**유효성 검사**
- Authorization 헤더 필수
- 유효한 JWT 토큰 확인

**비즈니스 로직**
- BR-09: JWT 토큰 검증
- 클라이언트에서 로컬 스토리지/세션 스토리지의 토큰 삭제 권장
- 서버는 토큰 블랙리스트 관리 (선택사항)

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 200 | 로그아웃 성공 |
| 401 | 유효하지 않은 토큰 |
| 500 | 서버 오류 |

---

#### **UC-04: 할일 생성**

**목적:** 인증된 사용자가 새로운 할일을 생성

**입력값**
| 필드 | 타입 | 필수 | 길이/형식 | 설명 |
|---|---|---|---|---|
| title | String | Y | 1~200자 | 할일 제목 |
| description | String | N | 0~2000자 | 할일 상세 내용 |
| startDate | Date | Y | YYYY-MM-DD | 할일 시작일 |
| dueDate | Date | Y | YYYY-MM-DD | 할일 종료일 |

**출력값**
| 필드 | 타입 | 설명 |
|---|---|---|
| id | UUID | 생성된 할일 ID |
| userId | UUID | 소유 사용자 ID |
| title | String | 할일 제목 |
| description | String | 할일 설명 (nullable) |
| startDate | Date | 시작일 |
| dueDate | Date | 종료일 |
| isCompleted | Boolean | 완료 여부 (기본값: false) |
| completedAt | DateTime | 완료일시 (기본값: null) |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |
| status | String | 할일 상태 (파생값) |

**유효성 검사**
- title: 1자 이상 200자 이하, 필수
- description: 2000자 이하, 선택사항
- startDate: 필수, 유효한 날짜 형식
- dueDate: 필수, 유효한 날짜 형식
- dueDate >= startDate (BR-04)
- 모든 필수값 누락 시 400 반환

**비즈니스 로직**
- BR-01: 미인증 요청 시 401 반환
- BR-03: startDate, dueDate 필수. 누락 시 400 반환
- BR-04: dueDate >= startDate. 위반 시 400 반환
- isCompleted는 항상 false로 초기화
- completedAt은 null로 초기화
- createdAt은 서버 현재 시각 자동 기록
- updatedAt은 서버 현재 시각 자동 기록
- status는 우선순위 기반으로 자동 계산 (UPCOMING)

**할일 상태 계산 규칙**
| 우선순위 | 조건 | 상태 |
|---|---|---|
| 1 | isCompleted = true AND completedAt <= dueDate | COMPLETED |
| 2 | isCompleted = true AND completedAt > dueDate | LATE_COMPLETED |
| 3 | 현재 날짜 < startDate | UPCOMING |
| 4 | startDate <= 현재 날짜 <= dueDate AND isCompleted = false | IN_PROGRESS |
| 5 | 현재 날짜 > dueDate AND isCompleted = false | FAILED |

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 201 | 할일 생성 성공 |
| 400 | 필수값 누락 또는 형식 오류 |
| 401 | 미인증 요청 |
| 500 | 서버 오류 |

---

#### **UC-05: 할일 목록 조회**

**목적:** 인증된 사용자가 자신의 할일 목록을 조회 (페이지네이션, 상태 필터링, 정렬 지원)

**입력값 (Query Parameters)**
| 파라미터 | 타입 | 필수 | 기본값 | 허용 범위 |
|---|---|---|---|---|
| page | Integer | N | 1 | 1 이상 정수. 0 이하 → 400 |
| limit | Integer | N | 20 | 1~100 정수. 101 이상 → 400 |
| status | String | N | 없음 (전체) | UPCOMING, IN_PROGRESS, COMPLETED, LATE_COMPLETED, FAILED, CLOSED |
| sortBy | String | N | createdAt | startDate, dueDate, createdAt |
| sortOrder | String | N | desc | asc, desc |

**출력값 (Response Body)**
```json
{
  "data": [
    {
      "id": "UUID",
      "userId": "UUID",
      "title": "String",
      "description": "String | null",
      "startDate": "YYYY-MM-DD",
      "dueDate": "YYYY-MM-DD",
      "isCompleted": false,
      "completedAt": "ISO8601 | null",
      "status": "UPCOMING | IN_PROGRESS | COMPLETED | LATE_COMPLETED | FAILED",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**페이지네이션 규칙 (BR-08)**
| 항목 | 규칙 |
|---|---|
| 기본 페이지 | 1 |
| 기본 limit | 20 |
| 최대 limit | 100 |
| page < 1 | 400 Bad Request |
| limit < 1 또는 limit > 100 | 400 Bad Request |
| page > totalPages | 빈 data 배열 반환 (200 OK) |
| total 계산 | 현재 필터 조건에 맞는 전체 레코드 수 |

**status 필터 동작**
| 필터값 | DB 처리 방식 |
|---|---|
| UPCOMING | 현재 날짜 < startDate AND isCompleted = false |
| IN_PROGRESS | startDate <= 현재 날짜 <= dueDate AND isCompleted = false |
| COMPLETED | isCompleted = true AND completedAt <= dueDate |
| LATE_COMPLETED | isCompleted = true AND completedAt > dueDate |
| FAILED | 현재 날짜 > dueDate AND isCompleted = false |
| CLOSED | 현재 날짜 > dueDate (FAILED + LATE_COMPLETED + 기한 초과 COMPLETED 통합 필터) |
| 미지정 | 필터 없이 전체 반환 |

**유효성 검사**
- page: 1 이상 정수, 미충족 시 400
- limit: 1~100 정수, 미충족 시 400
- status: 정의된 값 외 입력 시 400
- sortBy: startDate, dueDate, createdAt 외 입력 시 400
- sortOrder: asc, desc 외 입력 시 400

**비즈니스 로직**
- BR-01: 미인증 요청 시 401 반환
- BR-02: WHERE userId = 인증된 사용자 ID 자동 적용 (타인 할일 원천 차단)
- BR-07: 기본 정렬 createdAt DESC
- BR-08: 페이지네이션 규칙 적용
- status 파생 계산은 DB에서 날짜 비교로 처리 (status 컬럼 없음)

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 200 | 조회 성공 (결과 없어도 200, data=[] 반환) |
| 400 | 잘못된 쿼리 파라미터 |
| 401 | 미인증 요청 |
| 500 | 서버 오류 |

---

#### **UC-06: 할일 상세 조회**

**목적:** 인증된 사용자가 특정 할일의 상세 정보를 조회

**입력값 (Path Parameter)**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| todoId | UUID | Y | 조회할 할일 ID |

**출력값**
| 필드 | 타입 | 설명 |
|---|---|---|
| id | UUID | 할일 ID |
| userId | UUID | 소유 사용자 ID |
| title | String | 할일 제목 |
| description | String | 할일 상세 내용 |
| startDate | Date | 시작일 |
| dueDate | Date | 종료일 |
| isCompleted | Boolean | 완료 여부 |
| completedAt | DateTime | 완료일시 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |
| status | String | 할일 상태 (파생값) |

**유효성 검사**
- todoId: 유효한 UUID 형식
- todoId 존재 여부 확인

**비즈니스 로직**
- BR-01: 미인증 요청 시 401 반환
- BR-02: 타인 할일 접근 시 403 반환

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 200 | 조회 성공 |
| 401 | 미인증 요청 |
| 403 | 접근 권한 없음 |
| 404 | 할일 미존재 |
| 500 | 서버 오류 |

---

#### **UC-07: 할일 수정**

**목적:** 인증된 사용자가 자신의 할일 정보를 수정

**입력값 (Path Parameter + Request Body)**

Path:
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| todoId | UUID | Y | 수정할 할일 ID |

Body:
| 필드 | 타입 | 필수 | 길이/형식 | 설명 |
|---|---|---|---|---|
| title | String | N | 1~200자 | 할일 제목 |
| description | String | N | 0~2000자 | 할일 상세 내용 |
| startDate | Date | N | YYYY-MM-DD | 할일 시작일 |
| dueDate | Date | N | YYYY-MM-DD | 할일 종료일 |

**출력값** (수정된 할일 객체 반환)
| 필드 | 타입 | 설명 |
|---|---|---|
| id | UUID | 할일 ID |
| userId | UUID | 소유 사용자 ID |
| title | String | 수정된 할일 제목 |
| description | String | 수정된 할일 설명 |
| startDate | Date | 수정된 시작일 |
| dueDate | Date | 수정된 종료일 |
| isCompleted | Boolean | 완료 여부 |
| completedAt | DateTime | 완료일시 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 (최신값) |
| status | String | 할일 상태 (재계산) |

**유효성 검사**
- todoId: 유효한 UUID 형식
- title: 1자 이상 200자 이하 (제공 시)
- description: 2000자 이하 (제공 시)
- startDate: 유효한 날짜 형식 (제공 시)
- dueDate: 유효한 날짜 형식 (제공 시)
- dueDate >= startDate (둘 다 제공 시, 또는 하나만 수정 시 기존값과 비교) (BR-04)
- 최소 하나 이상의 필드 필수 (그렇지 않으면 400)

**비즈니스 로직**
- BR-01: 미인증 요청 시 401 반환
- BR-02: 타인 할일 접근 시 403 반환
- BR-04: dueDate >= startDate. 위반 시 400 반환
- updatedAt은 서버 현재 시각으로 자동 갱신
- isCompleted와 completedAt은 수정 불가 (UC-08에서만 변경 가능)
- status는 수정된 데이터 기반으로 재계산

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 200 | 수정 성공 |
| 400 | 필수값 누락 또는 형식 오류 |
| 401 | 미인증 요청 |
| 403 | 접근 권한 없음 |
| 404 | 할일 미존재 |
| 500 | 서버 오류 |

---

#### **UC-08: 할일 완료 처리**

**목적:** 인증된 사용자가 할일의 완료 상태를 토글 (완료/미완료)

**입력값 (Path Parameter)**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| todoId | UUID | Y | 완료 처리할 할일 ID |

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| isCompleted | Boolean | Y | true: 완료, false: 완료 취소 |

**출력값** (수정된 할일 객체 반환)
| 필드 | 타입 | 설명 |
|---|---|---|
| id | UUID | 할일 ID |
| userId | UUID | 소유 사용자 ID |
| title | String | 할일 제목 |
| description | String | 할일 설명 |
| startDate | Date | 시작일 |
| dueDate | Date | 종료일 |
| isCompleted | Boolean | 완료 여부 (업데이트됨) |
| completedAt | DateTime | 완료일시 (업데이트됨) |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |
| status | String | 할일 상태 (재계산) |

**유효성 검사**
- todoId: 유효한 UUID 형식
- isCompleted: 부울린 값
- todoId 존재 여부 확인

**비즈니스 로직**
- BR-01: 미인증 요청 시 401 반환
- BR-02: 타인 할일 접근 시 403 반환
- BR-05: isCompleted=true 시 completedAt은 서버 현재 시각 자동 기록
- BR-06: 완료 취소(isCompleted=false) 시 completedAt은 null 초기화
- status는 isCompleted 변경 후 우선순위에 따라 재계산
  - isCompleted=true, completedAt <= dueDate → COMPLETED
  - isCompleted=true, completedAt > dueDate → LATE_COMPLETED
  - isCompleted=false → 다른 규칙 적용 (startDate, dueDate 비교)
- updatedAt은 서버 현재 시각으로 자동 갱신

**상태 전이 예시**
```
IN_PROGRESS + isCompleted=true → COMPLETED (또는 LATE_COMPLETED)
FAILED + isCompleted=true → LATE_COMPLETED (종료일이 지났으므로)
COMPLETED + isCompleted=false → IN_PROGRESS (또는 UPCOMING, FAILED 상황에 따라)
```

**응답 코드**
| 상태코드 | 조건 |
|---|---|
| 200 | 완료 처리 성공 |
| 400 | 필수값 누락 또는 형식 오류 |
| 401 | 미인증 요청 |
| 403 | 접근 권한 없음 |
| 404 | 할일 미존재 |
| 500 | 서버 오류 |

---

### 3.3 Non-Goals (제외 기능)

1차 출시에서 다음 기능은 **제외**됩니다:

| 기능 | 설명 | 향후 버전 |
|---|---|---|
| **할일 삭제 (UC-09)** | 할일 완전 삭제 | v0.3 이상 |
| **할일 태그/카테고리** | 할일 분류 기능 | v0.3 이상 |
| **공유/협업** | 할일 공유, 팀 협업 | v0.4 이상 |
| **알림/리마인더** | 푸시 알림, 이메일 알림 | v0.4 이상 |
| **반복 할일** | 매일, 매주, 매월 반복 | v0.5 이상 |
| **첨부파일** | 할일에 파일 첨부 | v0.5 이상 |
| **모바일 앱** | iOS/Android 네이티브 앱 | v1.0 이상 |

---

## 4. 기술 요구사항

### 4.1 시스템 아키텍처

**3-Tier Architecture**

```
┌─────────────────────────────────────┐
│   Frontend (웹 브라우저)             │
│   React 19 + TypeScript             │
│   Zustand + TanStack Query          │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────┐
│   Backend (API Server)               │
│   Node.js + Express                 │
│   pg 라이브러리 (Connection Pool)    │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│   Database                           │
│   PostgreSQL                        │
└─────────────────────────────────────┘
```

### 4.2 기술 스택

| 계층 | 기술 | 버전 | 용도 |
|---|---|---|---|
| **Frontend** | React | 19 | UI 프레임워크 |
| | TypeScript | 5.x | 타입 안전성 |
| | Zustand | 4.x | 상태 관리 |
| | TanStack Query | 5.x | 서버 상태 관리 |
| **Backend** | Node.js | 18+ | 런타임 |
| | Express | 5.x | 웹 프레임워크 |
| | pg | 8.x | PostgreSQL 클라이언트 (Connection Pool 포함) |
| | bcrypt | 6.x | 비밀번호 암호화 |
| | jsonwebtoken | 9.x | JWT 토큰 발급/검증 |
| | swagger-ui-express | 5.x | Swagger UI 서빙 (`/docs`) |
| | axios | 1.x | HTTP 클라이언트 (프론트엔드) |
| **Database** | PostgreSQL | 14+ | 관계형 DB |
| **DevOps** | TBD | - | 배포환경 (추후 결정) |

### 4.3 데이터 모델 요약

**User Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (bcrypt encrypted),
  name VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Todo Table**
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  startDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  isCompleted BOOLEAN DEFAULT false,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_date_order CHECK (dueDate >= startDate)
);

CREATE INDEX idx_todos_userId ON todos(userId);
CREATE INDEX idx_todos_createdAt ON todos(createdAt DESC);
CREATE INDEX idx_todos_dueDate ON todos(dueDate);
```

---

## 5. 비기능 요구사항

### 5.1 성능 (Performance)

| 요구사항 | 목표값 | 측정 방법 |
|---|---|---|
| API 응답시간 (95th percentile) | ≤ 300ms | New Relic, DataDog |
| 페이지 로드시간 | ≤ 2초 | Lighthouse, WebPageTest |
| 데이터베이스 쿼리 응답시간 | ≤ 50ms | PostgreSQL 로그 분석 |
| 동시 요청 처리 (500명) | 안정적 성공 | Load Testing (JMeter, k6) |

### 5.2 보안 (Security)

#### 비밀번호 정책 (BR-11)

| 규칙 | 기준 |
|---|---|
| 최소 길이 | 8자 이상 |
| 최대 길이 | 20자 이하 |
| 영문 대문자 | 1자 이상 필수 (A-Z) |
| 영문 소문자 | 1자 이상 필수 (a-z) |
| 숫자 | 1자 이상 필수 (0-9) |
| 특수문자 | 1자 이상 필수 (`!@#$%^&*`) |
| 위반 시 응답 | 400 Bad Request |

#### JWT 인증 방식 (BR-09)

백엔드는 **JWT(JSON Web Token) Stateless 인증 방식**을 사용한다.

| 항목 | 설명 |
|---|---|
| 토큰 종류 | Access Token (단일 토큰 방식) |
| 발급 시점 | 로그인 성공 시 서버에서 발급 |
| 전달 방식 | HTTP 요청 헤더: `Authorization: Bearer <accessToken>` |
| 유효기간 | 1시간 (3600초) |
| 만료 시 응답 | 401 Unauthorized |
| 서버 상태 | 서버는 토큰을 저장하지 않음 (Stateless) |
| 서명 알고리즘 | HS256 |
| Payload 포함 정보 | `userId`, `email`, `iat`, `exp` |
| 로그아웃 처리 | 클라이언트에서 토큰 삭제 (서버 블랙리스트 미운용) |

#### 기타 보안 요구사항

| 요구사항 | 구현 사항 |
|---|---|
| 비밀번호 암호화 | bcrypt cost factor 12 이상 저장 (NFR-02) |
| API 인증 | UC-03~08 모든 엔드포인트 JWT 미들웨어 필수 적용 |
| HTTPS | 모든 통신 HTTPS 필수 |
| CORS | 프론트엔드 도메인만 허용 |
| SQL Injection | Parameterized Query 사용 (pg 라이브러리) |
| XSS 보호 | 입력값 검증 및 출력 인코딩 |

### 5.3 가용성 (Availability)

| 요구사항 | 목표값 |
|---|---|
| 월간 가동률 | 99% 이상 (NFR-04) |
| 최대 다운타임 (월) | 약 7시간 |
| 오류율 | 0.5% 이하 |

### 5.4 확장성 (Scalability)

| 고려사항 | 전략 |
|---|---|
| 데이터베이스 확장 | Connection Pooling, Read Replicas |
| 애플리케이션 확장 | Load Balancer, 수평 확장 |
| 캐싱 | Redis (향후 도입) |
| CDN | 정적 자산 배포 |

### 5.5 데이터 검증

| 항목 | 제약 조건 |
|---|---|
| title | 1~200자 (NFR-05) |
| description | 0~2000자 (NFR-05) |
| email | RFC 5322 형식 |
| password | 최소 8자 |
| 페이지네이션 | 기본 20, 최대 100 (NFR-06, BR-08) |

---

## 6. UI/UX 요구사항

### 6.1 플랫폼 지원

- **모바일 웹:** iPhone, Android 스마트폰 (브라우저)
- **데스크탑 웹:** Windows, macOS, Linux (Chrome, Safari, Firefox)
- **반응형 UI:** 모든 화면 크기에 최적화
- **다크모드 지원:** 사용자 선호도 기반 라이트/다크 테마 자동 전환 및 수동 토글

### 6.2 반응형 브레이크포인트

| 기기 | 최소 너비 | 최대 너비 | 레이아웃 |
|---|---|---|---|
| 모바일 | 320px | 767px | Single Column |
| 태블릿 | 768px | 1023px | 2-Column |
| 데스크탑 | 1024px | - | 3-Column (선택사항) |

### 6.3 다크모드 요구사항

#### 기능 요구사항

| 요구사항 | 설명 | 우선순위 |
|---|---|---|
| **테마 토글** | 헤더에서 라이트/다크모드 수동 전환 가능 | Must-have |
| **시스템 연동** | OS 다크모드 설정 감지하여 자동 적용 (기본값) | Must-have |
| **선호도 저장** | 사용자 테마 선호도 localStorage 에 저장 | Must-have |
| **전체 화면 적용** | 모든 UI 컴포넌트에 일관된 테마 적용 | Must-have |
| **접근성** | 다크모드에서도 WCAG AA 색상 대비 기준 충족 | Must-have |

#### 테마 동작 규칙

| 항목 | 동작 |
|---|---|
| **초기 로드** | localStorage 저장값 → 없으면 시스템 설정 → 없으면 라이트모드 |
| **토글 시** | 즉시 테마 변경 + localStorage 저장 |
| **시스템 연동** | 수동 토글 시 시스템 연동 해제 (명시적 사용자 선택) |

### 6.4 핵심 화면 목록

| 화면 | 설명 | 접근성 |
|---|---|---|
| **01. 회원가입 페이지** | 신규 사용자 등록 | 비인증 |
| **02. 로그인 페이지** | 기존 사용자 로그인 | 비인증 |
| **03. 할일 목록 페이지** | 사용자의 모든 할일 조회, 필터링, 정렬 | 인증 필수 |
| **04. 할일 생성 폼** | 새 할일 생성 (모달 또는 페이지) | 인증 필수 |
| **05. 할일 상세 페이지** | 특정 할일의 상세 정보 및 수정 | 인증 필수 |
| **06. 할일 수정 폼** | 할일 정보 수정 | 인증 필수 |
| **07. 사용자 프로필** | 로그아웃, 기본 정보 (선택) | 인증 필수 |

### 6.5 주요 UI 컴포넌트

- 헤더: 로고, 네비게이션, 사용자 메뉴, **다크모드 토글 버튼**
- 할일 카드: 제목, 날짜, 상태, 완료 토글 버튼
- 필터/정렬 섹션: 상태 필터, 정렬 기준 선택
- 페이지네이션: 이전/다음, 페이지 번호
- 폼 입력: 텍스트 필드, 날짜 피커, 텍스트 에어리어
- 버튼: CTA 버튼, 취소 버튼, 삭제 버튼 (v0.3)
- 토스트: 성공/오류 메시지 알림

---

## 7. 출시 계획

### 7.1 일정

| 단계 | 기간 | 담당 | 산출물 |
|---|---|---|---|
| **설계** | 2026-04-01 | 개발팀 | ERD, API Spec, UI Mockup |
| **개발** | 2026-04-01 ~ 2026-04-02 | 개발팀 | 소스코드, 테스트 코드 |
| **QA** | 2026-04-02 ~ 2026-04-03 (부분) | QA팀 | 테스트 결과, 버그 리포트 |
| **배포 준비** | 2026-04-03 (오전) | DevOps | 배포 스크립트, 환경 설정 |
| **1차 출시** | 2026-04-03 | 전체 | 서비스 운영 개시 |

### 7.2 마일스톤

**Milestone 1: 백엔드 완성 (2026-04-02 정오)**
- 모든 API 엔드포인트 구현 (UC-01~08)
- 유닛 테스트 80% 이상
- API 문서 완성

**Milestone 2: 프론트엔드 완성 (2026-04-02 18:00)**
- 모든 화면 UI 구현
- 통합 테스트 진행
- 반응형 디자인 검증

**Milestone 3: E2E 테스트 & 버그 픽스 (2026-04-03 10:00)**
- 전체 사용자 흐름 테스트
- 발견된 버그 수정
- 성능 최적화

**Milestone 4: 운영 준비 (2026-04-03 14:00)**
- 배포 환경 구성
- 모니터링 설정
- 로깅 설정
- 배포

---

## 8. 성공 지표 (KPI)

### 8.1 1차 출시 기준 지표

| KPI | 목표값 | 측정 방법 | 시간 |
|---|---|---|---|
| **기능 완성도** | 100% (UC-01~08) | 체크리스트 | 2026-04-03 |
| **API 응답 시간** | ≤ 300ms (95th) | APM 도구 | 운영 중 |
| **페이지 로드 시간** | ≤ 2초 | Lighthouse | 운영 중 |
| **가동률** | ≥ 99% | 모니터링 | 월간 |
| **테스트 커버리지** | ≥ 80% | Jest, Cypress | 2026-04-03 |
| **API 성공률** | ≥ 99.5% | 로그 분석 | 운영 중 |
| **UI 반응형 테스트** | 100% 통과 | 수동 테스트 | 2026-04-03 |
| **보안 검사** | OWASP Top 10 회피 | 보안 감사 | 2026-04-03 |

### 8.2 사용자 만족도 지표 (향후)

- 가입 후 할일 생성까지 평균 소요 시간: ≤ 3분
- 사용자 이탈율: ≤ 5% (1주일 내)
- Net Promoter Score (NPS): ≥ 50점
- 오류 시 사용자 신고율: ≤ 1%

---

## 9. 부록

### 9.1 API 엔드포인트 요약

| Method | Endpoint | UC | 설명 |
|---|---|---|---|
| POST | `/api/auth/signup` | UC-01 | 회원가입 |
| POST | `/api/auth/login` | UC-02 | 로그인 |
| POST | `/api/auth/logout` | UC-03 | 로그아웃 |
| POST | `/api/todos` | UC-04 | 할일 생성 |
| GET | `/api/todos` | UC-05 | 할일 목록 조회 |
| GET | `/api/todos/:todoId` | UC-06 | 할일 상세 조회 |
| PATCH | `/api/todos/:todoId` | UC-07 | 할일 수정 |
| PATCH | `/api/todos/:todoId/complete` | UC-08 | 할일 완료 처리 |

### 9.2 오류 코드 요약

| HTTP 상태 | 상황 | 예시 메시지 |
|---|---|---|
| 400 | 잘못된 요청 | "필수 필드가 누락되었습니다: title" |
| 401 | 미인증 | "유효하지 않은 토큰입니다" |
| 403 | 권한 부족 | "다른 사용자의 할일에는 접근할 수 없습니다" |
| 404 | 리소스 미존재 | "요청한 할일을 찾을 수 없습니다" |
| 409 | 충돌 | "이미 가입된 이메일입니다" |
| 500 | 서버 오류 | "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요" |

### 9.3 참고 문서

- [도메인 정의서](./1-domain-definition.md) - 상세 도메인 모델 및 비즈니스 규칙
- 추후 추가 문서:
  - API 상세 명세서 (OpenAPI 3.0)
  - 데이터베이스 스키마 (DDL)
  - UI/UX 목업 및 프로토타입
  - 테스트 계획서
  - 배포 가이드

---

**문서 상태:** 최종 승인 대기  
**최종 검토:** 2026-04-01  
**다음 단계:** 설계 단계 진입, 기술 스펙 상세화
