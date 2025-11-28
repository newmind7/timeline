export const colorClasses = {
  red: 'bg-red-100 border-red-300 text-red-900',
  orange: 'bg-orange-100 border-orange-300 text-orange-900',
  amber: 'bg-amber-100 border-amber-300 text-amber-900',
  yellow: 'bg-yellow-100 border-yellow-300 text-yellow-900',
  green: 'bg-green-100 border-green-300 text-green-900',
  blue: 'bg-blue-100 border-blue-300 text-blue-900',
  cyan: 'bg-cyan-100 border-cyan-300 text-cyan-900',
  teal: 'bg-teal-100 border-teal-300 text-teal-900',
  pink: 'bg-pink-100 border-pink-300 text-pink-900',
};

export const progressColorClasses = {
  completed: 'bg-blue-500',
  today: 'bg-amber-500',
  upcoming: 'bg-green-500',
  overdue: 'bg-red-500',
};

export const statusBgColors = {
  completed: 'bg-blue-50',
  today: 'bg-amber-50',
  upcoming: 'bg-green-50',
  overdue: 'bg-red-50',
};

export const colors = Object.keys(colorClasses) as Array<keyof typeof colorClasses>;

export const getColorClass = (color: string): string => {
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
};

export const getProgressColor = (status: 'completed' | 'today' | 'upcoming' | 'overdue'): string => {
  return progressColorClasses[status];
};
