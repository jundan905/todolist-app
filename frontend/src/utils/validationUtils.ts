export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

export function isValidPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const d = new Date(date + 'T00:00:00');
  return !isNaN(d.getTime());
}

export function isDueDateValid(startDate: string, dueDate: string): boolean {
  const start = new Date(startDate + 'T00:00:00');
  const due = new Date(dueDate + 'T00:00:00');
  return due >= start;
}

export function isValidLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}
