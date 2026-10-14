import { StatLabelPipe, TypeLabelPipe, dexNumber, humanize } from './pokemon-format';

describe('pokemon-format', () => {
  it('humanizes PokéAPI slugs', () => {
    expect(humanize('mr-mime')).toBe('Mr Mime');
    expect(humanize('pikachu')).toBe('Pikachu');
  });

  it('pads dex numbers', () => {
    expect(dexNumber(25)).toBe('#0025');
    expect(dexNumber(10080)).toBe('#10080');
  });

  it('translates known types and stats, falling back to a humanized value', () => {
    expect(new TypeLabelPipe().transform('electric')).toBe('Eléctrico');
    expect(new TypeLabelPipe().transform('shadow')).toBe('Shadow');
    expect(new StatLabelPipe().transform('special-attack')).toBe('At. Esp.');
  });
});
