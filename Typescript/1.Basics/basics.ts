type rectType={
    width:number;
    height:number
}
const getRectangleArea=(rectangle:rectType)=>{
    return rectangle.width*rectangle.height;
}
const getRectanglePerimeter=(rectangle:rectType)=>{
    return 2*(rectangle.height+rectangle.width)
}
let rectangle:rectType={
    width:40,
    height:30
}
console.log(getRectanglePerimeter(rectangle))