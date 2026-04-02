# 실행 계획 (Execution Plan)

**프로젝트명:** todolist-app
**작성일:** 2026-04-01
**버전:** 1.0.0
**작성자:** Dan Jung
**목표 출시일:** 2026-04-03

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|---|---|---|---|
| 1.0.0 | 2026-04-01 | 초안 작성 | Dan Jung |

---

## 전체 Task 요약

| 영역 | Task 수 | 예상 시간 |
|---|---|---|
| 데이터베이스 (DB) | 8개 | 10h |
| 백엔드 (BE) | 13개 | 17h |
| 프론트엔드 (FE) | 15개 | 32.5h |
| **합계** | **36개** | **약 59.5h** |

---

## 의존성 다이어그램

```
[DB-01] ──┬──> [DB-02] ──> [DB-07] ──> [DB-08]
          ├──> [DB-03] ──┬──> [DB-04]
          │             └──> [DB-05] ──> [DB-08]
          └──> [DB-06] ──> [DB-07]

[BE-01] ──> [BE-02] ──> [BE-03] ──> [BE-04] ──┬──> [BE-05] ──> [BE-06] ──> [BE-11]
                                               └──> [BE-07] ──> [BE-08] ──> [BE-09] ──> [BE-11]
                                                                             [BE-10] ──> [BE-11]
                                               [BE-12] (BE-03 완료 후 병렬)
                                               [BE-11], [BE-12] ──> [BE-13]

[FE-01] ──> [FE-02] ──> [FE-03] ──> [FE-04] ──┬──> [FE-05]
                                               ├──> [FE-06]
                                               └──> [FE-07] ──┬──> [FE-08]
                                                              ├──> [FE-09] ──> [FE-10]
                                                              └──> [FE-11]
                                               [FE-05~11] ──> [FE-12] ──> [FE-14] ──> [FE-15]
                                                          └──> [FE-13] ──> [FE-15]
```

---

## 1. 데이터베이스 (DB)

---

### DB-01: PostgreSQL 데이터베이스 초기화 및 스키마 생성
**의존성:** 없음
**예상시간:** 1h

#### 작업 내용
- PostgreSQL 14+ 실행 확인
- `database/schema.sql` DDL 실행하여 테이블 초기화
- `users` 테이블 생성 (id, email, password, name, created_at)
- `todos` 테이블 생성 (id, user_id, title, description, start_date, due_date, is_completed, completed_at, created_at, updated_at)
- 외래키 설정 (`todos.user_id → users.id ON DELETE CASCADE`)
- 제약조건 설정 (`UNIQUE` email, `CHECK` due_date >= start_date)

#### 완료 조건
- [x] PostgreSQL 서버 정상 실행 확인
- [x] `users` 테이블 생성 및 컬럼 확인
- [x] `todos` 테이블 생성 및 컬럼 확인
- [x] 외래키 제약조건 정상 적용 확인
- [x] `CHECK (due_date >= start_date)` 제약조건 확인

---

### DB-02: 데이터베이스 인덱스 생성
**의존성:** DB-01
**예상시간:** 1h

#### 작업 내용
- `idx_todos_user_id` 인덱스 생성 (UC-05 목록 조회 최적화)
- `idx_todos_due_date` 인덱스 생성 (FAILED·CLOSED 상태 필터)
- `idx_todos_start_date` 인덱스 생성 (UPCOMING 상태 필터)
- `idx_todos_created_at` 인덱스 생성 (기본 정렬 createdAt DESC)
- `idx_todos_user_completed` 복합 인덱스 생성 (user_id, is_completed)

#### 완료 조건
- [x] `idx_todos_user_id` 생성 확인
- [x] `idx_todos_due_date` 생성 확인
- [x] `idx_todos_start_date` 생성 확인
- [x] `idx_todos_created_at` 생성 확인
- [x] `idx_todos_user_completed` 복합 인덱스 생성 확인
- [x] EXPLAIN ANALYZE로 인덱스 사용 확인

---

### DB-03: pg Connection Pool 설정 (`database.ts`)
**의존성:** DB-01
**예상시간:** 1.5h

#### 작업 내용
- `backend/src/config/database.ts` 파일 생성
- `pg.Pool` 초기화 (max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000)
- `DATABASE_URL` 환경변수에서 접속 정보 로드
- 연결 실패 시 `console.error` 로그
- `pool` 기본 export, `closePool()` 함수 제공

#### 완료 조건
- [x] `database.ts` 파일 생성
- [x] Pool 설정값 (max: 20, idleTimeout: 30s, connectionTimeout: 2s) 적용 확인
- [x] `await pool.query('SELECT NOW()')` 성공 확인
- [x] 환경변수 누락 시 에러 로그 출력 확인
- [x] `closePool()` 함수 정상 동작 확인

---

### DB-04: User Repository 구현
**의존성:** DB-03
**예상시간:** 1.5h

#### 작업 내용
- `backend/src/repositories/userRepository.ts` 생성
- `findByEmail(email)` — 이메일로 사용자 조회 (중복 확인용)
- `insertUser(email, hashedPassword, name)` — 사용자 생성
- `findById(userId)` — ID로 사용자 조회
- 모든 쿼리 Parameterized Query (`$1`, `$2`) 사용

#### 완료 조건
- [ ] `userRepository.ts` 파일 생성
- [ ] `findByEmail()` Parameterized Query 사용 확인
- [ ] `insertUser()` 후 `users` 테이블 데이터 저장 확인
- [ ] `findById()` 정상 반환 확인
- [ ] SQL Injection 방어 (문자열 직접 조합 없음)
- [ ] 반환 타입 TypeScript 정의 완료

---

### DB-05: Todo Repository 구현
**의존성:** DB-03
**예상시간:** 2.5h

#### 작업 내용
- `backend/src/repositories/todoRepository.ts` 생성
- `insertTodo(userId, title, description, startDate, dueDate)` — 생성
- `findById(todoId)` — 상세 조회
- `findByIdAndUserId(todoId, userId)` — 권한 검증용 조회
- `findByUserId(userId, filters, pagination)` — 목록 조회 (상태 필터·정렬·페이지네이션)
- `updateTodo(todoId, updates)` — 수정
- `updateTodoStatus(todoId, isCompleted, completedAt)` — 완료 처리
- `countByUserId(userId, filters)` — 페이지네이션 total 계산
- status 필터 → 날짜/완료 조건 SQL 변환 (CLOSED = dueDate < NOW)
- 모든 쿼리 `WHERE user_id = $?` 포함

#### 완료 조건
- [ ] `todoRepository.ts` 파일 생성
- [ ] `insertTodo()` 후 `todos` 테이블 데이터 저장 확인
- [ ] `findByUserId()` status 필터 정확 동작 확인 (6가지 상태)
- [ ] 페이지네이션 OFFSET/LIMIT 적용 확인
- [ ] 정렬 (sortBy, sortOrder) 적용 확인
- [ ] `updateTodoStatus()` completedAt 처리 확인
- [ ] `WHERE user_id = $?` 모든 쿼리에 포함 확인
- [ ] 모든 쿼리 Parameterized Query 사용 확인

---

### DB-06: 백엔드 환경변수 파일 설정
**의존성:** DB-01
**예상시간:** 0.5h

#### 작업 내용
- `backend/.env.example` 생성 (키 이름만, 값 없음)
- `backend/.env` 생성 (로컬 개발용, Git 제외)
- `.gitignore`에 `.env` 추가
- 필수 환경변수: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_COST_FACTOR`, `CORS_ORIGIN`

#### 완료 조건
- [ ] `.env.example` 파일 생성 및 모든 필수 키 포함
- [ ] `.env` 파일 생성 및 로컬 값 설정
- [ ] `DATABASE_URL` 유효한 PostgreSQL 접속 문자열 확인
- [ ] `.gitignore`에 `.env` 추가 확인
- [ ] `.env.example`은 Git에 포함됨 확인

---

### DB-07: DB 초기화 스크립트 작성
**의존성:** DB-02, DB-03, DB-06
**예상시간:** 1h

#### 작업 내용
- `backend/scripts/resetDb.ts` 생성
- 기존 테이블 DROP 후 `schema.sql` 재실행
- `package.json`에 `npm run db:reset` 명령 추가
- 에러 처리 및 로그 출력

#### 완료 조건
- [ ] `resetDb.ts` 파일 생성
- [ ] 스크립트 실행 후 테이블 재생성 확인
- [ ] `package.json`에 `db:reset` 명령 추가 확인
- [ ] 에러 발생 시 로그 출력 및 프로세스 종료 확인

---

### DB-08: 통합 테스트 DB 환경 설정
**의존성:** DB-05, DB-07
**예상시간:** 1.5h

#### 작업 내용
- `backend/tests/helpers/setupDb.ts` 생성
- `initializeTestDb()`, `cleanupTestDb()`, `seedTestData()` 헬퍼 구현
- `beforeEach` / `afterEach` 훅으로 테스트 전후 테이블 초기화

#### 완료 조건
- [ ] `setupDb.ts` 파일 생성 및 초기화 함수 구현
- [ ] 각 테스트 전후 데이터 초기화 확인
- [ ] `seedTestData()` 테스트 데이터 삽입 확인
- [ ] 테스트 종료 후 DB 정리 확인

---

## 2. 백엔드 (BE)

---

### BE-01: 프로젝트 초기화 및 기본 구조 설정
**의존성:** 없음
**예상시간:** 1.5h

#### 작업 내용
- Node.js + Express + TypeScript 프로젝트 초기화
- 의존성 설치: `express`, `bcrypt`, `jsonwebtoken`, `pg`, `cors`, `typescript`
- 디렉토리 구조 생성: `src/{config,controllers,services,repositories,middlewares,routes,utils,errors,types}`
- `tsconfig.json`, `jest.config.ts`, `.eslintrc.json`, `.prettierrc` 설정

#### 완료 조건
- [x] `package.json` 생성 (필수 의존성 모두 포함)
- [x] 디렉토리 구조 완성
- [x] `npm run build` 성공 (TypeScript 컴파일)
- [x] `npm run typecheck` 오류 없음

---

### BE-02: 환경변수 및 DB 연결 설정
**의존성:** BE-01
**예상시간:** 1h

#### 작업 내용
- `src/config/index.ts`: 환경변수 로드, 필수값 검증, `config` 객체 export
- `src/config/database.ts`: `pg.Pool` 생성 (max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000)

#### 완료 조건
- [x] 필수 환경변수 누락 시 `process.exit(1)` 실행 확인
- [x] `config` 객체에서 모든 설정값 접근 가능
- [x] `await pool.query('SELECT NOW()')` 성공
- [x] Connection Pool 설정값 (max: 20) 적용 확인

---

### BE-03: 공통 유틸 및 타입 정의
**의존성:** BE-01
**예상시간:** 1h

#### 작업 내용
- `src/errors/AppError.ts`: 커스텀 에러 클래스 (statusCode, message, code)
- `src/utils/todoStatusUtils.ts`: `computeTodoStatus(isCompleted, completedAt, startDate, dueDate)` — 우선순위 기반 5가지 상태 계산
- `src/utils/passwordUtils.ts`: `hashPassword()`, `comparePassword()` (bcrypt 래퍼)
- `src/utils/dateUtils.ts`: `getCurrentDate()`, 날짜 비교 유틸
- `src/types/auth.types.ts`, `src/types/todo.types.ts`, `src/types/express.d.ts` 타입 정의

#### 완료 조건
- [x] `AppError` throw/catch 정상 동작
- [x] `computeTodoStatus()` 5가지 상태 모두 정확히 반환 (경계값 포함)
- [x] `hashPassword()` bcrypt cost factor 12 적용 확인
- [x] TypeScript 타입 정의 완료 (User, Todo, JwtPayload, CreateTodoInput 등)
- [x] `req.user: JwtPayload` 타입 확장 (`express.d.ts`)

---

### BE-04: Express 앱 및 미들웨어 설정
**의존성:** BE-02, BE-03
**예상시간:** 1h

#### 작업 내용
- `src/app.ts`: Express 앱 설정, 미들웨어·라우터 등록
- `src/middlewares/authMiddleware.ts`: JWT 검증 (HS256 명시, `req.user` 설정), 실패 시 401
- `src/middlewares/errorMiddleware.ts`: 중앙 에러 핸들러 (`AppError` → 표준 JSON)
- `src/middlewares/requestLogger.ts`: `console.log('[METHOD] [PATH] [STATUS] [TIME]ms')`
- `src/server.ts`: 포트 리슨 진입점
- CORS 설정 (`CORS_ORIGIN` 환경변수 사용)

#### 완료 조건
- [x] `npm run dev` 서버 정상 시작
- [x] 에러 미들웨어가 `AppError`를 `{ error: { code, message } }` JSON으로 변환 확인
- [x] 요청 로그 형식 `POST /api/auth/login 200 45ms` 출력 확인
- [x] JWT 검증 미들웨어: 정상 토큰 → `req.user` 설정, 만료 → 401 응답
- [x] CORS 헤더 적용 확인

---

### BE-05: User Repository + Auth Service (UC-01, UC-02)
**의존성:** BE-02, BE-03
**예상시간:** 1h

#### 작업 내용
- `src/repositories/userRepository.ts`: `findByEmail()`, `insertUser()`, `findById()`
- `src/services/authService.ts`:
  - `signup()`: 비밀번호 복잡도 검증(BR-11) → bcrypt 해싱 → 중복 이메일 시 409
  - `login()`: 이메일 존재 확인, 비밀번호 대조, JWT 발급 (HS256, 1h)

#### 완료 조건
- [x] `findByEmail()` Parameterized Query 사용 확인
- [x] `signup()` 비밀번호 복잡도 위반 시 400 throw (BR-11)
- [x] `signup()` 중복 이메일 시 409 throw (BR-10)
- [x] `login()` 성공 시 JWT 발급 (payload: userId, email, iat, exp)
- [x] `login()` 비밀번호 불일치 시 401 throw

---

### BE-06: Auth Controller + Routes (UC-01, UC-02, UC-03)
**의존성:** BE-04, BE-05
**예상시간:** 1h

#### 작업 내용
- `src/controllers/authController.ts`: `handleSignup()`, `handleLogin()`, `handleLogout()`
- `src/routes/authRoutes.ts`:
  - `POST /api/auth/signup` → `handleSignup`
  - `POST /api/auth/login` → `handleLogin`
  - `POST /api/auth/logout` → `authMiddleware` → `handleLogout`

#### 완료 조건
- [x] `POST /api/auth/signup` 201 응답 (AC-01-1)
- [x] `POST /api/auth/signup` 409 응답 — 중복 이메일 (AC-01-2)
- [x] `POST /api/auth/signup` 400 응답 — 형식 오류 (AC-01-3)
- [x] `POST /api/auth/login` 200 응답 + JWT (AC-02-1)
- [x] `POST /api/auth/login` 401 응답 — 비밀번호 불일치 (AC-02-2)
- [x] `POST /api/auth/login` 401 응답 — 이메일 미존재 (AC-02-3)
- [x] `POST /api/auth/logout` 200 응답 (인증된 사용자)

---

### BE-07: Todo Repository (UC-04~08)
**의존성:** BE-02, BE-03
**예상시간:** 1.5h

#### 작업 내용
- `src/repositories/todoRepository.ts` 생성
- `insertTodo()`, `findById()`, `findByIdAndUserId()`, `findByUserId()`, `updateTodo()`, `updateTodoStatus()`, `countByUserId()`
- status 필터 → SQL 날짜 조건 변환 (CLOSED = `due_date < NOW()`)
- 모든 쿼리 `WHERE user_id = $?` 포함, Parameterized Query 사용

#### 완료 조건
- [x] `insertTodo()` DB 저장 확인
- [x] `findByUserId()` status 필터 6가지 모두 정확 동작
- [x] 페이지네이션 OFFSET/LIMIT 적용 확인
- [x] `WHERE user_id = $?` 모든 쿼리 포함 확인
- [x] Parameterized Query 사용 확인 (SQL Injection 방지)
- [x] `countByUserId()` 전체 레코드 수 정확 반환

---

### BE-08: Todo Service (UC-04~08 비즈니스 로직)
**의존성:** BE-03, BE-07
**예상시간:** 1.5h

#### 작업 내용
- `src/services/todoService.ts` 생성
- `createTodo()`: 입력 검증 (BR-03, BR-04) → `insertTodo()`
- `getTodoList()`: `findByUserId()` + `computeTodoStatus()` 상태 계산
- `getTodoDetail()`: 권한 검증 (BR-02) → `findByIdAndUserId()`
- `updateTodo()`: 권한 검증 → BR-04 검증 → `updateTodo()`
- `toggleTodoComplete()`: 권한 검증 → BR-05/BR-06 처리 → `updateTodoStatus()`

#### 완료 조건
- [x] `createTodo()` dueDate < startDate 시 400 (BR-04, AC-04-2)
- [x] `createTodo()` startDate 누락 시 400 (BR-03, AC-04-3)
- [x] `getTodoList()` 본인 할일만 반환 (BR-02, AC-05-1)
- [x] `getTodoList()` status 필터 정상 동작 (AC-05-2)
- [x] `toggleTodoComplete()` isCompleted=true 시 completedAt 서버 시각 기록 (BR-05, AC-08-1)
- [x] `toggleTodoComplete()` isCompleted=false 시 completedAt null (BR-06, AC-08-2)
- [x] 타인 할일 접근 시 403 throw (BR-02, AC-08-3)

---

### BE-09: Todo Controller + Routes (UC-04~08)
**의존성:** BE-04, BE-08
**예상시간:** 1.5h

#### 작업 내용
- `src/controllers/todoController.ts`: 각 UC별 핸들러
- `src/routes/todoRoutes.ts`:
  - `POST /api/todos` → UC-04
  - `GET /api/todos` → UC-05
  - `GET /api/todos/:todoId` → UC-06
  - `PATCH /api/todos/:todoId` → UC-07
  - `PATCH /api/todos/:todoId/complete` → UC-08
- 모든 라우트에 `authMiddleware` 적용
- 쿼리 파라미터 검증 (page ≥ 1, limit 1~100, status/sortBy/sortOrder 허용값)

#### 완료 조건
- [x] `POST /api/todos` 201 응답 (UC-04)
- [x] `GET /api/todos` 200 응답 + pagination 객체 (UC-05)
- [x] `GET /api/todos/:todoId` 200 응답 (UC-06)
- [x] `PATCH /api/todos/:todoId` 200 응답 (UC-07)
- [x] `PATCH /api/todos/:todoId/complete` 200 응답 (UC-08)
- [x] 미인증 요청 시 401 응답 (모든 라우트)
- [x] page=0 또는 limit=101 요청 시 400 응답
- [x] 타인 할일 접근 시 403 응답

---

### BE-10: 데이터베이스 스키마 적용 (통합 확인)
**의존성:** BE-02
**예상시간:** 1h

#### 작업 내용
- `database/schema.sql` 실행하여 테이블/인덱스 생성 확인
- CASCADE DELETE 동작 확인 (사용자 삭제 시 할일 자동 삭제)
- `CHECK (due_date >= start_date)` 제약 동작 확인

#### 완료 조건
- [x] `users`, `todos` 테이블 생성 확인
- [x] 이메일 UNIQUE 제약 확인
- [x] `userId` FK 제약 확인
- [x] CASCADE DELETE 테스트 통과
- [x] `CHECK (due_date >= start_date)` 위반 시 DB 에러 발생 확인

---

### BE-11: 통합 테스트 작성
**의존성:** BE-06, BE-09, BE-10
**예상시간:** 2h

#### 작업 내용
- `tests/integration/auth.test.ts`: UC-01, UC-02 수용 기준 전체 검증
- `tests/integration/todo.test.ts`: UC-04~08 수용 기준 전체 검증
- 실제 PostgreSQL 테스트 DB 연결 사용

#### 완료 조건
- [x] AC-01-1~3, AC-02-1~3 테스트 케이스 통과
- [x] AC-04-1~3, AC-05-1~3, AC-08-1~3 테스트 케이스 통과
- [x] page=0, limit=101 → 400 경계값 테스트 통과
- [x] status 필터 6가지 테스트 통과
- [x] 권한 검증 (403) 테스트 통과
- [x] JWT 만료/미제공 (401) 테스트 통과

---

### BE-12: 단위 테스트 작성
**의존성:** BE-03
**예상시간:** 1h

#### 작업 내용
- `tests/unit/todoStatusUtils.test.ts`: `computeTodoStatus()` 경계값 테스트
- `tests/unit/authService.test.ts`: 비밀번호 복잡도, bcrypt 해싱 테스트
- `tests/unit/todoService.test.ts`: BR-03, BR-04, BR-05, BR-06 로직 테스트

#### 완료 조건
- [x] `computeTodoStatus()` 5가지 상태 모두 커버 (우선순위 경계값 포함)
- [x] 비밀번호 복잡도 검증 테스트 (유효/무효 케이스 각 3개 이상)
- [x] bcrypt 해싱/비교 테스트 통과
- [x] BR-04 위반 케이스 (dueDate < startDate) 테스트 통과
- [x] 테스트 커버리지 80% 이상

---

### BE-13: 빌드 및 최종 검증
**의존성:** BE-11, BE-12
**예상시간:** 1h

#### 작업 내용
- `npm run build` TypeScript 컴파일 성공
- `NODE_ENV=production` 환경에서 에러 응답 스택 트레이스 미포함 확인
- API 응답 시간 측정 (목표: 95th percentile 300ms 이하, NFR-01)
- Connection Pool 동시 요청 처리 테스트

#### 완료 조건
- [x] `npm run build` 성공
- [x] 프로덕션 환경에서 에러 응답에 스택 트레이스 미포함
- [x] 기본 API 응답시간 300ms 이하
- [x] 동시 요청 100개 처리 성공
- [x] 모든 테스트 통과 상태에서 배포 준비 완료

---

## 3. 프론트엔드 (FE)

---

### FE-01: 프로젝트 초기화 및 공통 인프라
**의존성:** 없음
**예상시간:** 2h

#### 작업 내용
- Vite + React 19 + TypeScript 프로젝트 초기화
- 의존성 설치: `axios`, `zustand`, `@tanstack/react-query`, `react-router-dom`
- `QueryClientProvider` 설정 및 React Query DevTools 연결
- `src/config/env.ts` 환경변수 중앙 관리 (`VITE_API_BASE_URL`)
- React Router v6 기본 라우팅 구조 설정
- `tsconfig.json`, `.eslintrc.json`, `.prettierrc` 설정

#### 완료 조건
- [ ] `npm run dev` 정상 실행
- [ ] `VITE_API_BASE_URL` 환경변수 로드 확인
- [ ] QueryClient 설정 및 DevTools 활성화 확인
- [ ] 기본 라우팅 2개 이상 정상 동작
- [ ] `npm run build` 성공

---

### FE-02: 공통 유틸 함수 및 타입 정의
**의존성:** FE-01
**예상시간:** 2h

#### 작업 내용
- `src/utils/todoStatusUtils.ts`: `computeTodoStatus(startDate, dueDate, isCompleted, completedAt)` — 5가지 상태 계산
- `src/utils/validationUtils.ts`: 이메일 형식, 비밀번호 복잡도(BR-11), 날짜, 길이 검증
- `src/utils/dateUtils.ts`: 날짜 포맷, 비교 유틸
- `src/types/todo.types.ts`, `src/types/auth.types.ts`, `src/types/api.types.ts` 타입 정의

#### 완료 조건
- [x] `computeTodoStatus()` 5가지 상태 정확 계산 확인 (다양한 날짜 조합 테스트)
- [ ] 비밀번호 복잡도 검증 유효/무효 케이스 각 3개 이상 통과
- [ ] 날짜 비교 시 timezone 이슈 없음 확인
- [ ] 모든 타입이 API 명세와 일치

---

### FE-03: Zustand 인증 Store
**의존성:** FE-01
**예상시간:** 1.5h

#### 작업 내용
- `src/stores/useAuthStore.ts` 생성
- 상태: `accessToken`, `user(id, email, name)`, `isLoading`
- 액션: `setToken()`, `setUser()`, `clearAuth()`
- `localStorage` 연동 (새로고침 후 토큰 복구)
- JWT 토큰 만료 여부 체크 함수

#### 완료 조건
- [ ] 토큰이 `localStorage`에 저장 및 복구됨
- [ ] `clearAuth()` 호출 시 토큰·사용자 정보 모두 초기화
- [ ] 페이지 새로고침 후 로그인 상태 유지 확인
- [ ] Zustand DevTools에서 상태 변화 추적 가능

---

### FE-04: API 클라이언트 레이어
**의존성:** FE-01, FE-03
**예상시간:** 2h

#### 작업 내용
- `src/api/axiosInstance.ts`: axios 인스턴스 생성, 요청 인터셉터(JWT 자동 첨부), 응답 인터셉터(401 → 자동 로그아웃)
- `src/api/authApi.ts`: `signup()`, `login()`, `logout()` 함수 (UC-01~03)
- `src/api/todoApi.ts`: `createTodo()`, `getTodos()`, `getTodo()`, `updateTodo()`, `toggleComplete()` 함수 (UC-04~08)
- `src/hooks/queryKeys.ts`: TanStack Query key factory 패턴 (`todoKeys`)

#### 완료 조건
- [ ] 모든 API 함수 정의 및 입출력 타입 정확히 정의
- [ ] `Authorization: Bearer <token>` 헤더 자동 첨부 확인
- [ ] 401 응답 시 `clearAuth()` 호출 및 로그인 페이지 리다이렉트 동작
- [ ] `todoKeys` factory 패턴 구현 확인

---

### FE-05: 로그인 페이지 (UC-02)
**의존성:** FE-01, FE-02, FE-03, FE-04
**예상시간:** 2h

#### 작업 내용
- `src/pages/LoginPage.tsx` 생성
- `src/components/auth/LoginForm.tsx`: 이메일, 비밀번호 입력, 클라이언트 검증
- `src/hooks/useLogin.ts`: `useMutation` 기반 로그인 훅 (성공 시 토큰 저장 + `/todos` 이동)
- 회원가입 페이지 링크

#### 완료 조건
- [ ] 유효한 자격증명으로 로그인 성공 및 `/todos` 이동
- [ ] 실패 시 에러 메시지 표시 ("이메일 또는 비밀번호가 올바르지 않습니다")
- [ ] 로딩 중 버튼 비활성화 및 스피너 표시
- [ ] 비밀번호 마스킹 처리

---

### FE-06: 회원가입 페이지 (UC-01)
**의존성:** FE-01, FE-02, FE-03, FE-04
**예상시간:** 2.5h

#### 작업 내용
- `src/pages/SignupPage.tsx` 생성
- `src/components/auth/SignupForm.tsx`: 이메일, 비밀번호, 이름 입력, 비밀번호 복잡도 실시간 표시, 비밀번호 확인 필드
- `src/hooks/useSignup.ts`: `useMutation` 기반 회원가입 훅 (성공 시 `/login` 이동)

#### 완료 조건
- [ ] 모든 필드 입력 후 가입 성공 및 로그인 페이지 이동
- [ ] 비밀번호 복잡도 미충족 시 실시간 에러 메시지 표시
- [ ] 중복 이메일 시 "이미 사용 중인 이메일" 메시지 (409)
- [ ] 비밀번호·비밀번호 확인 불일치 시 버튼 비활성화

---

### FE-07: 할일 목록 페이지 (UC-05)
**의존성:** FE-01, FE-02, FE-03, FE-04
**예상시간:** 3h

#### 작업 내용
- `src/pages/TodoListPage.tsx` 생성
- `src/hooks/useTodos.ts`: `useQuery` 기반, 필터·정렬·페이지네이션 지원
- `src/components/todo/TodoList.tsx`: 할일 목록 렌더링, 상태별 색상 구분
- `src/components/todo/TodoFilter.tsx`: 상태 필터·정렬 드롭다운
- `src/components/common/Pagination.tsx`: 이전/다음, 페이지 크기 선택 (20/50/100)
- 로그아웃 버튼, 빈 상태 안내 메시지

#### 완료 조건
- [ ] 모든 할일 목록 표시, 상태별 색상 구분 확인
- [ ] 필터 변경 시 목록 실시간 업데이트
- [ ] 정렬 변경 시 목록 재정렬
- [ ] 페이지네이션 이전/다음 이동 정상 동작
- [ ] 결과 없을 때 안내 메시지 표시
- [ ] 로그아웃 버튼 → 로그인 페이지 이동

---

### FE-08: 할일 생성 폼 (UC-04)
**의존성:** FE-01, FE-02, FE-04, FE-07
**예상시간:** 2.5h

#### 작업 내용
- `src/components/todo/TodoForm.tsx`: 제목(1~200자), 설명(0~2000자), 시작일, 종료일 입력, 실시간 검증, 문자 수 카운터
- `src/hooks/useCreateTodo.ts`: `useMutation` 기반, 성공 시 목록 자동 리페칭 (`queryClient.invalidateQueries`)
- "할일 추가" 버튼으로 모달/폼 열기, 저장/취소 버튼

#### 완료 조건
- [ ] 모든 필드 입력 후 할일 생성 성공
- [ ] 제목 미입력 시 에러 메시지 표시
- [ ] 종료일 < 시작일 시 에러 메시지 표시
- [ ] 설명 2000자 초과 시 에러 표시
- [ ] 생성 성공 후 목록 자동 업데이트

---

### FE-09: 할일 상세 페이지 (UC-06)
**의존성:** FE-01, FE-02, FE-04, FE-07
**예상시간:** 2h

#### 작업 내용
- `src/pages/TodoDetailPage.tsx` 생성
- `src/hooks/useTodoDetail.ts`: `useQuery` 기반 (todoId 파라미터)
- `src/components/todo/TodoDetail.tsx`: 모든 상세 정보 표시, 상태 배지, 완료/수정/뒤로가기 버튼

#### 완료 조건
- [ ] 할일 모든 상세 정보 표시
- [ ] 상태 배지 색상 정확 표시
- [ ] 완료/미완료 토글 즉시 동작
- [ ] 타인 할일 접근 시 에러 메시지 표시 (403)
- [ ] 뒤로가기 버튼 → 목록 페이지 이동

---

### FE-10: 할일 수정 페이지 (UC-07)
**의존성:** FE-01, FE-02, FE-04, FE-09
**예상시간:** 2h

#### 작업 내용
- `src/pages/TodoEditPage.tsx` 생성
- `src/components/todo/TodoEditForm.tsx`: 기존 값 자동 로드, isCompleted·completedAt 읽기 전용
- `src/hooks/useUpdateTodo.ts`: `useMutation` 기반, 성공 시 상세 페이지 캐시 갱신

#### 완료 조건
- [ ] 기존 값이 폼에 자동 로드
- [ ] 수정 후 저장 성공 및 상세 페이지 이동
- [ ] 종료일 < 시작일 시 에러 표시
- [ ] isCompleted·completedAt 수정 불가 (읽기 전용)
- [ ] 성공 후 상세 페이지로 자동 이동

---

### FE-11: 할일 완료 처리 (UC-08)
**의존성:** FE-01, FE-02, FE-04, FE-07, FE-09
**예상시간:** 1.5h

#### 작업 내용
- `src/hooks/useToggleTodo.ts`: `useMutation` 기반 완료 토글, 낙관적 업데이트(Optimistic Update), 실패 시 롤백
- `src/components/todo/TodoCheckButton.tsx`: 토글 버튼, 로딩 상태 표시

#### 완료 조건
- [ ] 완료 버튼 클릭 시 즉시 UI 상태 변경 (낙관적 업데이트)
- [ ] 서버 응답 후 최종 상태 동기화
- [ ] 기한 내 완료 → COMPLETED, 기한 초과 → LATE_COMPLETED 확인
- [ ] 완료 취소 시 이전 상태 복귀
- [ ] 네트워크 오류 시 롤백 및 에러 메시지 표시

---

### FE-12: 반응형 UI 및 스타일링
**의존성:** FE-05~FE-11
**예상시간:** 3h

#### 작업 내용
- CSS/TailwindCSS 설정, 반응형 레이아웃 (320px ~ 1920px)
- 상태별 색상 정의: UPCOMING(파랑), IN_PROGRESS(노랑), COMPLETED(초록), LATE_COMPLETED(주황), FAILED(빨강)
- 공통 컴포넌트: `Button`, `Input`, `Modal`, `Spinner`
- 접근성 (aria-label, aria-live, 키보드 네비게이션)

#### 완료 조건
- [ ] 모바일(375px) 모든 페이지 정상 표시
- [ ] 태블릿(768px) 레이아웃 최적화
- [ ] 데스크탑(1024px+) 레이아웃 최적화
- [ ] 5가지 상태 색상 시각적 구분 확인
- [ ] Tab·Enter 키보드 네비게이션 가능
- [ ] 색상 대비 WCAG AA 기준 충족

---

### FE-13: 에러 처리 및 사용자 피드백
**의존성:** FE-05~FE-11
**예상시간:** 2h

#### 작업 내용
- `src/components/common/Toast.tsx`: 성공/에러/경고 토스트, 자동 닫기(3~5초)
- `src/components/ErrorBoundary.tsx`: React 에러 캐치, 폴백 UI
- API 에러 코드별 메시지 매핑 (400/401/403/404/409/500)
- Skeleton 로딩 컴포넌트

#### 완료 조건
- [ ] API 에러 발생 시 사용자 친화적 메시지 표시
- [ ] 토스트 메시지 자동 표시 및 닫힘 (3~5초)
- [ ] 에러 발생 후 페이지 정상 작동 (무한 로딩 없음)
- [ ] 로딩 중 Skeleton UI 표시

---

### FE-14: 라우팅 및 페이지 보호
**의존성:** FE-01, FE-03, FE-05~FE-10
**예상시간:** 1.5h

#### 작업 내용
- `src/routes/index.tsx`: 공개 경로 (`/login`, `/signup`), 보호 경로 (`/todos`, `/todos/:id`, `/todos/:id/edit`)
- `PrivateRoute`: 토큰 없으면 `/login` 리다이렉트
- `PublicRoute`: 로그인 상태면 `/todos` 리다이렉트
- 404 페이지

#### 완료 조건
- [ ] 비로그인 상태에서 `/todos` 접근 시 `/login` 리다이렉트
- [ ] 로그인 후 `/login` 접근 시 `/todos` 리다이렉트
- [ ] 존재하지 않는 경로 접근 시 404 페이지 표시
- [ ] 재로그인 후 이전 URL 복귀 동작

---

### FE-15: 통합 테스트 및 시나리오 검증
**의존성:** FE-01~FE-14
**예상시간:** 3h

#### 작업 내용
- Vitest + React Testing Library 설정
- MSW로 API 응답 모킹
- 컴포넌트 단위 테스트: `LoginForm`, `SignupForm`, `TodoForm`, `TodoList`
- 시나리오 테스트: SCN-01 (회원가입→로그인→할일 생성), SCN-02 (완료 처리), SCN-05 (상태 필터링)

#### 완료 조건
- [ ] 핵심 컴포넌트 단위 테스트 작성 및 통과
- [ ] SCN-01 시나리오 통합 테스트 통과
- [ ] SCN-02 시나리오 통합 테스트 통과
- [ ] SCN-05 상태 필터링 시나리오 통합 테스트 통과
- [ ] 테스트 커버리지 70% 이상
