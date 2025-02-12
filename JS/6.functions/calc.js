class Calculator {
  constructor() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operation = null;
    this.newNumber = true;
    this.memory = 0;
    this.smallDisplayValue = "";
  }

  updateDisplay() {
    document.querySelector(".display").textContent = this.currentValue;
    document.querySelector(".small-display").textContent =
      this.smallDisplayValue;
  }

  appendNumber(number) {
    this.currentValue = this.newNumber
      ? number.toString()
      : this.currentValue + number;
    this.newNumber = false;
    this.updateSmallDisplay(number);
    this.updateDisplay();
  }

  appendDecimal() {
    if (this.newNumber) {
      this.currentValue = "0.";
      this.newNumber = false;
    } else if (!this.currentValue.includes(".")) {
      this.currentValue += ".";
    }
    this.updateSmallDisplay(".");
    this.updateDisplay();
  }

  handleOperation(op) {
    if (this.operation && !this.newNumber) this.calculate();
    this.previousValue = parseFloat(this.currentValue);
    this.operation = op;
    this.newNumber = true;
    this.updateSmallDisplay(` ${op} `);
  }

  calculate() {
    if (!this.operation || this.newNumber) {
      this.currentValue =
        this.previousValue !== null
          ? this.previousValue.toString()
          : this.currentValue;
      this.updateDisplay();
      return;
    }
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result;

    switch (this.operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        result = current === 0 ? "Cannot divide by zero" : prev / current;
        break;
    }

    this.currentValue = this.formatResult(result);
    this.operation = null;
    this.newNumber = true;
    this.smallDisplayValue = "";
    this.updateDisplay();
  }

  formatResult(number) {
    if (isNaN(number)) return "Error";
    if (!isFinite(number)) return "Cannot divide by zero";
    return number.toString().includes(".")
      ? number.toFixed(10).replace(/\.?0+$/, "")
      : number.toString();
  }

  clear() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operation = null;
    this.newNumber = true;
    this.smallDisplayValue = "";
    this.updateDisplay();
  }

  clearEntry() {
    this.currentValue = "0";
    this.newNumber = true;
    this.updateDisplay();
  }

  updateSmallDisplay(value) {
    this.smallDisplayValue += value;
    this.updateDisplay();
  }
}

const calculator = new Calculator();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn").forEach((button) => {
    const text = button.textContent.trim();
    if ("0123456789".includes(text)) {
      button.addEventListener("click", () => calculator.appendNumber(text));
    } else if (text === ".") {
      button.addEventListener("click", () => calculator.appendDecimal());
    } else if (text === "=") {
      button.addEventListener("click", () => calculator.calculate());
    } else if (text === "C") {
      button.addEventListener("click", () => calculator.clear());
    } else if (text === "CE") {
      button.addEventListener("click", () => calculator.clearEntry());
    } else if (text === "+/-") {
      button.addEventListener("click", () => calculator.toggleSign());
    } else if (text === "%") {
      button.addEventListener("click", () => calculator.percentage());
    } else if (text === "√x") {
      button.addEventListener("click", () => calculator.squareRoot());
    } else if (text === "x²") {
      button.addEventListener("click", () => calculator.square());
    } else if (text === "¹/x") {
      button.addEventListener("click", () => calculator.reciprocal());
    } else if ("+-×÷".includes(text)) {
      button.addEventListener("click", () => calculator.handleOperation(text));
    }
  });

  document.querySelectorAll(".memory-btn").forEach((button) => {
    const text = button.textContent.trim();
    if (text === "MC") {
      button.addEventListener("click", () => calculator.memoryClear());
    } else if (text === "MR") {
      button.addEventListener("click", () => calculator.memoryRecall());
    } else if (text === "M+") {
      button.addEventListener("click", () => calculator.memoryAdd());
    } else if (text === "M-") {
      button.addEventListener("click", () => calculator.memorySubtract());
    } else if (text === "MS") {
      button.addEventListener("click", () => calculator.memoryStore());
    }
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if ("0123456789".includes(key)) {
      calculator.appendNumber(key);
    } else if (key === ".") {
      calculator.appendDecimal();
    } else if (key === "Enter" || key === "=") {
      calculator.calculate();
    } else if (key === "Escape") {
      calculator.clear();
    } else if (key === "Backspace") {
      calculator.clearEntry();
    } else if ("+-*/".includes(key)) {
      const opMap = { "+": "+", "-": "-", "*": "×", "/": "÷" };
      calculator.handleOperation(opMap[key]);
    }
    event.preventDefault();
  });
});
