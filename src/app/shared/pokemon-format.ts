import { Pipe, PipeTransform } from '@angular/core';

const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
  stellar: 'Astral',
};

const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

/** "mr-mime" -> "Mr Mime" */
export function humanize(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** 25 -> "#0025" */
export function dexNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

@Pipe({ name: 'humanize' })
export class HumanizePipe implements PipeTransform {
  transform(value: string): string {
    return humanize(value);
  }
}

@Pipe({ name: 'dexNumber' })
export class DexNumberPipe implements PipeTransform {
  transform(id: number): string {
    return dexNumber(id);
  }
}

@Pipe({ name: 'typeLabel' })
export class TypeLabelPipe implements PipeTransform {
  transform(type: string): string {
    return TYPE_LABELS[type] ?? humanize(type);
  }
}

@Pipe({ name: 'statLabel' })
export class StatLabelPipe implements PipeTransform {
  transform(stat: string): string {
    return STAT_LABELS[stat] ?? humanize(stat);
  }
}
