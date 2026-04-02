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

> 의존 방향은 왼쪽 → 오른쪽 단방향. Repository 는 Service 를 모르고, Service 는 Controller 를 모른다.

---

## 3. 프론트엔드 레이어 구조

```mermaid
graph LR
    Pages --> FeatureComponents["Feature\nComponents"]
    FeatureComponents --> UIComponents["UI\nComponents"]
    FeatureComponents --> QueryHooks["Query Hooks\n(TanStack Query)"]
    FeatureComponents --> Store["Store\n(Zustand)"]
    QueryHooks --> APIClient["API Client\n(axios)"]
    Store --> ThemeStore["Theme Store\n(localStorage)"]
```

> - **Pages**: 라우트 단위 최상위 컴포넌트
> - **Feature Components**: Todo 도메인 기능 단위 컴포넌트
> - **UI Components**: props 만으로 동작하는 순수 표현 컴포넌트
> - **Query Hooks**: 서버 상태 관리 (할일 목록, 상세 등)
> - **Store**: 클라이언트 상태만 관리 (인증 토큰, UI 상태, **테마**)
> - **API Client**: axios 인스턴스, JWT 자동 첨부
> - **Theme Store**: Zustand 기반 테마 관리, localStorage 연동

---

## 3.1 테마 관리 아키텍처

### Zustand Theme Store 구조

```typescript
interface ThemeStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

// Store 생성
const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light', // 초기값 (시스템 설정 확인 전)

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  initializeTheme: () => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      get().setTheme(saved);
    } else {
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      get().setTheme(system);
    }
  }
}));
```

### 테마 초기화 플로우

```mermaid
sequenceDiagram
    participant App as App Mount
    participant Store as Theme Store
    participant LS as localStorage
    participant System as OS 설정
    participant DOM as DOM

    App->>Store: initializeTheme()
    Store->>LS: theme 값 조회
    alt 저장된 값 존재
        LS-->>Store: 'light' 또는 'dark'
        Store->>DOM: data-theme 속성 설정
    else 저장된 값 없음
        Store->>System: prefers-color-scheme 확인
        System-->>Store: dark 또는 light
        Store->>DOM: data-theme 속성 설정
    end
```

### 테마 토글 동작

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Toggle as 토글 버튼
    participant Store as Theme Store
    participant LS as localStorage
    participant DOM as DOM

    User->>Toggle: 클릭
    Toggle->>Store: toggleTheme()
    Store->>Store: 현재 테마 확인
    Store->>Store: 반대 테마로 변경
    Store->>LS: 새 테마 저장
    Store->>DOM: data-theme 속성 업데이트
    Note over DOM: CSS 변수 자동 적용
```

### localStorage 스키마

| 키 | 값 | 설명 |
|---|---|---|
| `theme` | `"light"` \| `"dark"` | 사용자 테마 선호도 |

### 시스템 연동 동작

| 상황 | 동작 |
|---|---|
| **첫 방문** | 시스템 설정 감지하여 적용 |
| **수동 토글 후** | localStorage 에 저장된 값 우선 사용 |
| **시스템 설정 변경** | 수동 토글 이력 있으면 무시, 없으면 반영 |

---

## 3.2 다국어 지원 아키텍처 (i18next)

### i18next 설정 구조

```typescript
// frontend/src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationKO from '../locales/ko/common.json';
import translationEN from '../locales/en/common.json';
import translationJA from '../locales/ja/common.json';

const resources = {
  ko: { translation: translationKO },
  en: { translation: translationEN },
  ja: { translation: translationJA },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // 번역 누락 시 영어로 폴백
    supportedLngs: ['ko', 'en', 'ja'],
    interpolation: {
      escapeValue: false, // React 는 기본적으로 XSS 방지
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### 언어 리소스 디렉토리 구조

```
frontend/src/locales/
├── ko/
│   ├── common.json      # 공통 UI (버튼, 메뉴, 메시지)
│   ├── auth.json        # 인증 관련 (로그인, 회원가입)
│   ├── todo.json        # 할일 관련 (상태, 액션)
│   └── validation.json  # 검증 메시지
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── todo.json
│   └── validation.json
└── ja/
    ├── common.json
    ├── auth.json
    ├── todo.json
    └── validation.json
```

### 번역 키 네이밍 컨벤션

```
{섹션}.{요소}.{상태/변수}

예시:
- common.buttons.submit      → "제출" / "Submit" / "送信"
- auth.login.title           → "로그인" / "Login" / "ログイン"
- todo.status.completed      → "완료" / "Completed" / "完了"
- validation.required        → "필수 항목입니다" / "Required" / "必須です"
```

### 언어 선택 컴포넌트 구조

```typescript
// frontend/src/components/common/LanguageSelector.tsx
interface LanguageOption {
  code: string;
  label: string;
  flag?: string;
}

const languages: LanguageOption[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Language selection"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
```

### 언어 초기화 플로우

```mermaid
sequenceDiagram
    participant App as App Mount
    participant i18n as i18next
    participant LS as localStorage
    participant Nav as 브라우저
    participant DOM as DOM

    App->>i18n: init()
    i18n->>LS: language 값 조회
    alt 저장된 값 존재
        LS-->>i18n: 'ko' 또는 'en' 또는 'ja'
        i18n->>DOM: 언어 적용
    else 저장된 값 없음
        i18n->>Nav: navigator.language 확인
        Nav-->>i18n: 'ko-KR' 또는 'en-US' 등
        i18n->>i18n: 언어 코드 정규화 (ko-KR → ko)
        i18n->>DOM: 언어 적용
    else 지원하지 않는 언어
        i18n->>DOM: fallbackLng 'en' 적용
    end
```

### 언어 변경 동작

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Selector as 언어 선택기
    participant i18n as i18next
    participant LS as localStorage
    participant React as React 컴포넌트

    User->>Selector: 언어 선택 (예: "en")
    Selector->>i18n: changeLanguage('en')
    i18n->>LS: 'en' 저장
    i18n->>React: 언어 변경 이벤트 발생
    React->>React: 모든 번역 키 리렌더링
    Note over React: useTranslation() 훅 구독 중
```

### localStorage 스키마

| 키 | 값 | 설명 |
|---|---|---|
| `language` | `"ko"` \| `"en"` \| `"ja"` | 사용자 언어 선호도 |
| `theme` | `"light"` \| `"dark"` | 사용자 테마 선호도 |

### 번역 리소스 예시

```json
// frontend/src/locales/ko/common.json
{
  "buttons": {
    "submit": "제출",
    "cancel": "취소",
    "save": "저장",
    "delete": "삭제",
    "edit": "수정",
    "view": "보기",
    "close": "닫기"
  },
  "menu": {
    "logout": "로그아웃",
    "profile": "프로필",
    "settings": "설정"
  },
  "messages": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "success": "성공했습니다",
    "noData": "데이터가 없습니다"
  }
}
```

```json
// frontend/src/locales/en/common.json
{
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "close": "Close"
  },
  "menu": {
    "logout": "Logout",
    "profile": "Profile",
    "settings": "Settings"
  },
  "messages": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success",
    "noData": "No data available"
  }
}
```

### 날짜/시간 로컬라이제이션

```typescript
// frontend/src/utils/dateLocalization.ts
export function formatDateLocalized(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
}

// 사용 예시
formatDateLocalized('2026-04-01', 'ko'); 
// → "2026 년 4 월 1 일"

formatDateLocalized('2026-04-01', 'en'); 
// → "April 1, 2026"

formatDateLocalized('2026-04-01', 'ja'); 
// → "2026 年 4 月 1 日"
```

### 텍스트 길이 고려사항

| 언어 | 텍스트 길이 특성 | 디자인 대응 |
|---|---|---|
| **한국어 (ko)** | 영어 대비 20-30% 짧음 | 기본 디자인 |
| **영어 (en)** | 기준 길이 | 기본 디자인 |
| **일본어 (ja)** | 영어와 비슷하거나 약간 김 | 버튼/레이블 20% 여유 공간 확보 |

**디자인 원칙:**
- 모든 버튼과 레이블은 가장 긴 언어 (일본어) 기준으로 디자인
- 텍스트 오버플로우 발생 시 말줄임표 (`...`) 처리
- 툴팁으로 전체 텍스트 표시

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
    FE->>FE: Zustand 에 토큰 저장

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
