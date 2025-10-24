export interface Question {
  id: string;
  text: string;
  enunciado?: string; // Texto destacado (ex: frase com erro)
  alternatives: string[];
  correctIndex: number;
  explanation?: string;
  difficulty: number; // 1-5
  areaId: string; // matematica, portugues, ciencias, etc
  seriesId: string; // ef1, ef2, em, etc
  habilityId: string; // identificador da habilidade BNCC
  imageUrl?: string;
  audioUrl?: string;
}

export interface QuestionWithAnswer extends Question {
  selectedIndex: number | null;
  wasCorrect: boolean;
  timeLeft: number; // ms restantes quando respondeu
}
