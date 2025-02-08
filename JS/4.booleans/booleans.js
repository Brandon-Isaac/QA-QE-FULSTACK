const bcrypt = require("bcrypt");

function verifyPassword(inputPassword, storedHashedPassword) {
  if (bcrypt.compare(inputPassword, storedHashedPassword) == true) {
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
  } else if (verifyMFA(inputMFACode) == false) {
    return "Transaction failed: MFA failed";
  } else if ((user.balance, withdrawalAmount) == false) {
    return "Transaction failed: Insufficient balance";
  } else if (checkDailyLimit(withdrawalAmount, user.dailyLimit) == false) {
    return "Transaction failed:Amount exceeds daily limit";
  }
  user.balance -= withdrawalAmount;
  return "Transaction Successful! New balance:" + user.balance;
}
