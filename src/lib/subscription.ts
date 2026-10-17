export function calculateNewSubscription(user: any, plan: string, startDate?: Date) {
  const start = startDate || new Date();
  let end = new Date(start);

  switch (plan) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      break;
    case 'lifetime':
      end.setFullYear(end.getFullYear() + 100); // lifetime تقريبية
      break;
  }

  return { start, end };
}