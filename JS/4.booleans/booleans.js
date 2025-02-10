import bcrypt from "bcrypt";
const user = {
  hashedPassword: bcrypt.hashSync("userPassword", 10),
  balance: 1000,
  dailyLimit: 500,
};

const correctMFACode = "123456";
const inputPassword = "userPassword";
const inputMFACode = "123456";
const withdrawalAmount = 200;

console.log(
  processWithdrawal(user, inputPassword, inputMFACode, withdrawalAmount)
);

function verifyPassword(inputPassword, storedHashedPassword) {
  if (bcrypt.compareSync(inputPassword, storedHashedPassword) == true) {
    return true;
  } else {
    return false;
  }
}

function verifyMFA(inputMFACode, correctMFACode) {
  if (inputMFACode == correctMFACode) {
    return true;
  } else {
    return false;
  }
}

function checkBalance(balance, withdrawalAmount) {
  if (balance >= withdrawalAmount) {
    return true;
  } else {
    return false;
  }
}
function checkDailyLimit(withdrawalAmount, dailyLimit) {
  if (withdrawalAmount <= dailyLimit) {
    return true;
  } else {
    return false;
  }
}

function processWithdrawal(
  user,
  inputPassword,
  inputMFACode,
  withdrawalAmount
) {
  if (verifyPassword(inputPassword, user.hashedPassword) == false) {
    return "Transaction failed: Incorrect Password";
  } else if (verifyMFA(inputMFACode, correctMFACode) == false) {
    return "Transaction failed: MFA failed";
  } else if (checkBalance(user.balance, withdrawalAmount) == false) {
    return "Transaction failed: Insufficient balance";
  } else if (checkDailyLimit(withdrawalAmount, user.dailyLimit) == false) {
    return "Transaction failed:Amount exceeds daily limit";
  }
  user.balance -= withdrawalAmount;
  return "Transaction Successful! New balance:" + user.balance;
}
