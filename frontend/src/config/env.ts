export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  appTitle: (import.meta.env.VITE_APP_TITLE as string) || 'todolist-app',
};
