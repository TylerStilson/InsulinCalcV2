const { TestWatcher } = require('jest');
const BSsum = require('./sum');


test('calculates BS correction', () =>{
    expect(BSsum(180, 120, 35)).toBe(2);
});
