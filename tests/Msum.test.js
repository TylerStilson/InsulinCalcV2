const Msum = require('./Msum');


test('calculates Meal correction', () =>{
    expect(Msum(180, 120, 35, 186.57)).toBe(7);
});
