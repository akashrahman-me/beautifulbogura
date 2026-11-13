export interface Stat {
  label: string;
  value: string;
}

export interface AreaProfile {
  name: string;
  summary: string;
  stats: Stat[];
  sections: { id: string; title: string; body: string }[];
}

export interface Contact {
  role: string;
  name: string;
  phone: string;
}

export interface Union {
  id: string;
  name: string;
  number: number;
  contacts: Contact[];
  villages: string[];
  markets: string[];
  formerChairmen: string[];
}

export interface Administration {
  officials: (Contact & { photo: string | null })[];
  formerUnos: { name: string; term: string }[];
}

export interface Municipality {
  name: string;
  summary: string;
  stats: Stat[];
  services: string[];
  wards: { number: number; councillor: string; phone: string }[];
}
