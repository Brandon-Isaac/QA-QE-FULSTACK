"use strict";
// auth.ts for Library Management System
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Role mappings
const ROLE_MAP = {
    admin: 1,
    librarian: 2,
    borrower: 3,
};
// API base URL - adjust this to your backend URL
const AUTH_API_URL = "http://localhost:3000";
// DOM elements
let loginForm;
let signupForm;
let loginError;
let signupError;
let rememberMeCheckbox;
let logoutButton;
let userInfo;
let authStatusContainer;
let loginLinks;
let authRequiredElements;
// Initialize auth functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initializeElements();
    setupEventListeners();
    checkRememberedUser();
    updateUIBasedOnAuth();
});
// Function to initialize DOM elements
function initializeElements() {
    loginForm = document.getElementById("loginForm");
    signupForm = document.getElementById("signupForm");
    loginError = document.getElementById("loginError");
    signupError = document.getElementById("signupError");
    rememberMeCheckbox = document.getElementById("rememberMe");
    logoutButton = document.getElementById("logoutButton");
    userInfo = document.getElementById("userInfo");
    authStatusContainer = document.getElementById("authStatusContainer");
    loginLinks = document.querySelectorAll(".login-link");
    authRequiredElements = document.querySelectorAll(".auth-required");
}
// Function to setup event listeners
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }
    // Logout button
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
    // Password strength meter
    const signupPassword = document.getElementById("signupPassword");
    if (signupPassword) {
        signupPassword.addEventListener("input", updatePasswordStrength);
    }
}
// Function to update password strength indicator
function updatePasswordStrength(e) {
    const passwordInput = e.target;
    const password = passwordInput.value;
    const strengthMeter = document.getElementById("passwordStrength");
    const strengthText = document.getElementById("passwordStrengthText");
    if (!strengthMeter || !strengthText)
        return;
    let strength = 0;
    // Criteria for password strength
    if (password.length >= 8)
        strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/))
        strength += 1;
    if (password.match(/[0-9]/))
        strength += 1;
    if (password.match(/[^a-zA-Z0-9]/))
        strength += 1;
    // Update the strength meter
    strengthMeter.className = "strength-meter";
    switch (strength) {
        case 0:
            strengthMeter.classList.add("weak");
            strengthText.textContent = "Weak";
            break;
        case 1:
        case 2:
            strengthMeter.classList.add("medium");
            strengthText.textContent = "Medium";
            break;
        case 3:
        case 4:
            strengthMeter.classList.add("strong");
            strengthText.textContent = "Strong";
            break;
    }
    // Update width based on strength
    strengthMeter.style.width = `${25 * strength}%`;
}
// Function to handle login form submission
function handleLogin(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const roleRadios = document.querySelectorAll('input[name="userRole"]');
        let selectedRole = "borrower"; // Default
        roleRadios.forEach((radio) => {
            if (radio.checked) {
                selectedRole = radio.value;
            }
        });
        const loginData = {
            email: emailInput.value,
            password: passwordInput.value,
            role: selectedRole,
        };
        try {
            if (loginError) {
                loginError.textContent = "";
                loginError.style.display = "none";
            }
            // Show loading indicator
            const loginButton = document.querySelector('#loginForm button[type="submit"]');
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Logging in...";
            }
            const response = yield fetch(`${AUTH_API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password,
                }),
            });
            const data = yield response.json();
            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }
            // Check if user role matches selected role
            if (data.user &&
                data.user.role_id !== ROLE_MAP[selectedRole]) {
                throw new Error(`You don't have ${selectedRole} privileges. Please select the correct role.`);
            }
            // Handle successful login
            if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                saveUserCredentials(loginData.email);
            }
            // Save token to localStorage
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
            }
            else if (data.token) {
                localStorage.setItem("token", data.token);
            }
            // Save user info
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            // Redirect to home page
            window.location.href = "/home.html";
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            displayError(loginError, errorMessage);
            // Reset login button
            const loginButton = document.querySelector('#loginForm button[type="submit"]');
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = "Login";
            }
        }
    });
}
// Function to handle signup form submission
function handleSignup(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const nameInput = document.getElementById("signupName");
        const emailInput = document.getElementById("signupEmail");
        const passwordInput = document.getElementById("signupPassword");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const agreeTermsCheckbox = document.getElementById("agreeTerms");
        // Validate form inputs
        if (passwordInput.value !== confirmPasswordInput.value) {
            displayError(signupError, "Passwords do not match");
            return;
        }
        if (!agreeTermsCheckbox.checked) {
            displayError(signupError, "You must agree to the Terms of Service and Privacy Policy");
            return;
        }
        // Determine role ID (only borrower can register directly)
        const role_id = ROLE_MAP.borrower;
        const signupData = {
            name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            role_id: role_id,
        };
        try {
            if (signupError) {
                signupError.textContent = "";
                signupError.style.display = "none";
            }
            // Show loading indicator
            const signupButton = document.querySelector('#signupForm button[type="submit"]');
            if (signupButton) {
                signupButton.disabled = true;
                signupButton.textContent = "Creating Account...";
            }
            const response = yield fetch(`${AUTH_API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signupData),
            });
            const data = yield response.json();
            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }
            // Handle successful registration
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            // Show success message and redirect
            alert("Account created successfully! Redirecting to home page...");
            window.location.href = "/home.html";
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
            displayError(signupError, errorMessage);
            // Reset signup button
            const signupButton = document.querySelector('#signupForm button[type="submit"]');
            if (signupButton) {
                signupButton.disabled = false;
                signupButton.textContent = "Sign Up";
            }
        }
    });
}
// Function to display error messages
function displayError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = "block";
    }
}
// Function to save user credentials for "Remember me" functionality
function saveUserCredentials(email) {
    localStorage.setItem("rememberedUser", email);
}
// Function to check for remembered user
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
        const emailInput = document.getElementById("loginEmail");
        if (emailInput) {
            emailInput.value = rememberedUser;
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = true;
            }
        }
    }
}
// Function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem("token") !== null;
}
// Function to get current user
function getCurrentUser() {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
}
// Function to update UI based on authentication status
function updateUIBasedOnAuth() {
    const isUserAuthenticated = isAuthenticated();
    if (authStatusContainer) {
        if (isUserAuthenticated) {
            const user = getCurrentUser();
            if (userInfo && user) {
                userInfo.textContent = `Logged in as: ${user.name || user.email}`;
                userInfo.style.display = "block";
            }
            // Show logout button
            if (logoutButton) {
                logoutButton.style.display = "block";
            }
            // Hide login links
            loginLinks.forEach((link) => {
                link.style.display = "none";
            });
            // Show auth required elements
            authRequiredElements.forEach((element) => {
                element.style.display = "block";
            });
        }
        else {
            // Hide user info
            if (userInfo) {
                userInfo.style.display = "none";
            }
            // Hide logout button
            if (logoutButton) {
                logoutButton.style.display = "none";
            }
            // Show login links
            loginLinks.forEach((link) => {
                link.style.display = "block";
            });
            // Hide auth required elements
            authRequiredElements.forEach((element) => {
                element.style.display = "none";
            });
        }
    }
}
// Make auth functions globally accessible
window.addEventListener("DOMContentLoaded", () => {
    // Add auth functions to window object
    window.AuthModule = {
        isAuthenticated,
        getCurrentUser,
        logout,
        updateUIBasedOnAuth,
    };
});
//# sourceMappingURL=auth.js.map