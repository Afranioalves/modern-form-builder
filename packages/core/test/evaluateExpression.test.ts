import { describe, expect, it } from 'vitest';
import { DataContext } from '../src/expression/DataContext.js';
import {
  evaluateBooleanExpression,
  evaluateFeelExpression,
  evaluateToggleOrFeel,
  isFeelExpressionValid,
} from '../src/expression/evaluateExpression.js';

describe('evaluateFeelExpression', () => {
  it('evaluates a simple comparison against the data context', () => {
    const ctx = new DataContext({ approved: false });
    const { value } = evaluateFeelExpression('approved = false', ctx);
    expect(value).toBe(true);
  });

  it('evaluates arithmetic referencing `this` inside a pushed scope', () => {
    const ctx = new DataContext({}).pushScope({ quantity: 3, price: 10 });
    const { value } = evaluateFeelExpression('this.quantity * this.price', ctx);
    expect(value).toBe(30);
  });
});

describe('evaluateToggleOrFeel', () => {
  it('returns a literal value unchanged', () => {
    const ctx = new DataContext({});
    expect(evaluateToggleOrFeel('Static label', ctx, 'fallback')).toBe('Static label');
  });

  it('evaluates a FEEL-prefixed string', () => {
    const ctx = new DataContext({ name: 'ACME' });
    expect(evaluateToggleOrFeel('=name', ctx, 'fallback')).toBe('ACME');
  });

  it('falls back when the FEEL result is null', () => {
    const ctx = new DataContext({});
    expect(evaluateToggleOrFeel('=missing', ctx, 'fallback')).toBe('fallback');
  });
});

describe('evaluateBooleanExpression', () => {
  it('evaluates conditional.hide style expressions', () => {
    const ctx = new DataContext({ approved: false });
    expect(evaluateBooleanExpression('=approved = false', ctx)).toBe(true);
    expect(evaluateBooleanExpression(undefined, ctx)).toBe(false);
  });
});

describe('isFeelExpressionValid', () => {
  it('accepts well-formed expressions', () => {
    expect(isFeelExpressionValid('1 + 1')).toBe(true);
  });
});
