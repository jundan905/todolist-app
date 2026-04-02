import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

export const handlers = [
  http.post(`${BASE}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'Password1!') {
      return HttpResponse.json({
        accessToken: 'mock-token',
        expiresIn: 3600,
        user: { id: 'user-1', email: 'test@example.com', name: '테스트 유저', createdAt: '2026-04-01T00:00:00.000Z' },
      });
    }
    return HttpResponse.json(
      { error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } },
      { status: 401 }
    );
  }),

  http.post(`${BASE}/api/auth/signup`, async ({ request }) => {
    const body = await request.json() as { email: string; name: string };
    return HttpResponse.json(
      { id: 'user-1', email: body.email, name: body.name, createdAt: '2026-04-01T00:00:00.000Z', message: '회원가입 성공' },
      { status: 201 }
    );
  }),

  http.get(`${BASE}/api/todos`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'todo-1',
          userId: 'user-1',
          title: '테스트 할일',
          description: '설명',
          startDate: '2026-04-01',
          dueDate: '2026-04-07',
          isCompleted: false,
          completedAt: null,
          status: 'IN_PROGRESS',
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-01T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    });
  }),

  http.post(`${BASE}/api/todos`, async ({ request }) => {
    const body = await request.json() as { title: string; description?: string; startDate: string; dueDate: string };
    return HttpResponse.json(
      {
        id: 'todo-2',
        userId: 'user-1',
        title: body.title,
        description: body.description ?? null,
        startDate: body.startDate,
        dueDate: body.dueDate,
        isCompleted: false,
        completedAt: null,
        status: 'IN_PROGRESS',
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
      { status: 201 }
    );
  }),
];
