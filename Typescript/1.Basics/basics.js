"use strict";
const getRectangleArea = (rectangle) => {
    return rectangle.width * rectangle.height;
};
const getRectanglePerimeter = (rectangle) => {
    return 2 * (rectangle.height + rectangle.width);
};
let rectangle = {
    width: 40,
    height: 30
};
console.log(getRectanglePerimeter(rectangle));
