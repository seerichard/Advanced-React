describe('Sample Test 101', () => {
  it('Works as expected', () => {
    expect(1).toEqual(1);
  });

  it('handles ranges just fine', () => {
    const age = 200;
    expect(age).toBeGreaterThan(100);
  });

  it('makes a list of dog names', () => {
    const dogs = ['snickers', 'hugo'];

    expect(dogs).toEqual(dogs);
    expect(dogs).toContain('snickers');
  })
});

// Useful things
// xit() === it.skip() - x-clude
// fit() === it.only() - f - focus
