function Person(name, foods) {
  this.name = name;
  this.foods = foods;
};

// Make a function that lives on every instance of Person
// that returns ths.foods after 2 seconds
Person.prototype.fetchFavFoods = function() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(this.foods), 2000);
  });
};

describe('Mocking Learning', () => {
  it('Mocks a reg function', () => {
    const fetchDogs = jest.fn();
    
    fetchDogs();
    expect(fetchDogs).toHaveBeenCalled();
  });

  it('Can create a person', () => {
    const me = new Person('Richard', ['pizza', 'pies']);
    expect(me.name).toBe('Richard');
  });

  it('Can fetch foods', async () => {
    const me = new Person('Richard', ['pizza', 'pies']);

    // Mock the favFoods funtion
    me.fetchFavFoods = jest.fn().mockResolvedValue(['sushi', 'ramen']);

    const favFoods = await me.fetchFavFoods();
    expect(favFoods).toContain('sushi');
  });
});
