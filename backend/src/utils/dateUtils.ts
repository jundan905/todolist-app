export const getCurrentDate = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const toDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
