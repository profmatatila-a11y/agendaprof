
export interface ClassItem {
  id: string;
  name: string;
  subject: string;
  nextClass: string;
  studentsCount: number;
  status: 'ATIVA' | 'AVALIAÇÃO PENDENTE' | 'CONCLUÍDA';
  imageUrl: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  period?: string;
  type?: 'CLASS' | 'BREAK' | 'MEETING';
  isActive?: boolean;
}

export interface DayChip {
  label: string;
  day: number;
  active?: boolean;
}
