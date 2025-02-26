type circleType = {
    radius: number;
}

const getCircleArea = (circle: circleType) => {
    return Math.PI * Math.pow(circle.radius, 2);
}

const getCirclePerimeter = (circle: circleType) => {
    return 2 * Math.PI * circle.radius;
}

let circle: circleType = {
    radius: 10
}

console.log(getCircleArea(circle)); // Output: 314.1592653589793
console.log(getCirclePerimeter(circle)); // Output: 62.83185307179586
const fetchCircleData = async (): Promise<circleType> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ radius: 15 });
        }, 1000);
    });
}

const displayCircleData = async () => {
    const fetchedCircle = await fetchCircleData();
    console.log('Fetched Circle:', fetchedCircle);
    console.log('Area:', getCircleArea(fetchedCircle));
    console.log('Perimeter:', getCirclePerimeter(fetchedCircle));
}

// optional parameter
const getCircleDescription = (circle: circleType, description?: string) => {
    if (description) {
        return `Circle with radius ${circle.radius}: ${description}`;
    }
    return `Circle with radius ${circle.radius}`;
}

// rest parameters
const getCirclesArea = (...circles: circleType[]) => {
    return circles.map(circle => getCircleArea(circle));
}

// multiple parameters
const getCircleMetrics = (circle: circleType, includeArea: boolean, includePerimeter: boolean) => {
    const metrics: { area?: number, perimeter?: number } = {};
    if (includeArea) {
        metrics.area = getCircleArea(circle);
    }
    if (includePerimeter) {
        metrics.perimeter = getCirclePerimeter(circle);
    }
    return metrics;
}

displayCircleData();

// Example usage of the new functions
console.log(getCircleDescription(circle, "This is a sample circle"));
console.log(getCircleDescription(circle));

const circles: circleType[] = [{ radius: 5 }, { radius: 10 }, { radius: 15 }];
console.log(getCirclesArea(...circles));

console.log(getCircleMetrics(circle, true, false));
console.log(getCircleMetrics(circle, true, true));

// Example of using tuples
const circleTuple: [number, string] = [circle.radius, "Circle radius"];
console.log(circleTuple); // Output: [10, "Circle radius"]

// Function returning a tuple
const getCircleInfo = (circle: circleType): [number, number] => {
    return [getCircleArea(circle), getCirclePerimeter(circle)];
}

const circleInfo = getCircleInfo(circle);
console.log(`Area: ${circleInfo[0]}, Perimeter: ${circleInfo[1]}`); // Output: Area: 314.1592653589793, Perimeter: 62.83185307179586

// Destructuring a tuple
const [area, perimeter] = getCircleInfo(circle);
console.log(`Destructured - Area: ${area}, Perimeter: ${perimeter}`); // Output: Destructured - Area: 314.1592653589793, Perimeter: 62.83185307179586