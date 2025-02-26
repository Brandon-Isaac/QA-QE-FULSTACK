import { validateUsername, handleResponse, parseValue, move } from './index';
test('validateUsername returns true for valid usernames', () => {
    expect(validateUsername('Matt1234')).toBe(true);
});
test('validateUsername returns true for valid usernames', () => {
    expect(validateUsername('Matt1234')).toBe(true);
});
test('validateUsername returns false for invalid usernames', () => {
    expect(validateUsername('Bob')).toBe(false);
});
test('validateUsername returns false for null', () => {
    expect(validateUsername(null)).toBe(false);
});
test('handleResponse returns id for valid response', () => {
    const response = { data: { id: '123' } };
    expect(handleResponse(response)).toBe('123');
});
test('handleResponse throws error for error response', () => {
    const response = { error: 'Invalid argument' };
    expect(() => handleResponse(response)).toThrow('Invalid argument');
});
test('parseValue returns id for valid object', () => {
    const value = { data: { id: '123' } };
    const result = parseValue(value);
    expect(result).toBe('123');
});
test('parseValue throws error for invalid object', () => {
    expect(() => parseValue('123')).toThrow('Parsing error!');
    expect(() => parseValue(123)).toThrow('Parsing error!');
});
test('move returns correct string for valid direction and distance', () => {
    expect(move('up', 10)).toBe('up10');
    expect(move('left', 5)).toBe('left5');
    expect(move('right', 98)).toBe('right98');
});
test('move throws error for invalid direction', () => {
    // @ts-expect-error
    expect(() => move('up-right', 10)).toThrow();
    // @ts-expect-error
    expect(() => move('down-left', 20)).toThrow();
});
test('passes the test even with the error', () => {
    expect(() => handleResponse({
        error: 'Invalid argument',
    })).toThrow('Invalid argument');
    // but the data is returned, instead of an error.
    expect(() => handleResponse({
        error: 'Invalid argument',
    })).toThrow('Invalid argument');
});
it('Should handle a { data: { id: string } }', () => {
    const result = parseValue({
        data: {
            id: '123',
        },
    });
    expect(result).toBe('123');
});
it('Should error when anything else is passed in', () => {
    expect(() => parseValue('123')).toThrow('Parsing error!');
    expect(() => parseValue(123)).toThrow('Parsing error!');
});
//# sourceMappingURL=index.test.js.map