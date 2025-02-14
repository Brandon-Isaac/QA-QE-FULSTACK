//Question 1: How do you create an empty array in JavaScript?
const students = [];
let student = new Array();

console.log(typeof student);
console.log(typeof students);

// Adding content to the array
students.push("Isaac");
students.push("Brandon");
students.push("Datch");

console.log(students);

//Question 2: How do you access the first and last elements of an array?
console.log(students[0]);
console.log(students[students.length - 1]);

//Question 3: How do you add an element to the end of an array?
students.push("zane");
console.log(students);

//Question 4: How do you remove the last element from an array?
students.pop();
console.log(students);

//Question 5: How do you loop through an array in JavaScript?
for (let i = 0; i < students.length; i++) {
  console.log(students[i]);
}
const each = students.map((student) => {
  return student.toLowerCase();
});
console.log(each);

//Question 6: How do you check if an element exists in an array?
if (students.includes("Datch")) {
  console.log("name exists");
} else "unavailable";
if (students.indexOf(7) !== -1) {
  console.log("exists");
} else console.log("no");
