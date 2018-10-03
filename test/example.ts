import { expect } from 'chai';
import 'mocha';

describe('Testing', () => {
  it('should complete example test', () => {
    expect('The quick brown fox jumps over the lazy dog.').to.be.a('string');
  });
});
