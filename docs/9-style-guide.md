# 프론트엔드 스타일 가이드

Yahoo Finance 레퍼런스 기반 — 정보 밀도가 높고 깔끔한 데이터 중심 UI

---

## 1. 색상 시스템

### 1.1 라이트모드 (Light Mode)

#### 브랜드 색상

| 이름 | Hex | 용도 |
|---|---|---|
| `brand-primary` | `#6001D2` | 로고, 주요 액션 버튼 강조 |
| `brand-accent` | `#00857C` | 활성 탭, 링크 hover, 포커스 링 |

#### 기능 색상

| 이름 | Hex | 용도 |
|---|---|---|
| `status-positive` | `#0B8043` | 완료 (COMPLETED), 성공 상태 |
| `status-negative` | `#C62828` | 실패 (FAILED), 오류 상태 |
| `status-warning` | `#E65100` | 지연 완료 (LATE_COMPLETED) |
| `status-info` | `#1565C0` | 진행 중 (IN_PROGRESS) |
| `status-neutral` | `#546E7A` | 예정 (UPCOMING) |

#### 중립 색상

| 이름 | Hex | 용도 |
|---|---|---|
| `neutral-900` | `#1A1A1A` | 주요 텍스트, 헤딩 |
| `neutral-700` | `#404040` | 본문 텍스트 |
| `neutral-500` | `#767676` | 보조 텍스트, 레이블 |
| `neutral-300` | `#BDBDBD` | 비활성 요소, 구분선 |
| `neutral-100` | `#F5F5F5` | 배경 대비 영역, 카드 hover |
| `neutral-000` | `#FFFFFF` | 기본 배경 |

#### 서피스 색상

| 이름 | Hex | 용도 |
|---|---|---|
| `surface-dark` | `#2D2D2D` | 다크 배너, 모달 오버레이 |
| `surface-card` | `#FFFFFF` | 카드 배경 |
| `surface-page` | `#F8F8F8` | 페이지 배경 |
| `border-default` | `#E0E0E0` | 기본 테두리 |
| `border-strong` | `#BDBDBD` | 구분선, 강조 테두리 |

### 1.2 다크모드 (Dark Mode)

다크모드는 라이트모드와 일관된 위계 구조를 유지하며, 눈의 피로를 줄이고 배터리 수명을 연장합니다.

#### 브랜드 색상 (다크모드)

| 이름 | Hex | 용도 |
|---|---|---|
| `brand-primary-dark` | `#B388FF` | 로고, 주요 액션 버튼 강조 (밝은 톤) |
| `brand-accent-dark` | `#4DB6AC` | 활성 탭, 링크 hover, 포커스 링 (밝은 톤) |

#### 중립 색상 (다크모드)

| 이름 | Hex | 용도 | 라이트모드 매핑 |
|---|---|---|---|
| `neutral-dark-900` | `#E0E0E0` | 주요 텍스트, 헤딩 | `neutral-900` |
| `neutral-dark-700` | `#BDBDBD` | 본문 텍스트 | `neutral-700` |
| `neutral-dark-500` | `#9E9E9E` | 보조 텍스트, 레이블 | `neutral-500` |
| `neutral-dark-300` | `#616161` | 비활성 요소, 구분선 | `neutral-300` |
| `neutral-dark-100` | `#424242` | 배경 대비 영역, 카드 hover | `neutral-100` |
| `neutral-dark-000` | `#121212` | 기본 배경 | `neutral-000` |

#### 서피스 색상 (다크모드)

| 이름 | Hex | 용도 | 라이트모드 매핑 |
|---|---|---|---|
| `surface-card-dark` | `#1E1E1E` | 카드 배경 | `surface-card` |
| `surface-page-dark` | `#121212` | 페이지 배경 | `surface-page` |
| `border-default-dark` | `#424242` | 기본 테두리 | `border-default` |
| `border-strong-dark` | `#616161` | 구분선, 강조 테두리 | `border-strong` |

#### 기능 색상 (다크모드)

| 상태 | 배경 | 텍스트 | 라이트모드 매핑 |
|---|---|---|---|
| UPCOMING | `#1A237E` | `#90CAF9` | `#E3F2FD` / `#1565C0` |
| IN_PROGRESS | `#1B5E20` | `#A5D6A7` | `#E8F5E9` / `#1B5E20` |
| COMPLETED | `#1B5E20` | `#A5D6A7` | `#E8F5E9` / `#0B8043` |
| LATE_COMPLETED | `#E65100` | `#FFCC80` | `#FFF3E0` / `#E65100` |
| FAILED | `#B71C1C` | `#EF9A9A` | `#FFEBEE` / `#C62828` |

### 1.3 CSS 변수 기반 테마 구현

```css
/* 라이트모드 (기본) */
:root {
  --brand-primary: #6001D2;
  --brand-accent: #00857C;
  --neutral-900: #1A1A1A;
  --neutral-700: #404040;
  --neutral-500: #767676;
  --neutral-300: #BDBDBD;
  --neutral-100: #F5F5F5;
  --neutral-000: #FFFFFF;
  --surface-card: #FFFFFF;
  --surface-page: #F8F8F8;
  --border-default: #E0E0E0;
  --border-strong: #BDBDBD;
}

/* 다크모드 */
[data-theme="dark"] {
  --brand-primary: #B388FF;
  --brand-accent: #4DB6AC;
  --neutral-900: #E0E0E0;
  --neutral-700: #BDBDBD;
  --neutral-500: #9E9E9E;
  --neutral-300: #616161;
  --neutral-100: #424242;
  --neutral-000: #121212;
  --surface-card: #1E1E1E;
  --surface-page: #121212;
  --border-default: #424242;
  --border-strong: #616161;
}
```

### 1.4 테마 토글 버튼

```
┌─────────────────────────────────────────────┐
│  [🌙] / [☀️]  토글 버튼                     │
├─────────────────────────────────────────────┤
│  • 위치: 헤더 우측, 사용자 메뉴 왼쪽       │
│  • 크기: 32px × 32px (터치 타깃 44px)      │
│  • 아이콘: 🌙 (다크모드), ☀️ (라이트모드)   │
│  • hover: 배경 `neutral-100` (각 테마)     │
│  • 접근성: aria-label="다크모드 토글"      │
└─────────────────────────────────────────────┘
```

---

## 2. 타이포그래피

### 폰트 패밀리

```css
/* 기본 폰트 (한국어/영어) */
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 일본어 폰트 */
--font-sans-ja: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif;

/* 모노스페이스 (날짜, 수치 데이터) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* 날짜, 수치 데이터 */
```

### 타입 스케일

| 토큰 | 크기 | 굵기 | Line-height | 용도 |
|---|---|---|---|---|
| `text-xs` | 11px | 400 | 1.4 | 타임스탬프, 뱃지 레이블 |
| `text-sm` | 13px | 400 | 1.5 | 보조 텍스트, 입력 힌트 |
| `text-base` | 15px | 400 | 1.6 | 본문, 카드 내용 |
| `text-md` | 17px | 500 | 1.5 | 카드 제목 |
| `text-lg` | 20px | 600 | 1.4 | 섹션 헤딩 |
| `text-xl` | 24px | 700 | 1.3 | 페이지 타이틀 |
| `text-2xl` | 30px | 700 | 1.2 | 히어로 타이틀 |

### 다국어 타이포그래피

#### 언어별 폰트 적용

```css
/* 한국어 (기본) */
:root {
  --font-primary: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 일본어 */
html[lang="ja"] {
  --font-primary: 'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif;
}

/* 영어 */
html[lang="en"] {
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

#### 언어별 텍스트 특성

| 언어 | 폰트 | 크기 조정 | 자간 (Letter-spacing) | 줄 높이 (Line-height) |
|---|---|---|---|---|
| **한국어** | Pretendard | 100% (기준) | 0 | 1.6 (본문) |
| **영어** | System UI | 100% (기준) | 0 | 1.6 (본문) |
| **일본어** | Noto Sans JP | 100% (기준) | 0.05em | 1.7 (본문) |

#### 다국어 텍스트 길이 고려사항

```
┌─────────────────────────────────────────────────────────────┐
│  버튼/레이블 텍스트 길이 비교 (기준: 영어)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  "Submit"                                                    │
│  ████████████████ 100% (기준)                               │
│                                                              │
│  "제출"                                                      │
│  ████████ 60-70% (영어 대비 짧음)                           │
│                                                              │
│  "送信" (일본어)                                             │
│  ████████████ 90-100% (영어비슷)                             │
│                                                              │
│  "Cancel"                                                    │
│  ██████████████ 100% (기준)                                 │
│                                                              │
│  "취소"                                                      │
│  ███████ 50-60% (영어 대비 짧음)                            │
│                                                              │
│  "キャンセル" (일본어)                                        │
│  ██████████████████ 130-140% (영어 대비 김)                 │
│                                                              │
│  "Save Changes"                                              │
│  ████████████████████ 100% (기준)                           │
│                                                              │
│  "변경사항 저장"                                             │
│  ██████████████ 70-80% (영어 대비 짧음)                     │
│                                                              │
│  "変更内容を保存" (일본어)                                    │
│  ██████████████████████ 110-120% (영어보다 약간 김)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 디자인 원칙

1. **최대 길이 기준:** 일본어 텍스트 기준으로 버튼/레이블 너비 설계
   - 예: 버튼 최소 너비 `120px`, 패딩 `16px 24px`
   
2. **텍스트 오버플로우 처리:**
   ```css
   .button-text {
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
   }
   ```

3. **반응형 폰트 크기:**
   ```css
   /* 일본어일 경우 약간 큰 폰트 크기 적용 */
   html[lang="ja"] .body-text {
     font-size: 15.5px; /* 기본 15px 대비 3% 증가 */
   }
   ```

4. **가독성 최적화:**
   - 일본어: 한자 (Kanji) 와 히라가나/가타카나 혼합 시 가독성 확보
   - 한국어: Pretendard 의 한글 글꼴 최적화 활용
   - 영어: 시스템 폰트로 자연스러운 렌더링

### 사용 규칙

- 수치 데이터 (날짜, 카운트) 는 `font-mono` + tabular numbers(`font-variant-numeric: tabular-nums`)
- 헤딩은 letter-spacing `-0.02em`
- 본문 최대 가독 너비: `65ch`
- **다국어:** `html[lang]` 속성으로 언어별 폰트 자동 적용

---

## 3. 간격 시스템

8px 베이스 그리드 기반.

| 토큰 | 값 | 용도 |
|---|---|---|
| `space-1` | 4px | 아이콘 - 텍스트 간격 |
| `space-2` | 8px | 인라인 요소 간격 |
| `space-3` | 12px | 소형 컴포넌트 패딩 |
| `space-4` | 16px | 카드 내부 패딩, 기본 gap |
| `space-5` | 20px | 섹션 내 요소 간격 |
| `space-6` | 24px | 카드 외부 여백 |
| `space-8` | 32px | 섹션 간 여백 |
| `space-12` | 48px | 페이지 상단 여백 |

---

## 4. 레이아웃

### 페이지 구조

```
┌─────────────────────────────────────────────┐
│  Global Header (fixed, 56px)                │
├─────────────────────────────────────────────┤
│  Sub Navigation (48px, 탭/필터 바)           │
├─────────────────────────────────────────────┤
│  Content Area (max-width: 1200px, centered) │
│  ┌─────────────────────┬───────────────────┐│
│  │  Main (flex: 1)     │  Sidebar (280px)  ││
│  └─────────────────────┴───────────────────┘│
└─────────────────────────────────────────────┘
```

### 그리드

- 메인 컨텐츠: 12 컬럼 그리드, gap `24px`
- 카드 목록: `repeat(auto-fill, minmax(300px, 1fr))`
- 사이드바: 고정 너비 `280px`, 메인 영역과 gap `24px`

### 반응형 브레이크포인트

| 이름 | 범위 | 변경사항 |
|---|---|---|
| `mobile` | ~767px | 단일 컬럼, 사이드바 숨김 |
| `tablet` | 768~1023px | 2 컬럼, 사이드바 드로어 |
| `desktop` | 1024px~ | 풀 레이아웃 |

---

## 5. 컴포넌트

### 5.1 헤더

- 배경: `neutral-000`, 하단 border `1px solid border-default`
- 높이: `56px`
- 로고: `brand-primary` 색상, 볼드
- 내비게이션 링크: `text-base`, 기본 `neutral-700`, 활성 `brand-accent` + 하단 `2px solid brand-accent`
- 검색바: 라운드 `9999px`, border `1px solid neutral-300`, 포커스 시 `brand-accent` 아웃라인
- **다크모드 토글:** 헤더 우측, 사용자 메뉴 왼쪽 위치

#### 다크모드 헤더

- 배경: `neutral-dark-000` (#121212), 하단 border `1px solid border-default-dark`
- 로고: `brand-primary-dark` 색상
- 내비게이션 링크: 기본 `neutral-dark-700`, 활성 `brand-accent-dark`

### 5.2 상태 뱃지 (Todo Status)

둥근 pill 형태, 내부 패딩 `4px 10px`, `text-xs`, 굵기 `600`.

| 상태 | 배경 (라이트) | 텍스트 (라이트) | 배경 (다크) | 텍스트 (다크) |
|---|---|---|---|---|
| UPCOMING | `#E3F2FD` | `#1565C0` | `#1A237E` | `#90CAF9` |
| IN_PROGRESS | `#E8F5E9` | `#1B5E20` | `#1B5E20` | `#A5D6A7` |
| COMPLETED | `#E8F5E9` | `#0B8043` | `#1B5E20` | `#A5D6A7` |
| LATE_COMPLETED | `#FFF3E0` | `#E65100` | `#E65100` | `#FFCC80` |
| FAILED | `#FFEBEE` | `#C62828` | `#B71C1C` | `#EF9A9A` |

### 5.3 Todo 카드

```
┌────────────────────────────────────────────┐
│  [상태 뱃지]                   [메뉴 아이콘] │
│  제목 (text-md, neutral-900)               │
│  설명 (text-sm, neutral-500, 2 줄 클램프)   │
│  ─────────────────────────────────────── │
│  📅 2026-04-01 ~ 2026-04-07   [완료 토글] │
└────────────────────────────────────────────┘
```

- 배경: `surface-card`, 테두리 `1px solid border-default`, radius `8px`
- 패딩: `space-4` (`16px`)
- hover: 배경 `neutral-100`, shadow `0 2px 8px rgba(0,0,0,0.08)`
- 날짜: `font-mono`, `text-xs`, `neutral-500`

#### 다크모드 Todo 카드

- 배경: `surface-card-dark` (#1E1E1E), 테두리 `1px solid border-default-dark`
- hover: 배경 `neutral-dark-100` (#424242), shadow `0 2px 8px rgba(0,0,0,0.32)`
- 제목: `neutral-dark-900`, 설명: `neutral-dark-500`

### 5.4 버튼

| 종류 | 배경 (라이트) | 텍스트 (라이트) | 배경 (다크) | 텍스트 (다크) |
|---|---|---|---|---|
| Primary | `brand-accent` | `#FFFFFF` | `brand-accent-dark` | `#FFFFFF` |
| Secondary | `neutral-000` | `neutral-700` | `neutral-dark-000` | `neutral-dark-700` |
| Danger | `#FFEBEE` | `status-negative` | `#3E2723` | `#EF9A9A` |
| Ghost | transparent | `neutral-700` | transparent | `neutral-dark-700` |

- 높이: 기본 `36px`, 대형 `44px`
- radius: `6px`
- 패딩: `8px 16px`
- 비활성: opacity `0.4`, cursor `not-allowed`

### 5.5 입력 필드

- 높이: `40px`
- radius: `6px`
- border: `1px solid neutral-300`
- 포커스: `border-color: brand-accent`, `box-shadow: 0 0 0 3px rgba(0,133,124,0.15)`
- 에러: `border-color: status-negative`, 하단 에러 메시지 `text-xs status-negative`
- placeholder: `neutral-300`

#### 다크모드 입력 필드

- border: `1px solid neutral-dark-300`
- 배경: `neutral-dark-000`
- 포커스: `border-color: brand-accent-dark`, `box-shadow: 0 0 0 3px rgba(77,182,172,0.25)`
- 텍스트: `neutral-dark-900`

### 5.6 페이지네이션

Yahoo Finance 목록 하단 스타일 기반.

- 컨테이너: `display: flex`, `gap: 4px`, `align-items: center`
- 페이지 버튼: `32px × 32px`, radius `4px`, 현재 페이지 `brand-accent` 배경 + 흰 텍스트
- 이전/다음: 화살표 아이콘 버튼, ghost 스타일

### 5.7 빈 상태 (Empty State)

- 아이콘: 64px, `neutral-300`
- 제목: `text-md`, `neutral-500`
- 설명: `text-sm`, `neutral-300`
- 액션 버튼 (선택): Primary 버튼

### 5.8 토스트 / 알림

- 위치: 우측 상단, `top: 72px`
- 너비: `320px`, radius `8px`
- 성공: 좌측 `4px solid status-positive`
- 에러: 좌측 `4px solid status-negative`
- 자동 사라짐: 3 초

---

## 6. 아이콘

- 라이브러리: [Lucide React](https://lucide.dev)
- 기본 크기: `16px` (인라인), `20px` (버튼 내), `24px` (독립 액션)
- 색상: 텍스트 색상 상속 (`currentColor`)

---

## 7. 모션

```css
--transition-fast:  100ms ease;   /* hover, focus */
--transition-base:  200ms ease;   /* 상태 변화, 뱃지 */
--transition-slow:  300ms ease;   /* 모달, 드로어 */
```

- 레이아웃 변화: `transition: all var(--transition-base)`
- 카드 hover: `transform: translateY(-1px)` + shadow 변화
- 페이지 전환: fade `opacity 0→1`, 200ms
- **테마 전환:** fade `opacity 0.5→1`, 150ms (부드러운 테마 전환)

---

## 8. 접근성

- 최소 색상 대비: 일반 텍스트 `4.5:1`, 대형 텍스트 `3:1` (WCAG AA)
- 포커스 링: `outline: 2px solid brand-accent`, `outline-offset: 2px`
- 터치 타깃 최소 크기: `44px × 44px`
- 스크린 리더용 숨김 클래스: `.sr-only`
- **다크모드 접근성:** 모든 다크모드 색상도 WCAG AA 색상 대비 기준 충족
