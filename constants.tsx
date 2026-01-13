
import { ClassItem, ScheduleItem, DayChip } from './types';

export const IMAGES = {
  profile: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQlOeYjTMGNcZSRudNGhTFkq2O_g1OA-F1IBh_oRCNsU1ECoh4J63F_Ls1M3xDCpG4dT7FZKpXGg5bUjQ968C0f1f8MyNoBVyyqKZeTiq0K8kMQrPNUJSXxa4dC5XXP4z51mmcXREhPaigqXbIPzOP54l1Ltg5ELx8DTIeG4GbHNMFw6t6UN1_GNlDJyuquu4Myxi8xuTrLePPIAP3LPE6W-uorAQHE2G784CrcxD4lS1xyJF9dwq7i-a1W_OlxEVazk_zcWfZxlI",
  classMath: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS43S207H7HCWRuV1yQHahXDIc8voAO7roXZTtgWflaZplkXq1ayQriVm16BRkaCScOzpqEhmn7sbkPTUqZrRgHHXSKZfTw3QN8YZ9udnv0p9IVpLCg29kfu4j0QGaCfJCrfpizl73h0qi0RZAG60B2WO_M2xJ4LYKDfKY17NvzlPPb8jmikps3CFnz3wJb4FTA8Qw4mQdhQnH7qwAfwJZNI5bdw2vAD-B8VVMSwBp2Ev3zfU7EGaKADJMy8afATY_hW04Q1Xzd6c",
  classPhysics: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1hvwWdpMXaf8LbSn2waH0ke1VL9ogmV5gW0PU7pK9YcTSzO7BvYjo3iO8XhnvIXdYdnIGrjd4Yhu79Xfoj7PWER-44X2Py2HIAvhZTI25Ve2QMhQGde1r8AXPEazjbxdMDF0z1I8KaLHrxgRcwP_tAU1Ye6p_QYUEF_qYOL3A6q1Vyu9hwYWQzN5Rgp7reTPGnXKbY-FycW-xPyq8eL_yFPKAxwyMKLnerDnToqHErzPHlhDuBkA6mxerAtjnu-v0svj6YRPUX2c",
  classCalculus: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ9BWmEiLdc6G_EBjP1jnSoY0gqHznU7gfWMVgt9XA8VC6gP7ftxBEwv1A35zDxcGUQF06JwdWurvxDSQ-sAqYTSlMtIvXnt10R3OIH7YAGJNkYaEVLZ2HC3rNvsK4_rX2ff1pcz19Wi11zBN6W1XscI1Yp1TM9ssW_hec6tjxo2H-M3PTNTXt2vCG3AAJYPJzJPHNiMr2eBc5fXfHDjVEwwSRptswCVMETBH-BgPqlCZ362kdryOw6gfaEAkrs5e2IfLPUUGVs1c",
  classGeometry: "https://lh3.googleusercontent.com/aida-public/AB6AXuBM3dzPEdcrppo7KpeD4Sw5H0pbY90jABd76klt7IMoipWkBknT_DKkfBgvX38fQtxXQQ-uMh1tIUZACPd2iG1dOI6fcyPWg_0fOAFAsqqqWoB-orHLAUz5MF--GqJTYFw_VC7YMMhUZhHgkhDbG6CG7y6X5yd9gTzfGEYYDYWwQFtjWu3VhC1hgFSUTXdn1SH-kDUCxlG9z-5wdUEu_5nbMojiOtC0iYY8c0hz4d7ScQsKbyLncD_oTecq60_lFBBLgo7ZRD9nDrg"
};

export const MOCK_CLASSES: ClassItem[] = [
  {
    id: '1',
    name: '9º Ano - Matemática',
    subject: 'Matemática',
    nextClass: 'Ter 10:00',
    studentsCount: 32,
    status: 'ATIVA',
    imageUrl: IMAGES.classMath
  },
  {
    id: '2',
    name: '10º Ano - Física',
    subject: 'Física',
    nextClass: 'Qua 08:30',
    studentsCount: 28,
    status: 'ATIVA',
    imageUrl: IMAGES.classPhysics
  },
  {
    id: '3',
    name: '11º Ano - Cálculo',
    subject: 'Cálculo',
    nextClass: 'Qui 11:15',
    studentsCount: 25,
    status: 'AVALIAÇÃO PENDENTE',
    imageUrl: IMAGES.classCalculus
  },
  {
    id: '4',
    name: '12º Ano - Geometria',
    subject: 'Geometria',
    nextClass: 'Seg 09:00',
    studentsCount: 22,
    status: 'CONCLUÍDA',
    imageUrl: IMAGES.classGeometry
  }
];

export const DAILY_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    time: '11:15',
    title: 'História Geral',
    location: '3º Período • Sala 101',
    period: 'MANHÃ',
    type: 'CLASS'
  },
  {
    id: 's2',
    time: '12:00',
    title: 'Intervalo de Almoço',
    location: '',
    period: 'TARDE',
    type: 'BREAK'
  },
  {
    id: 's3',
    time: '13:00',
    title: 'Laboratório de Física',
    location: '4º Período • Ala de Ciências',
    period: 'TARDE',
    type: 'CLASS'
  },
  {
    id: 's4',
    time: '14:30',
    title: 'Reunião de Professores',
    location: 'Sala de Conferências B',
    period: 'TARDE',
    type: 'MEETING'
  }
];

export const WEEK_CHIPS: DayChip[] = [
  { label: 'Seg', day: 12 },
  { label: 'Ter', day: 13, active: true },
  { label: 'Qua', day: 14 },
  { label: 'Qui', day: 15 },
  { label: 'Sex', day: 16 },
  { label: 'Sáb', day: 17 }
];
