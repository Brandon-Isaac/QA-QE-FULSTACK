// import { Expect,Equal } from '@type-challenges/utils';
export function validateUsername(username) {
    if (typeof username === "string") {
        return username.length > 5;
    }
    return false;
}
export const handleResponse = (response) => {
    if ('data' in response) {
        return response.data.id;
    }
    else {
        throw new Error(response.error);
    }
};
export function move(direction, distance) {
    // Move the specified distance in the given direction
    return typeof direction + distance;
}
move('up', 10);
move('left', 5);
// move('down-left',20,)
export const somethingDangerous = () => {
    if (Math.random() > 0.5) {
        throw new Error('Something went wrong');
    }
    return 'all good';
};
try {
    somethingDangerous();
}
catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    }
}
export const parseValue = (value) => {
    if (typeof value === 'object' &&
        value !== null &&
        'data' in value &&
        typeof value.data === 'object' &&
        value.data !== null &&
        'id' in value.data &&
        typeof value.data.id === 'string') {
        return value.data.id;
    }
    throw new Error('Parsing error!');
};
//# sourceMappingURL=index.js.map