//1
function is_string(text) {
  if (typeof text == "string") {
    return true;
  } else {
    return false;
  }
}
console.log(is_string("w3resource"));
console.log(is_string([1, 2, 4, 0]));

//2
function is_Blank(text) {
  if (text.trim() == "") {
    return true;
  } else return false;
}

console.log(is_Blank(" ")); // true
console.log(is_Blank("abc")); // false

//3
function string_to_array(text) {
  text = text.split(" ");
  return text;
}
console.log(string_to_array("Robin Singh")); // ["Robin", "Singh"]

//4
function truncate_string(text, num) {
  text = text.substr(0, num);
  return text;
}
console.log(truncate_string("Robin Singh", 4)); // "Robi"

//5
function abbrev_name(text) {
  text = text.split(" ");
  return text[0] + " " + text[1].charAt(0).toUpperCase() + ". ";
}
console.log(abbrev_name("Robin Singh")); // "Robin S."

//6
function protect_email(text) {
  text = text.split("@");
  let fname = text[0].split("_");
  return fname[0] + "..." + text[1];
}
console.log(protect_email("robin_singh@example.com")); //"robin...@example.com"

//7
function string_parameterize(text) {
  text = text
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(" ", "_"))
    .join("-");
  return text;
}
console.log(string_parameterize("Robin Singh from USA.")); //("robin-singh-from-usa");

//8
function capitalize(text) {
  text = text.split("");
  text[0] = text[0].toUpperCase();
  newText = text.join("");
  return newText;
}
console.log(capitalize("js string exercises")); // "Js string exercises"

//9
function swapcase(text) {
  text = text
    .split("")
    .map((character) => {
      if (character == character.toLowerCase()) {
        return character.toUpperCase();
      } else {
        return character.toLowerCase();
      }
    })
    .join("");
  return text;
}
console.log(swapcase("AaBbc")); // "aAbBC"

//10
function camelize(text) {
  text = text
    .split(" ")
    .map((word) => word.replace(" ", ""))
    .join("");
  return text;
}
console.log(camelize("JavaScript Exercises")); // "JavaScriptExercises"

//11
function uncamelize(text, symbol = " ") {
  text = text
    .split("")
    .map((char) =>
      char.replace(char.toUpperCase(), `${symbol}${char.toLowerCase()}`)
    )
    .join("");
  return text;
}
console.log(uncamelize("helloWorld")); // "hello world"
console.log(uncamelize("helloWorld", "-")); // "hello-world"

//12
function repeat(text, num) {
  let result = "";
  for (let i = 0; i < num; i++) {
    result += text;
  }
  return result;
}
console.log(repeat("Ha!", 3)); // "Ha!Ha!Ha!"

//13
function insert(text, insertion, pos) {
  return text.slice(0, pos) + insertion + text.slice(pos);
}
console.log(insert("We are doing some exercises.", "JavaScript ", 18)); // "We are doing some JavaScript exercises."

//14
function humanize(num) {
  const div = num % 10;
  if (div == 1) {
    return (num = num.concat("st"));
  } else if (div == 2) {
    return (num = num.concat("nd"));
  } else if (div == 3) return (num = num.concat("rd"));
  else {
    return (num = num.concat("th"));
  }
}

function humanize_format(num) {
  num = num.toString();
  return humanize(num);
}

console.log(humanize_format(301)); // "301st"
console.log(humanize_format(302)); // "302st"
console.log(humanize_format(303)); // "303st"
console.log(humanize_format(304)); // "304st"

//15
function text_truncate(text, pos, symbol) {
  text = text.slice(0, pos - 3);
  return text + " " + symbol;
}
console.log(text_truncate("We are doing JS string exercises.", 15, "!!")); // "We are doing !!"

//16
function string_chop(text, num) {
  let result = [];
  for (let i = 0; i < text.length; i += num) {
    result.push(text.substr(i, num));
  }
  return result;
}

console.log(string_chop("w3resource", 3)); // ["w3r", "eso", "urc", "e"]

//17
function count(text, query) {
  text = text.toLowerCase().split(" ");
  let counted = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] == query) {
      counted += 1;
    }
  }
  return counted;
}
console.log(count("The quick brown fox jumps over the lazy dog", "the")); // Output: 2

function reverse_binary(num) {
  num = num.toString(2);
  let reversedBinary = num.split("").reverse().join("");
  return parseInt(reversedBinary, 2);
}

console.log(reverse_binary(100)); // 19

//20
function formatted_string(pad, str, side) {
  if (typeof str === "number") {
    str = str.toString();
  }
  if (side === "l") {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

console.log(formatted_string("0000", 123, "l")); // "0123"
