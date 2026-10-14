// Refleja los contratos que expone el BFF (sii-test-backend).

export interface PokemonSummary {
  id: number;
  name: string;
  image: string;
}

export interface PokemonPage {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: PokemonSummary[];
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  hidden: boolean;
}

export interface PokemonDetail {
  id: number;
  name: string;
  image: string | null;
  /** Metros */
  height: number;
  /** Kilogramos */
  weight: number;
  baseExperience: number | null;
  types: string[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  genus: string | null;
  description: string | null;
}

export interface ListPokemonParams {
  page: number;
  pageSize: number;
  search?: string;
}
