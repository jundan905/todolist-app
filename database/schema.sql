-- =============================================================================
-- todolist-app Database Schema
-- =============================================================================
-- 프로젝트  : todolist-app
-- 작성일    : 2026-04-01
-- 버전      : 1.0.0
-- 작성자    : Dan Jung
-- 참조      : docs/6-erd.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. 초기화 (재실행 시 기존 테이블 제거)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

-- -----------------------------------------------------------------------------
-- 1. users 테이블
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL,
  password    VARCHAR(255) NOT NULL,   -- bcrypt 암호화 저장 (cost factor 12+)
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE  users             IS '서비스 사용자';
COMMENT ON COLUMN users.id          IS '사용자 고유 식별자 (UUID)';
COMMENT ON COLUMN users.email       IS '로그인 이메일 (고유값)';
COMMENT ON COLUMN users.password    IS 'bcrypt 암호화된 비밀번호 (cost factor 12 이상)';
COMMENT ON COLUMN users.name        IS '사용자 표시 이름 (최대 100자)';
COMMENT ON COLUMN users.created_at  IS '가입일시';

-- -----------------------------------------------------------------------------
-- 2. todos 테이블
-- -----------------------------------------------------------------------------
CREATE TABLE todos (
  id           UUID        NOT NULL DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,                  -- NULL 허용 (선택 입력)
  start_date   DATE        NOT NULL,
  due_date     DATE        NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  completed_at TIMESTAMP,             -- NULL 허용 (완료 시 서버 시각 자동 기록)
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_todos              PRIMARY KEY (id),
  CONSTRAINT fk_todos_user_id      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_todos_date_order  CHECK (due_date >= start_date)
);

COMMENT ON TABLE  todos              IS '사용자별 할일';
COMMENT ON COLUMN todos.id           IS '할일 고유 식별자 (UUID)';
COMMENT ON COLUMN todos.user_id      IS '소유 사용자 (users.id 참조)';
COMMENT ON COLUMN todos.title        IS '할일 제목 (최대 200자)';
COMMENT ON COLUMN todos.description  IS '할일 상세 내용 (최대 2000자, 선택)';
COMMENT ON COLUMN todos.start_date   IS '할일 시작일';
COMMENT ON COLUMN todos.due_date     IS '할일 종료일 (start_date 이상이어야 함)';
COMMENT ON COLUMN todos.is_completed IS '완료 여부 (기본값: false)';
COMMENT ON COLUMN todos.completed_at IS '완료 처리 일시 (is_completed=true 시 서버 시각 자동 기록)';
COMMENT ON COLUMN todos.created_at   IS '생성일시';
COMMENT ON COLUMN todos.updated_at   IS '수정일시 (변경 시 애플리케이션에서 갱신)';

-- -----------------------------------------------------------------------------
-- 3. 인덱스
-- -----------------------------------------------------------------------------

-- 사용자별 할일 조회 (UC-05 목록 조회 기본 조건)
CREATE INDEX idx_todos_user_id    ON todos(user_id);

-- 종료일 정렬/필터 (BR-07, FAILED·CLOSED 상태 필터)
CREATE INDEX idx_todos_due_date   ON todos(due_date);

-- 시작일 정렬/필터 (BR-07, UPCOMING 상태 필터)
CREATE INDEX idx_todos_start_date ON todos(start_date);

-- 생성일 기본 정렬 (BR-07 기본 정렬: created_at DESC)
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

-- 복합 인덱스: 사용자별 완료 여부 조회 (UC-05 상태 필터 최적화)
CREATE INDEX idx_todos_user_completed ON todos(user_id, is_completed);
