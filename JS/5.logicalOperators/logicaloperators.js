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

//6. Count Palindromes in a String
// Write a function to count how many distinct palindromes are in a given string. A palindrome is considered distinct based on its start and end position in the string.
function countPalindromes(str) {
  let count = 0;
  let seen = new Set();

  for (let i = 0; i < str.length; i++) {
    for (let j = i + 1; j <= str.length; j++) {
      let substring = str.slice(i, j);
      if (isPalindrome(substring) && !seen.has(substring)) {
        seen.add(substring);
        count++;
      }
    }
  }

  return count;
}

console.log(countPalindromes("ababa")); // 7
console.log(countPalindromes("racecar")); // 7
console.log(countPalindromes("aabb")); // 4
console.log(countPalindromes("a")); // 1
console.log(countPalindromes("abc")); // 3

//7. Longest Common Prefix
// Write a function to find the longest common prefix string amongst an array
// of strings. If there is no common prefix, return an empty string.
function longestCommonPrefix(arr) {
  if (arr.length === 0) return "";
  let prefix = arr[0];
  for (let i = 1; i < arr.length; i++) {
    while (arr[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === "") return `''`;
    }
  }
  return `'${prefix}'`;
}

console.log(longestCommonPrefix(["flower", "flow", "flight"])); // fl
console.log(longestCommonPrefix(["dog", "racecar", "car"])); // ''
console.log(
  longestCommonPrefix(["interspecies", "interstellar", "interstate"])
); // inters
console.log(longestCommonPrefix(["prefix", "prefixes", "preform"])); // pref
console.log(longestCommonPrefix(["apple", "banana", "cherry"])); // ''

// 8. Case Insensitive Palindrome
// Modify the palindrome function to be case insensitive, meaning it should ignore upper and lower case differences when checking for a palindrome.
function isCaseInsensitivePalindrome(str) {
  const normalStr = str.toLowerCase();
  const str1 = normalStr.split("").reverse().join("");
  return normalStr === str1;
}
console.log(isCaseInsensitivePalindrome("Aba")); //true
console.log(isCaseInsensitivePalindrome("Racecar")); //true
console.log(isCaseInsensitivePalindrome("Palindrome")); //false
console.log(isCaseInsensitivePalindrome("Madam")); //true
console.log(isCaseInsensitivePalindrome("Hello")); //false
