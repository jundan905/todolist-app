# 기술 아키텍처 다이어그램

**프로젝트명:** todolist-app
**작성일:** 2026-04-01
**버전:** 1.0.0
**작성자:** Dan Jung

---

## 1. 시스템 아키텍처 (3-Tier)

```mermaid
graph TD
    Client["브라우저\nReact 19 + TypeScript\nZustand · TanStack Query"]
    Server["API 서버\nNode.js + Express"]
    DB[("PostgreSQL\nusers · todos")]

    Client -- "HTTP/HTTPS\nJWT Bearer Token" --> Server
    Server -- "SQL (pg)" --> DB
```

---

## 2. 백엔드 레이어 구조

```mermaid
graph LR
    Route --> Middleware
    Middleware --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB[("PostgreSQL")]

    Middleware:::note
    classDef note fill:#fff9c4
```

> 의존 방향은 왼쪽 → 오른쪽 단방향. Repository는 Service를 모르고, Service는 Controller를 모른다.

---

## 3. 프론트엔드 레이어 구조

```mermaid
graph LR
    Pages --> FeatureComponents["Feature\nComponents"]
    FeatureComponents --> UIComponents["UI\nComponents"]
    FeatureComponents --> QueryHooks["Query Hooks\n(TanStack Query)"]
    FeatureComponents --> Store["Store\n(Zustand)"]
    QueryHooks --> APIClient["API Client\n(axios)"]
```

> - **Pages**: 라우트 단위 최상위 컴포넌트
> - **Feature Components**: Todo 도메인 기능 단위 컴포넌트
> - **UI Components**: props만으로 동작하는 순수 표현 컴포넌트
> - **Query Hooks**: 서버 상태 관리 (할일 목록, 상세 등)
> - **Store**: 클라이언트 상태만 관리 (인증 토큰, UI 상태)
> - **API Client**: axios 인스턴스, JWT 자동 첨부

---

## 4. 인증 흐름 (JWT)

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant BE as Backend

    User->>FE: 로그인 요청 (email, password)
    FE->>BE: POST /api/auth/login
    BE-->>FE: 200 OK { accessToken }
    FE->>FE: Zustand에 토큰 저장

    User->>FE: 할일 목록 요청
    FE->>BE: GET /api/todos\n(Authorization: Bearer <token>)
    BE->>BE: JWT 검증 (authMiddleware)
    BE-->>FE: 200 OK { data, pagination }
    FE-->>User: 화면 렌더링
```

---

## 5. 할일 상태 전이

```mermaid
stateDiagram-v2
    [*] --> UPCOMING : 생성 (현재 < startDate)
    [*] --> IN_PROGRESS : 생성 (startDate ≤ 현재 ≤ dueDate)

    UPCOMING --> IN_PROGRESS : startDate 도달
    IN_PROGRESS --> COMPLETED : 완료 처리 (기한 내)
    IN_PROGRESS --> FAILED : dueDate 초과
    FAILED --> LATE_COMPLETED : 완료 처리 (기한 후)

    COMPLETED --> IN_PROGRESS : 완료 취소
    LATE_COMPLETED --> FAILED : 완료 취소
```

---

## 6. 데이터 모델 (ERD)

> ERD 상세 내용은 [docs/6-erd.md](./6-erd.md) 참조

---

## 7. API 엔드포인트 구조

```mermaid
graph LR
    subgraph Auth ["🔓 인증 불필요"]
        A1["POST /api/auth/signup\nUC-01 회원가입"]
        A2["POST /api/auth/login\nUC-02 로그인"]
    end

    subgraph Protected ["🔒 JWT 필요"]
        B1["POST /api/auth/logout\nUC-03 로그아웃"]
        B2["POST /api/todos\nUC-04 할일 생성"]
        B3["GET /api/todos\nUC-05 목록 조회"]
        B4["GET /api/todos/:id\nUC-06 상세 조회"]
        B5["PATCH /api/todos/:id\nUC-07 수정"]
        B6["PATCH /api/todos/:id/complete\nUC-08 완료 처리"]
    end
```
