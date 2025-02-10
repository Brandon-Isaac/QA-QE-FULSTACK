//1. Check if a String is a Palindrome
function isPalindrome(str) {
  const str1 = str.toLowerCase().replaceAll(",", "").replaceAll(" ", "");
  const reversedStr = str1.split("").reverse().join("");
  return reversedStr == str1;
}

console.log(isPalindrome("A man, a plan, a canal, Panama")); // true
console.log(isPalindrome("Was it a car or a cat I saw")); // true
console.log(isPalindrome("Hello, world!")); // false

//2.Reverse a String
function reverseStr(str) {
  const str1 = str.toLowerCase().split("").reverse().join("");
  return str1;
}
console.log(reverseStr("These string has been reversed"));
console.log(reverseStr("mama"));

// 3. Find the Longest Palindromic Substring
function longestPalindromicString(str) {
  let arr = [];
  let str1 = str.split("").reverse();
  let str2 = str.split("");
  for (let i = 0; i < str2.length; i++) {
    if (str2[i] == str1[i]) {
      arr.push(str1[i]);
    } else {
      continue;
    }
  }
  return arr.join("");
}
console.log(longestPalindromicString("babad")); //Output: 'aba'or 'bab'
console.log(longestPalindromicString("cbbd")); //Output:'bb'

//4.Check if Two Strings are Anagrams
function areAnagrams(str1, str2) {
  const normalize = (str) => str.toLowerCase().split("").sort().join("");
  return normalize(str1) === normalize(str2);
}
console.log(areAnagrams("Listen", "Silent")); // true
console.log(areAnagrams("Hello", "world")); // false

//5. Remove Duplicates from a String
function removeDuplicates(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    if (result.indexOf(str[i]) === -1) {
      result += str[i];
    }
  }
  return result;
}
console.log(removeDuplicates("programming")); //Output: 'progamin'
console.log(removeDuplicates("hello world")); //Output: 'helo wrd'
console.log(removeDuplicates("aaaaaa")); //Output: 'a'
console.log(removeDuplicates("abcd")); //abcd;
console.log(removeDuplicates("aabbcc")); //abc
