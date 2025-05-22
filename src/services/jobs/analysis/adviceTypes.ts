
export interface AdviceItem {
  id: string;
  qualification: string;
  advice: string;
  hasLink: boolean;
}

export interface AdviceResponse {
  adviceItems: AdviceItem[];
}
