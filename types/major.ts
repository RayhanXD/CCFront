export interface Major {
  name: string;
  degree: "BA" | "BS";
  concentrations?: string[];
  school?: string;
}

export interface School {
  name: string;
  majors: Major[];
}