function dayjs(date) {
  const d = date ? new Date(date) : new Date();
  const api = {
    format: (fmt = 'YYYY-MM-DD') => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },
    add: (val, unit) => {
      const next = new Date(d);
      if (unit === 'day' || unit === 'days') next.setDate(next.getDate() + val);
      if (unit === 'month' || unit === 'months') next.setMonth(next.getMonth() + val);
      if (unit === 'year' || unit === 'years') next.setFullYear(next.getFullYear() + val);
      return dayjs(next);
    },
    subtract: (val, unit) => api.add(-val, unit),
    isBefore: (other) => d < new Date(other),
    isAfter: (other) => d > new Date(other),
    toDate: () => d
  };
  return api;
}
export default dayjs;
