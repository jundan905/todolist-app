# 프로젝트 구조 설계 원칙

**프로젝트명:** todolist-app
**작성일:** 2026-04-01
**버전:** 1.0.0
**작성자:** Dan Jung

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|---|---|---|---|
| 1.0.0 | 2026-04-01 | 초안 작성 | Dan Jung |
| 1.0.1 | 2026-04-01 | 환경변수 관리 항목 상세화 (백엔드/프론트엔드 환경변수 목록, 환경별 설정값 가이드, 중앙 관리 코드 추가) | Dan Jung |
| 1.0.2 | 2026-04-01 | 기술 스택 일관성 검토 반영: Connection Pool 설정값 추가 (max 20, idleTimeout 30s, connectionTimeout 2s) | Dan Jung |

---

## 1. 최상위 원칙 (전 스택 공통)

이 절의 원칙들은 프론트엔드·백엔드 어느 레이어에서도 동일하게 적용된다. 코드 리뷰 시 이 원칙의 위반 여부를 1순위로 확인한다.

---

### 원칙 1: 단일 책임 (Single Responsibility)

**왜 필요한가:** 하나의 모듈이 여러 책임을 가지면 변경 이유가 복수가 되어 무관한 기능이 의도치 않게 함께 수정된다. 이는 버그의 가장 흔한 원인이다.

**어떻게 적용하는가:**
- 함수/클래스/모듈은 오직 하나의 변경 이유만 가진다.
- 백엔드: `todoController`는 HTTP 요청/응답 처리만 담당하고, 비밀번호 해싱은 `authService`가 담당한다.
- 프론트엔드: `useTodos` 훅은 서버 상태 관리만 담당하고, UI 렌더링 로직은 컴포넌트가 담당한다.

---

### 원칙 2: 관심사 분리 (Separation of Concerns)

**왜 필요한가:** 비즈니스 로직, 데이터 접근, 표현 계층이 뒤섞이면 테스트가 불가능하고 로직 재사용도 어렵다. Todo 상태 계산처럼 복잡한 파생 로직은 반드시 격리해야 한다.

**어떻게 적용하는가:**
- 백엔드: Controller → Service → Repository 계층을 반드시 분리한다. SQL은 Repository 계층 밖으로 나가지 않는다.
- 프론트엔드: API 통신(`api/`), 서버 상태(TanStack Query), 클라이언트 상태(Zustand), UI(`components/`)를 각자의 영역에 가둔다.
- Todo 상태 계산 로직(`computeTodoStatus`)은 프론트엔드와 백엔드 각각 별도 유틸 함수로 관리한다.

---

### 원칙 3: 명시적 의존성 (Explicit Dependencies)

**왜 필요한가:** 전역 상태나 암묵적 임포트에 의존하면 모듈 간 결합도가 높아져 테스트와 리팩토링이 어렵다.

**어떻게 적용하는가:**
- 함수가 필요한 모든 의존성은 인자(파라미터) 또는 생성자로 명시적으로 주입한다.
- 환경변수는 `config/` 모듈에서 한 번만 읽고 나머지 모듈은 `config` 객체를 임포트한다.
- DB 연결 풀(`pool`)은 모듈 최상단 단일 임포트 지점에서만 참조한다.

---

### 원칙 4: 불변 우선 (Immutability First)

**왜 필요한가:** 가변 데이터는 예측하기 어려운 사이드 이펙트를 만든다. Todo 상태 파생 계산, React 상태 업데이트에서 불변성 위반은 렌더링 버그로 직결된다.

**어떻게 적용하는가:**
- TypeScript에서 `const`를 기본으로 사용하고, `let`은 불가피한 경우에만 허용한다.
- 배열/객체 조작 시 원본을 변경하지 않고 새 객체를 반환한다 (`map`, `filter`, `spread` 활용).
- Zustand store 업데이트 시 항상 새 객체를 반환하는 패턴을 사용한다.

---

### 원칙 5: 방어적 입력 검증 (Defensive Input Validation)

**왜 필요한가:** 신뢰 경계(클라이언트 ↔ 서버)를 넘어오는 모든 입력은 악의적이거나 잘못된 것일 수 있다. `dueDate >= startDate` 같은 비즈니스 규칙은 서버에서 반드시 재검증해야 한다.

**어떻게 적용하는가:**
- 프론트엔드: 사용자 경험 개선을 위해 폼 레벨에서 1차 검증한다.
- 백엔드: 프론트엔드 검증과 무관하게 독립적으로 모든 입력을 검증한다 (BR-03, BR-04, BR-11 등).
- Parameterized Query를 항상 사용하여 SQL Injection을 원천 차단한다.
- 검증 로직은 middleware 또는 validator 레이어에서 처리하고, Controller는 검증된 데이터만 받는다.

---

### 원칙 6: 실패 명시화 (Fail Explicitly)

**왜 필요한가:** 조용히 실패하는(silently failing) 코드는 디버깅을 극도로 어렵게 만든다. 에러는 발생한 지점에서 명확하게 던져야 한다.

**어떻게 적용하는가:**
- 백엔드: 표준 `AppError` 클래스를 정의하고 HTTP 상태코드와 메시지를 항상 포함한다.
- 중앙 에러 핸들러(`errorMiddleware`)에서 모든 에러를 일관된 JSON 형식으로 응답한다.
- 프론트엔드: TanStack Query의 `onError` 콜백에서 사용자에게 에러 상태를 명확히 노출한다.
- `catch(e) {}` 빈 패턴은 금지한다.

---

### 원칙 7: 설정과 코드 분리 (Configuration vs Code)

**왜 필요한가:** JWT 시크릿, DB 접속 정보, bcrypt cost factor 같은 환경 의존 값이 코드에 하드코딩되면 보안 사고와 배포 실수로 직결된다.

**어떻게 적용하는가:**
- 모든 비밀값과 환경 의존 설정은 `.env` 파일에서 관리하고 코드에 하드코딩하지 않는다.
- `.env` 파일은 절대 Git에 커밋하지 않으며, `.env.example`만 버전 관리한다.
- 설정값은 `config/index.ts` (백엔드) 또는 `src/config/env.ts` (프론트엔드)에서 중앙 관리한다.

---

## 2. 의존성 / 레이어 원칙

### 2.1 전체 시스템 레이어 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                     │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────┐  │
│   │  UI Layer   │   │ State Layer  │   │ API Layer  │  │
│   │ (React      │──▶│ (Zustand +   │──▶│(TanStack   │  │
│   │ Components) │   │ TanStack Q.) │   │Query+axios)│  │
│   └─────────────┘   └──────────────┘   └────────────┘  │
└─────────────────────────────────────────┼───────────────┘
                          HTTP/HTTPS (JWT Bearer Token)
┌─────────────────────────────────────────▼───────────────┐
│                   Server (Node.js/Express)               │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │  Controller  │─▶│   Service    │─▶│ Repository  │  │
│   │  (Route +    │  │ (Business    │  │ (Raw SQL +  │  │
│   │  Validation) │  │   Logic)     │  │    pg)      │  │
│   └──────────────┘  └──────────────┘  └──────┬──────┘  │
└───────────────────────────────────────────────┼─────────┘
                                                │ SQL
┌───────────────────────────────────────────────▼─────────┐
│                  PostgreSQL Database                     │
│                (users, todos tables)                    │
└─────────────────────────────────────────────────────────┘
```

**의존 방향 규칙:** 의존성은 항상 위에서 아래(외부 → 내부)로만 흐른다. Repository는 Service를 모르고, Service는 Controller를 모른다.

---

### 2.2 백엔드 레이어 원칙

```
Route → Middleware → Controller → Service → Repository → DB
```

| 레이어 | 역할 | 허용된 의존 방향 |
|---|---|---|
| **Route** | URL 패턴과 HTTP 메서드를 Controller에 매핑 | Controller만 참조 |
| **Middleware** | 인증(JWT 검증), 요청 파싱, 에러 핸들링 | 독립적 또는 Service 참조 |
| **Controller** | 요청 수신, 입력 검증, 응답 반환 | Service만 참조 |
| **Service** | 비즈니스 로직 (BR-04, BR-05, Todo 상태 계산 등) | Repository만 참조 |
| **Repository** | SQL 실행, DB 결과 매핑 | DB(pg pool)만 참조 |

**규칙:**
- Controller에서 SQL을 직접 실행하지 않는다.
- Service에서 `req`, `res` 객체를 참조하지 않는다.
- Repository는 `Promise<T>` 형태의 순수 데이터만 반환하고 HTTP 상태코드를 알지 못한다.

---

### 2.3 프론트엔드 레이어 원칙

```
Page/View → Feature Component → UI Component
              ↓                    ↓
         TanStack Query         Zustand Store
              ↓
          API Client (axios)
```

| 레이어 | 역할 | 허용된 의존 방향 |
|---|---|---|
| **Pages** | 라우트 단위 최상위 컴포넌트, 데이터 조합 | Feature Component, Query Hook |
| **Feature Components** | 도메인 기능 단위 컴포넌트 (TodoList, TodoForm 등) | UI Component, Custom Hook |
| **UI Components** | 재사용 가능한 순수 표현 컴포넌트 | 없음 (props만 의존) |
| **Query Hooks** | TanStack Query 기반 서버 상태 관리 | API Client |
| **Store (Zustand)** | 클라이언트 전용 상태 (인증 토큰, UI 상태) | 없음 |
| **API Client** | axios 인스턴스, 엔드포인트별 함수 | config/env |

**규칙:**
- UI Component는 서버 데이터를 직접 페칭하지 않는다. 항상 props로 데이터를 받는다.
- 서버 상태(할일 목록, 사용자 정보)는 TanStack Query가 관리하고, Zustand에 복사하지 않는다.
- Zustand는 인증 토큰, UI 전용 상태(필터 선택값, 모달 열림 여부 등)만 관리한다.

---

## 3. 코드 / 네이밍 원칙

### 3.1 공통 규칙

| 대상 | 규칙 | 예시 |
|---|---|---|
| 파일명 (컴포넌트) | PascalCase | `TodoCard.tsx`, `AuthForm.tsx` |
| 파일명 (모듈/유틸) | camelCase | `todoService.ts`, `dateUtils.ts` |
| 인터페이스/타입 | PascalCase, `I` 접두사 없음 | `Todo`, `User`, `ApiResponse<T>` |
| Enum | PascalCase (값은 UPPER_SNAKE_CASE) | `TodoStatus.IN_PROGRESS` |
| 상수 | UPPER_SNAKE_CASE | `MAX_TODO_TITLE_LENGTH` |
| 환경변수 | UPPER_SNAKE_CASE | `JWT_SECRET`, `DATABASE_URL` |

---

### 3.2 백엔드 네이밍 원칙

**파일명 규칙:**

```
controllers/    → [domain]Controller.ts      예: authController.ts, todoController.ts
services/       → [domain]Service.ts         예: authService.ts, todoService.ts
repositories/   → [domain]Repository.ts      예: userRepository.ts, todoRepository.ts
middlewares/    → [name]Middleware.ts         예: authMiddleware.ts, errorMiddleware.ts
routes/         → [domain]Routes.ts          예: authRoutes.ts, todoRoutes.ts
utils/          → [purpose]Utils.ts          예: dateUtils.ts, hashUtils.ts
```

**함수명 규칙:**

| 레이어 | 동사 패턴 | 예시 |
|---|---|---|
| Controller | `handle[Action]` | `handleCreateTodo`, `handleLogin` |
| Service | 동사+명사 | `createTodo`, `validatePassword`, `computeTodoStatus` |
| Repository | `find[By...]`, `insert`, `update` | `findById`, `findByEmail`, `insertTodo`, `updateTodo` |

**Good / Bad 예시:**

```typescript
// Good - 레이어 책임이 명확
// todoController.ts
async function handleCreateTodo(req: Request, res: Response) {
  const validated = validateCreateTodoInput(req.body);
  const todo = await todoService.createTodo(req.user.id, validated);
  res.status(201).json(todo);
}

// todoService.ts
async function createTodo(userId: string, input: CreateTodoInput): Promise<Todo> {
  if (input.dueDate < input.startDate) {
    throw new AppError(400, 'dueDate must be >= startDate');
  }
  return todoRepository.insertTodo({ ...input, userId });
}

// Bad - Controller에서 SQL 직접 실행 (레이어 위반)
async function handleCreateTodo(req: Request, res: Response) {
  const result = await pool.query('INSERT INTO todos ...'); // 금지
  res.json(result.rows[0]);
}
```

---

### 3.3 프론트엔드 네이밍 원칙

**파일명 규칙:**

```
components/     → [Name].tsx 또는 [Name]/index.tsx     예: TodoCard.tsx
pages/          → [Name]Page.tsx                       예: LoginPage.tsx, TodoListPage.tsx
hooks/          → use[Name].ts                         예: useTodos.ts, useAuth.ts
stores/         → use[Name]Store.ts                    예: useAuthStore.ts
api/            → [domain]Api.ts                       예: todoApi.ts, authApi.ts
utils/          → [purpose]Utils.ts                    예: todoStatusUtils.ts
types/          → [domain].types.ts                    예: todo.types.ts
```

**컴포넌트 Props 타입명:** 컴포넌트명 + `Props`

```typescript
// Good
interface TodoCardProps {
  todo: Todo;
  onComplete: (id: string) => void;
}
function TodoCard({ todo, onComplete }: TodoCardProps) { ... }

// Bad - any 사용
function TodoCard({ todo, onComplete }: any) { ... }
```

**TanStack Query 키 규칙 (query key factory 패턴):**

```typescript
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
};
```

**커스텀 훅 규칙:**

```typescript
// Good - TanStack Query를 통한 서버 상태 관리
function useTodos(filters: TodoFilters) {
  const { data, isLoading, error } = useQuery({ queryKey: todoKeys.list(filters), ... });
  return { todos: data?.data, pagination: data?.pagination, isLoading, error };
}

// Bad - 훅 내부에서 직접 axios 호출 (Query 레이어 우회)
function useTodos() {
  const [todos, setTodos] = useState([]);
  useEffect(() => { axios.get('/todos').then(r => setTodos(r.data)); }, []); // 금지
}
```

---

## 4. 테스트 / 품질 원칙

### 4.1 테스트 전략

```
┌─────────────────────────────────────────┐
│           E2E Tests (소수)              │  ← Playwright (선택, 1차 출시 이후)
│     핵심 사용자 시나리오 (SCN-01~02)   │
├─────────────────────────────────────────┤
│        Integration Tests (중간)         │  ← Supertest (백엔드)
│  API 엔드포인트, DB 연동, 인증 흐름    │     React Testing Library (프론트)
├─────────────────────────────────────────┤
│         Unit Tests (다수)               │  ← Jest / Vitest
│  Service 로직, 유틸 함수, 컴포넌트     │
└─────────────────────────────────────────┘
```

### 4.2 테스트 범위 및 우선순위

**백엔드 필수 테스트 대상:**

| 우선순위 | 대상 | 이유 |
|---|---|---|
| P0 | `computeTodoStatus()` 유틸 함수 | 5가지 상태 로직, 경계값 다수 |
| P0 | Todo API 엔드포인트 (통합) | UC-04~08 수용 기준(AC) 직접 검증 |
| P1 | `todoService.createTodo()` | BR-03, BR-04 검증 |
| P1 | JWT 미들웨어 | 인증 실패 케이스 (401) |
| P1 | `authService.validatePassword()` | 보안 핵심 로직 |
| P2 | Repository 함수 | 단순 CRUD, DB 연동 확인 |

**프론트엔드 필수 테스트 대상:**

| 우선순위 | 대상 | 이유 |
|---|---|---|
| P0 | `computeTodoStatus()` 유틸 함수 | 백엔드와 동일 로직, 독립 검증 필요 |
| P0 | `TodoForm` 컴포넌트 | 입력 검증, dueDate >= startDate 규칙 |
| P1 | `useTodos` 훅 | 서버 상태 관리 흐름 |
| P1 | `LoginPage` / `SignupPage` | 인증 흐름, 에러 메시지 표시 |
| P2 | `TodoCard` 컴포넌트 | 상태별 렌더링 |

### 4.3 커버리지 목표

| 레이어 | 목표 |
|---|---|
| 백엔드 Service | 80% 이상 |
| 백엔드/프론트엔드 Utils | 90% 이상 (`computeTodoStatus` 경계값 테스트 필수) |
| 프론트엔드 Components | 70% 이상 |
| 전체 평균 | 75% 이상 |

### 4.4 코드 품질 도구

| 도구 | 적용 범위 | 설정 |
|---|---|---|
| TypeScript strict mode | 공통 | `"strict": true` 필수, `any` 타입 사용 금지 |
| ESLint | 공통 | `@typescript-eslint/recommended` 기반, CI 자동 검사 |
| Prettier | 공통 | 스페이스 2칸, 세미콜론 필수, 팀 공통 포맷 강제 |
| Husky + lint-staged | 공통 | 커밋 전 lint/format 자동 실행 |
| Jest | 백엔드 | 단위/통합 테스트 |
| Supertest | 백엔드 | HTTP 엔드포인트 통합 테스트 |
| Vitest | 프론트엔드 | 단위 테스트 |
| React Testing Library | 프론트엔드 | 컴포넌트 통합 테스트 |
| MSW (Mock Service Worker) | 프론트엔드 | API 모킹 |

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경변수 관리 원칙

**핵심 규칙:**
- 모든 환경별 설정값은 `.env` 파일로 관리하고, 소스코드에 하드코딩하지 않는다.
- `.env`는 `.gitignore`에 반드시 포함한다. Git에 커밋되면 시크릿이 영구 노출된다.
- `.env.example`에 키 이름과 설명(값 제외)만 기록하여 버전 관리한다.
- 백엔드 시작 시 필수 환경변수 누락을 검증하고, 누락 시 프로세스를 즉시 종료한다.
- 프론트엔드 환경변수는 `VITE_` 접두사만 사용하며, 시크릿(JWT_SECRET 등)을 절대 포함하지 않는다 (브라우저에 그대로 노출됨).

---

#### 백엔드 환경변수 목록

| 변수명 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `NODE_ENV` | Y | `development` | 실행 환경 (`development` \| `production` \| `test`) |
| `PORT` | N | `3000` | Express 서버 포트 |
| `DATABASE_URL` | Y | - | PostgreSQL 연결 문자열 (`postgresql://user:pass@host:port/db`) |
| `JWT_SECRET` | Y | - | JWT 서명 키 (최소 32자 이상 랜덤 문자열, HS256 알고리즘) |
| `JWT_EXPIRES_IN` | N | `3600` | Access Token 유효기간 (초 단위, 기본 1시간) |
| `BCRYPT_COST_FACTOR` | N | `12` | bcrypt 해싱 강도 (12 이상 유지) |
| `CORS_ORIGIN` | Y | `http://localhost:5173` | 허용할 프론트엔드 오리진 (프로덕션에서 실제 도메인으로 변경) |

```bash
# backend/.env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/todolist_dev
JWT_SECRET=                        # 필수: 최소 32자 이상의 랜덤 문자열 (예: openssl rand -base64 32)
JWT_EXPIRES_IN=3600
BCRYPT_COST_FACTOR=12
CORS_ORIGIN=http://localhost:5173
```

**환경별 설정값 가이드:**

| 변수명 | development | production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | 로컬 PostgreSQL | 프로덕션 DB URL |
| `JWT_SECRET` | 개발용 임시 키 | 강력한 랜덤 키 (주기적 교체) |
| `BCRYPT_COST_FACTOR` | `10` (속도 우선) | `12` 이상 (보안 우선) |
| `CORS_ORIGIN` | `http://localhost:5173` | 실제 프론트엔드 도메인 |

---

#### 프론트엔드 환경변수 목록

| 변수명 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `VITE_API_BASE_URL` | Y | `http://localhost:3000` | 백엔드 API 서버 기본 URL |
| `VITE_APP_TITLE` | N | `todolist-app` | 브라우저 탭 타이틀 |

```bash
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=todolist-app
```

**환경별 설정값 가이드:**

| 변수명 | development | production |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | 실제 백엔드 도메인 (HTTPS) |

> **주의:** 프론트엔드 환경변수는 빌드 시 번들에 포함되어 브라우저에서 누구나 볼 수 있다. JWT_SECRET, DB 비밀번호 등 시크릿을 절대 추가하지 않는다.

---

#### 환경변수 중앙 관리 코드

```typescript
// backend/src/config/index.ts
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'];
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    console.error(`[Config] Missing required env var: ${key}`);
    process.exit(1);
  }
});

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  db: {
    url: process.env.DATABASE_URL!,
    pool: {
      max: 20,                  // 최대 연결 수 (동시접속 500명 기준)
      idleTimeoutMillis: 30000, // 유휴 연결 해제 대기 시간 (30초)
      connectionTimeoutMillis: 2000, // 연결 획득 타임아웃 (2초)
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
  },
  bcrypt: { costFactor: Number(process.env.BCRYPT_COST_FACTOR ?? 12) },
  cors: { origin: process.env.CORS_ORIGIN! },
};
```

```typescript
// frontend/src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'todolist-app',
};
```

---

### 5.2 보안 원칙

#### JWT 인증 (BR-09)

| 항목 | 규칙 |
|---|---|
| 알고리즘 | HS256 고정 (`none` 알고리즘 공격 방지를 위해 명시적 지정) |
| Payload | `{ userId, email, iat, exp }` 최소한의 정보만 포함 (비밀번호 해시 포함 금지) |
| 유효기간 | 1시간 (3600초) |
| 만료/위변조 | 401 Unauthorized 반환 |
| 적용 범위 | UC-03~08 모든 라우트에 `authMiddleware` 필수 적용 |

#### 비밀번호 보안 (NFR-02, BR-11)

- bcrypt **cost factor 12 이상** 적용
- 로그인 실패 시 이메일 존재 여부를 응답에서 구분하지 않는다 (정보 노출 방지)
- 비밀번호 복잡도: 8~20자, 대소문자+숫자+특수문자(`!@#$%^&*`) 각 1자 이상

#### SQL Injection 방지

```typescript
// Good - Parameterized Query
const result = await pool.query(
  'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
  [todoId, userId]
);

// Bad - 문자열 직접 조합 (절대 금지)
const result = await pool.query(
  `SELECT * FROM todos WHERE id = '${todoId}'`
);
```

#### CORS 설정

- `CORS_ORIGIN` 환경변수로 허용 오리진을 명시적으로 지정한다.
- 프로덕션에서 와일드카드 `*` 금지, 실제 프론트엔드 도메인만 허용한다.

---

### 5.3 에러 핸들링 원칙

**공통 에러 응답 포맷:**

```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "dueDate must be greater than or equal to startDate"
  }
}
```

**규칙:**
- 모든 비즈니스 에러는 `AppError(statusCode, message, code)` 클래스로 throw한다.
- 중앙 `errorMiddleware`에서 일관된 JSON 형식으로 변환하여 응답한다.
- 프로덕션 환경에서 스택 트레이스를 응답에 포함하지 않는다.
- 500 에러의 원인은 서버 로그에만 기록하고, 클라이언트에는 제네릭 메시지만 반환한다.
- `catch(e) {}` 빈 패턴은 금지한다.

---

### 5.4 로깅 원칙

**로깅 도구:** 별도 로깅 라이브러리 없이 **`console` 내장 메서드**를 사용한다.

| 로그 레벨 | 사용 메서드 | 대상 | 예시 |
|---|---|---|---|
| `INFO` | `console.log` | 요청/응답 (메서드, 경로, 상태코드, 응답시간) | `POST /api/auth/login 200 45ms` |
| `WARN` | `console.warn` | 비즈니스 규칙 위반, 인증 실패 | `Login failed for email: user@example.com` |
| `ERROR` | `console.error` | 500 에러, DB 연결 실패 | 스택 트레이스 포함 |
| `DEBUG` | `console.log` | 개발 환경 전용 상세 정보 | SQL 쿼리, 요청 바디 |

**사용 예시:**

```typescript
// requestLogger.ts - 요청/응답 로깅
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// authMiddleware.ts - 인증 실패 경고
console.warn(`[Auth] Invalid token attempt: ${req.path}`);

// errorMiddleware.ts - 서버 에러 기록
console.error(`[Error] ${err.message}`, err.stack);

// 개발 환경 전용 디버그 로그
if (process.env.NODE_ENV === 'development') {
  console.log(`[Debug] Query params:`, req.query);
}
```

**규칙:**
- 로그에 비밀번호, JWT 토큰, 개인정보를 포함하지 않는다.
- `NODE_ENV=production`에서 `DEBUG` 레벨 로그(`console.log`)는 조건문으로 비활성화한다.
- 로그 메시지에 `[모듈명]` 접두사를 붙여 출처를 명확히 한다. (예: `[Auth]`, `[Todo]`, `[DB]`)

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                        # API 클라이언트 레이어
│   │   ├── axiosInstance.ts        # axios 인스턴스, 인터셉터 (JWT 자동 첨부, 401 처리)
│   │   ├── authApi.ts              # UC-01, UC-02, UC-03 API 함수
│   │   └── todoApi.ts              # UC-04~08 API 함수
│   │
│   ├── components/
│   │   ├── common/                 # 도메인 무관 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Pagination.tsx
│   │   └── todo/                   # Todo 도메인 전용 컴포넌트
│   │       ├── TodoCard.tsx        # 할일 카드 (상태 배지 포함)
│   │       ├── TodoList.tsx        # 할일 목록 + 페이지네이션
│   │       ├── TodoForm.tsx        # 할일 생성/수정 폼
│   │       ├── TodoFilter.tsx      # 상태 필터 + 정렬 UI
│   │       └── TodoStatusBadge.tsx # TodoStatus별 색상 배지
│   │
│   ├── config/
│   │   └── env.ts                  # 환경변수 중앙 관리
│   │
│   ├── hooks/                      # TanStack Query 커스텀 훅
│   │   ├── useTodos.ts             # 할일 목록 조회 (UC-05)
│   │   ├── useTodo.ts              # 할일 상세 조회 (UC-06)
│   │   ├── useCreateTodo.ts        # 할일 생성 뮤테이션 (UC-04)
│   │   ├── useUpdateTodo.ts        # 할일 수정 뮤테이션 (UC-07)
│   │   └── useCompleteTodo.ts      # 완료 처리 뮤테이션 (UC-08)
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx           # UC-02
│   │   ├── SignupPage.tsx          # UC-01
│   │   └── TodoListPage.tsx        # UC-04~08 통합 뷰
│   │
│   ├── stores/                     # Zustand 클라이언트 상태
│   │   └── useAuthStore.ts         # accessToken, user 정보, logout 액션
│   │
│   ├── types/
│   │   ├── todo.types.ts           # Todo, TodoStatus, CreateTodoInput, TodoFilters 등
│   │   ├── auth.types.ts           # User, LoginInput, SignupInput, AuthResponse 등
│   │   └── api.types.ts            # ApiResponse<T>, PaginationMeta, ApiError 등
│   │
│   ├── utils/
│   │   ├── todoStatusUtils.ts      # computeTodoStatus() - 상태 계산 로직 (테스트 P0)
│   │   ├── dateUtils.ts            # 날짜 포맷, 비교 유틸
│   │   └── validationUtils.ts      # 이메일 형식, 비밀번호 복잡도 검증
│   │
│   ├── App.tsx                     # 라우터 설정 (react-router-dom)
│   ├── main.tsx                    # 진입점, QueryClientProvider, 라우터 Provider
│   └── queryClient.ts              # TanStack QueryClient 설정 (staleTime, retry 등)
│
├── .env                            # 환경변수 (Git 제외)
├── .env.example                    # 환경변수 키 목록 (Git 포함)
├── .eslintrc.json
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 디렉토리별 역할 요약

| 디렉토리 | 역할 |
|---|---|
| `src/api/` | 서버와의 HTTP 통신 담당. JWT 토큰 자동 첨부, 401 응답 시 자동 로그아웃 처리 |
| `src/components/common/` | 도메인 무관 재사용 UI 컴포넌트. props만으로 동작하며 외부 상태에 의존하지 않음 |
| `src/components/todo/` | Todo 도메인 전용 컴포넌트. 상태 시각화, 완료 처리 버튼 등 포함 |
| `src/hooks/` | TanStack Query 기반 서버 상태 훅. 캐시 키(`todoKeys`) 관리 |
| `src/pages/` | 라우트 단위 최상위 컴포넌트. 훅에서 데이터를 받아 Feature 컴포넌트에 전달 |
| `src/stores/` | Zustand 기반 클라이언트 전용 상태. 인증 토큰, 로그인 사용자 정보만 관리 |
| `src/types/` | 전체 프론트엔드 공유 TypeScript 타입. 백엔드 API 응답 스키마와 일치 유지 |
| `src/utils/` | 순수 함수만 포함. 사이드 이펙트 없음, 단위 테스트 필수 |

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── config/
│   │   ├── index.ts                # 환경변수 로드 및 시작 시 필수값 검증
│   │   └── database.ts             # pg Pool 생성 및 익스포트 (max: 20, idleTimeout: 30s)
│   │
│   ├── controllers/
│   │   ├── authController.ts       # UC-01: 회원가입, UC-02: 로그인, UC-03: 로그아웃
│   │   └── todoController.ts       # UC-04~08
│   │
│   ├── services/
│   │   ├── authService.ts          # 비밀번호 해싱/검증, JWT 발급 (BR-09, BR-10, BR-11)
│   │   └── todoService.ts          # 할일 CRUD, 완료 처리, 상태 계산 (BR-03~08)
│   │
│   ├── repositories/
│   │   ├── userRepository.ts       # users 테이블 CRUD
│   │   └── todoRepository.ts       # todos 테이블 CRUD + 필터/정렬/페이지네이션 쿼리
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.ts       # JWT 검증 미들웨어 (UC-03~08에 적용)
│   │   ├── errorMiddleware.ts      # 중앙 에러 핸들러 (AppError → JSON 응답)
│   │   └── requestLogger.ts        # 요청/응답 로깅 (메서드, 경로, 상태코드, 응답시간)
│   │
│   ├── routes/
│   │   ├── authRoutes.ts           # POST /api/auth/signup, /login, /logout
│   │   └── todoRoutes.ts           # GET/POST /api/todos, GET/PATCH /api/todos/:id
│   │
│   ├── utils/
│   │   ├── todoStatusUtils.ts      # computeTodoStatus() - 상태 계산 (단위 테스트 P0)
│   │   ├── dateUtils.ts            # 날짜 비교, 포맷 유틸
│   │   └── passwordUtils.ts        # bcrypt 해싱/비교 래퍼
│   │
│   ├── errors/
│   │   └── AppError.ts             # 커스텀 에러 클래스 (statusCode, message, code)
│   │
│   ├── types/
│   │   ├── todo.types.ts           # Todo, CreateTodoInput, UpdateTodoInput, TodoFilters
│   │   ├── auth.types.ts           # User, JwtPayload, LoginInput, SignupInput
│   │   └── express.d.ts            # Express Request 타입 확장 (req.user 타입 추가)
│   │
│   └── app.ts                      # Express 앱 설정 (미들웨어, 라우터 등록)
│
├── tests/
│   ├── unit/
│   │   ├── todoStatusUtils.test.ts # computeTodoStatus 경계값 테스트 (P0)
│   │   ├── authService.test.ts     # 비밀번호 검증, JWT 발급 테스트
│   │   └── todoService.test.ts     # BR-03, BR-04 비즈니스 규칙 테스트
│   └── integration/
│       ├── auth.test.ts            # UC-01, UC-02 API 통합 테스트
│       └── todo.test.ts            # UC-04~08 API 통합 테스트 (AC 기준 검증)
│
├── .env                            # 환경변수 (Git 제외)
├── .env.example                    # 환경변수 키 목록 (Git 포함)
├── .eslintrc.json
├── .prettierrc
├── jest.config.ts
├── package.json
├── tsconfig.json
└── server.ts                       # 진입점 (app.ts 임포트 후 포트 리슨)
```

### 디렉토리별 역할 요약

| 디렉토리 | 역할 |
|---|---|
| `src/config/` | 환경변수 로드 및 DB 연결 풀 생성. 앱 시작 시 필수값 누락을 즉시 감지 |
| `src/controllers/` | HTTP 계층. `req`에서 입력 추출 → Service 호출 → `res`로 응답. 비즈니스 로직 없음 |
| `src/services/` | 핵심 비즈니스 로직. 모든 BR 적용 지점. DB를 직접 알지 않고 Repository에 위임 |
| `src/repositories/` | SQL 쿼리 실행 전담. Parameterized Query 강제. `status` 필터는 날짜 조건으로 변환하여 쿼리 |
| `src/middlewares/` | 횡단 관심사. 인증, 에러 처리, 로깅은 비즈니스 레이어와 분리 |
| `src/utils/` | 순수 함수. `computeTodoStatus()`는 날짜와 완료 여부만 받아 상태를 반환 |
| `src/errors/` | `AppError` 클래스. 모든 비즈니스/검증 에러는 이 클래스로 throw |
| `src/types/` | Express `Request` 타입 확장 포함. `req.user: JwtPayload` 타입 인식 |
| `tests/` | `unit/`은 외부 의존성 없는 순수 로직, `integration/`은 실제 DB에 연결하여 AC 기준으로 검증 |

---

## 8. 공통 규칙 요약 (체크리스트)

PR/코드리뷰 전 아래 항목을 모두 확인한다.

### 아키텍처 / 레이어
- [ ] Controller에서 SQL 또는 pg 쿼리를 직접 실행하지 않는가?
- [ ] Service에서 `req`, `res` Express 객체를 참조하지 않는가?
- [ ] Repository가 HTTP 상태코드나 에러 메시지를 직접 반환하지 않는가?
- [ ] 프론트엔드 UI Component가 API를 직접 호출하지 않고 props를 통해 데이터를 받는가?
- [ ] 서버 상태(Todo 목록)가 Zustand가 아닌 TanStack Query에서만 관리되는가?

### 보안
- [ ] 모든 DB 쿼리에서 Parameterized Query(`$1`, `$2`...)를 사용하는가?
- [ ] JWT 검증 시 알고리즘을 명시적으로 `HS256`으로 지정하는가?
- [ ] bcrypt cost factor가 12 이상인가?
- [ ] 프론트엔드 `.env`에 시크릿(`JWT_SECRET` 등)이 포함되지 않는가?
- [ ] 에러 응답에 스택 트레이스가 포함되지 않는가? (프로덕션 환경)
- [ ] CORS 허용 오리진이 와일드카드(`*`)가 아닌 명시적 도메인인가? (프로덕션 환경)

### 비즈니스 로직
- [ ] `dueDate >= startDate` 검증이 서버에서 수행되는가? (BR-04)
- [ ] 할일 완료 시 `completedAt`이 서버 시각으로 기록되는가? (BR-05, 클라이언트 값 무시)
- [ ] Todo 상태 계산이 `computeTodoStatus()` 유틸 함수를 통해 일관되게 처리되는가?
- [ ] 타인의 할일 접근 시 403이 반환되는가? (BR-02)
- [ ] 할일 목록 조회 시 `WHERE userId = 인증된_사용자_ID`가 적용되는가?

### 코드 품질
- [ ] TypeScript `any` 타입을 사용하지 않거나, 사용 시 이유 주석이 있는가?
- [ ] `catch(e) {}` 형태의 빈 에러 핸들러가 없는가?
- [ ] 환경변수가 코드에 하드코딩되지 않고 `config/` 모듈을 통해 참조되는가?
- [ ] 새로운 비즈니스 로직에 대한 단위 테스트가 작성되었는가?
- [ ] `computeTodoStatus()` 변경이 있다면 경계값 테스트가 포함되는가?

### 네이밍 / 구조
- [ ] 파일명이 레이어별 명명 규칙(Controller/Service/Repository 접미사)을 따르는가?
- [ ] 커스텀 훅이 `use` 접두사로 시작하는가?
- [ ] 컴포넌트 Props 타입이 `[ComponentName]Props` 형식으로 정의되었는가?
- [ ] TanStack Query 키가 `todoKeys` factory 패턴을 사용하는가?

---

*이 문서는 프로젝트 구조 및 기술 결정이 변경될 때마다 업데이트한다. 새로운 패턴이 도입될 경우 해당 섹션에 Good/Bad 예시와 함께 추가한다.*
