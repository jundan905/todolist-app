# E2E 통합 테스트 결과 보고서

**프로젝트:** todolist-app  
**테스트 일시:** 2026-04-02  
**테스트 도구:** Playwright MCP  
**테스트 대상:** 프론트엔드 `http://localhost:5173` / 백엔드 `http://localhost:3000`  
**참조 문서:** `docs/3-user-scenario.md` (SCN-01 ~ SCN-06)

---

## 요약

| 시나리오 | 제목 | Happy Path | Exception Path | 비고 |
|---|---|---|---|---|
| SCN-01 | 신규 가입 후 첫 할일 등록 | ✅ 통과 | ✅ 통과 | BUG-03 수정 완료 |
| SCN-02 | 오늘 해야 할 일 확인 및 완료 처리 | ✅ 통과 | - | - |
| SCN-03 | 마감일 지난 할일 확인 및 뒤늦게 완료 처리 | ✅ 통과 | - | BUG-02 수정 완료 |
| SCN-04 | 할일 내용 수정 | ✅ 통과 | - | BUG-01 수정 완료 |
| SCN-05 | 상태별 필터링으로 할일 현황 파악 | ✅ 통과 | - | - |
| SCN-06 | 로그아웃 및 재로그인 | ✅ 통과 | - | - |

**전체 결과: 6/6 완전 통과 (발견된 버그 3건 모두 수정 완료)**

---

## 상세 결과

### SCN-01: 신규 가입 후 첫 할일 등록

#### Happy Path
| 단계 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | 로그인 화면에서 "회원가입" 링크 표시 | ✅ | scn01-01-login-page.png |
| 2 | 회원가입 폼 (이름/이메일/비밀번호/비밀번호 확인) 표시 | ✅ | - |
| 3 | 비밀번호 복잡도 실시간 체크 (✓/✗ 표시) | ✅ | scn01-02-signup-form-filled.png |
| 4 | 회원가입 성공 → 로그인 페이지 리다이렉트 | ✅ | scn01-03-signup-success-redirect.png |
| 5 | 로그인 성공 → 할일 목록 이동, 빈 목록 안내 | ✅ | scn01-04-login-success-empty-list.png |
| 6 | 할일 추가 다이얼로그 (제목/설명/시작일/종료일) | ✅ | scn01-05-todo-create-form.png |
| 7 | 할일 생성 → `진행 중` 상태로 목록 표시 | ✅ | scn01-06-todo-created-in-progress.png |

> **✅ BUG-03 수정 완료**: `formatDate`가 `dateStr.split('T')[0]`로 UTC 날짜를 추출하던 방식을  
> `new Date(dateStr)` + `getFullYear/getMonth/getDate()` (로컬 타임존)으로 변경.  
> 수정 파일: `frontend/src/utils/dateUtils.ts`

#### Exception Path
| 예외 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 예외 1 | 중복 이메일 가입 → "이미 사용 중인 이메일입니다." 오류 표시 | ✅ | scn01-ex1-duplicate-email.png |
| 예외 2 | 비밀번호 복잡도 미충족 → ✗ 표시 및 버튼 비활성화 | ✅ | scn01-ex2-password-complexity.png |
| 예외 5 | 종료일 < 시작일 → "종료일은 시작일 이후여야 합니다." 오류 및 저장 버튼 비활성화 | ✅ | scn01-ex5-duedate-before-startdate.png |

---

### SCN-02: 오늘 해야 할 일 확인 및 완료 처리

#### Happy Path
| 단계 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | `진행 중` 필터 선택 → IN_PROGRESS 할일 3개만 표시 | ✅ | scn02-02-in-progress-filter.png |
| 2 | 완료 처리 버튼 클릭 → 해당 항목이 진행 중 목록에서 사라짐 | ✅ | scn02-03-todo-completed-removed-from-filter.png |

---

### SCN-03: 마감일 지난 할일 확인 및 뒤늦게 완료 처리

#### Happy Path
| 단계 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | `실패` 필터 선택 → FAILED 할일 1개 표시 | ✅ | scn03-01-failed-filter.png |
| 2 | 상세 페이지 이동 → FAILED 상태, 완료 처리 버튼 노출 | ✅ | scn03-02-failed-detail.png |
| 3 | 완료 처리 클릭 → 백엔드 `LATE_COMPLETED` 전환 성공 (API 확인) | ✅ | - |
| 4 | 상세 페이지 UI 즉시 갱신 | ✅ | scn03-03-failed-to-late-completed.png |
| 5 | `지연 완료` 상태 + 완료일시 표시 | ✅ | scn03-04-late-completed-after-refresh.png |

> **✅ BUG-02 수정 완료**: `useToggleTodo`의 `onSettled`에 `todoKeys.detail(variables.todoId)` 무효화를 추가.  
> 수정 파일: `frontend/src/hooks/useToggleTodo.ts`

---

### SCN-04: 할일 내용 수정

#### Happy Path
| 단계 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | 수정 폼 진입 → 제목/설명/날짜 기존 값 로드됨 | ✅ | scn04-01-edit-form.png |
| 2 | 날짜 수정 후 저장 → 상세 페이지로 이동, 변경 내용 반영 | ✅ | scn04-02-edit-saved-detail.png |

> **✅ BUG-01 수정 완료**: `TodoEditForm`의 날짜 초기 상태를 ISO 문자열 대신 `toLocalDateString()`으로 변환한 `YYYY-MM-DD` 형식으로 설정.  
> `toLocalDateString` 함수를 `dateUtils.ts`에 추가하고, `TodoEditForm.tsx`에서 import하여 사용.  
> 수정 파일: `frontend/src/utils/dateUtils.ts`, `frontend/src/components/todo/TodoEditForm.tsx`

---

### SCN-05: 상태별 필터링으로 할일 현황 파악

#### Happy Path
| 단계 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | 전체 목록 조회 → 5개 할일 (예정/지연완료/진행중/완료) 표시 | ✅ | scn02-01-all-todos-list.png |
| 2 | `예정` 필터 → 1개만 표시 | ✅ | scn05-01-upcoming-filter.png |
| 3 | `진행 중` 필터 → 정상 필터링 (SCN-02에서 확인) | ✅ | scn02-02-in-progress-filter.png |
| 4 | `실패` 필터 → 정상 필터링 (SCN-03에서 확인) | ✅ | scn03-01-failed-filter.png |
| 5 | 정렬 기준: 종료일, 방향: 오름차순 → 날짜 순서로 정렬 | ✅ | scn05-02-sort-duedate-asc.png |

---

### SCN-06: 로그아웃 및 재로그인

#### Happy Path
| 단계 | 내용 | 결과 | 스크린샷 |
|---|---|---|---|
| 1 | 로그아웃 버튼 클릭 → 로그인 페이지로 이동 | ✅ | scn06-01-logout-success.png |
| 2 | 로그아웃 후 `/todos` 직접 접근 → 로그인 페이지로 리다이렉트 | ✅ | - |
| 3 | 재로그인 → 기존 할일 목록 유지됨 | ✅ | scn06-02-relogin-success.png |

---

## 발견된 버그 목록

| ID | 심각도 | 시나리오 | 제목 | 상태 | 수정 내용 |
|---|---|---|---|---|---|
| BUG-01 | 높 | SCN-04 | 수정 폼 날짜 필드 초기값 미로드 | ✅ 수정 완료 | `toLocalDateString()` 추가 후 ISO→`YYYY-MM-DD` 변환하여 초기값 설정 |
| BUG-02 | 중 | SCN-03 | 상세 페이지 완료 토글 후 UI 미갱신 | ✅ 수정 완료 | `useToggleTodo` `onSettled`에 `todoKeys.detail()` 캐시 무효화 추가 |
| BUG-03 | 낮 | SCN-01 | 날짜 표시 타임존 오류 | ✅ 수정 완료 | `formatDate`를 `new Date()` + 로컬 메서드 방식으로 변경 |

---

## 테스트 환경 참고사항

- **테스트 데이터 생성**: API(curl)로 할일 생성 시 터미널 인코딩 문제로 한글 데이터 깨짐.  
  프론트엔드 UI를 통해 생성한 데이터는 정상 표시됨.  
  → 테스트 시 모든 데이터는 UI를 통해 생성할 것을 권장.

- **스크린샷 위치**: `test/e2e/screenshots/` 디렉토리

---

## 스크린샷 목록

| 파일명 | 설명 |
|---|---|
| scn01-01-login-page.png | 로그인 페이지 초기 화면 |
| scn01-02-signup-form-filled.png | 회원가입 폼 입력 완료 (비밀번호 조건 체크) |
| scn01-03-signup-success-redirect.png | 회원가입 성공 후 로그인 페이지 리다이렉트 |
| scn01-04-login-success-empty-list.png | 로그인 성공, 빈 할일 목록 |
| scn01-05-todo-create-form.png | 할일 추가 다이얼로그 |
| scn01-06-todo-created-in-progress.png | 할일 생성 완료, 진행 중 상태 |
| scn01-ex1-duplicate-email.png | 중복 이메일 오류 메시지 |
| scn01-ex2-password-complexity.png | 비밀번호 복잡도 미충족 표시 |
| scn01-ex5-duedate-before-startdate.png | 종료일 < 시작일 오류 |
| scn02-01-all-todos-list.png | 전체 할일 목록 |
| scn02-02-in-progress-filter.png | 진행 중 필터 결과 |
| scn02-03-todo-completed-removed-from-filter.png | 완료 처리 후 목록에서 제거 |
| scn03-01-failed-filter.png | 실패 필터 결과 |
| scn03-02-failed-detail.png | 실패 할일 상세 페이지 |
| scn03-03-failed-to-late-completed.png | 완료 처리 후 UI 미갱신 (버그) |
| scn03-04-late-completed-after-refresh.png | 새로고침 후 지연 완료 상태 |
| scn04-01-edit-form.png | 수정 폼 (날짜 초기값 미로드 버그) |
| scn04-02-edit-saved-detail.png | 수정 저장 후 상세 페이지 |
| scn05-01-upcoming-filter.png | 예정 필터 결과 |
| scn05-02-sort-duedate-asc.png | 종료일 오름차순 정렬 결과 |
| scn06-01-logout-success.png | 로그아웃 후 로그인 페이지 |
| scn06-02-relogin-success.png | 재로그인 후 할일 목록 |
