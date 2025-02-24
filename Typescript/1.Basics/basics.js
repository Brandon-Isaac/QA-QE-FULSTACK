var getRectangleArea = function (rectangle) {
    return rectangle.width * rectangle.height;
};
var getRectanglePerimeter = function (rectangle) {
    return 2 * (rectangle.height + rectangle.width);
};
var rectangle = {
    width: 20,
    height: 30
};
console.log(getRectangleArea(rectangle));
