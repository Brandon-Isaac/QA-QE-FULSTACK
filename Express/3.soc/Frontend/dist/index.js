"use strict";
// Clean up the auth functionality to prevent redundancy
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
// API URL
const API_URL = "http://localhost:3000";
// Global state
let currentUser = null;
let token = null;
// Auth functions
// ---------------------------------------
// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem("token") !== null;
}
// Get current user from local storage
function getCurrentUser() {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
}
// Save user credentials for "Remember me" functionality
function saveUserCredentials(email) {
    localStorage.setItem("rememberedUser", email);
}
// Function to fetch the current user profile
function fetchCurrentUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get token from localStorage
            const storedToken = localStorage.getItem("token");
            console.log(storedToken);
            if (!storedToken) {
                return false;
            }
            token = storedToken;
            const response = yield fetch(`${API_URL}/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                    "Content-Type": "application/json",
                },
                // Remove credentials: "include" - we don't need it when using Authorization header
            });
            if (!response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                return false;
            }
            const userData = yield response.json();
            // Update current user data
            currentUser = {
                user_id: userData.user.userId,
                user_name: userData.user.name || "User",
                email: userData.user.email || "",
                role_id: userData.user.roleId,
            };
            // Save user data to localStorage
            localStorage.setItem("user", JSON.stringify(currentUser));
            // Update UI
            updateUIForLoggedInUser();
            return true;
        }
        catch (error) {
            console.error("Getting current user failed:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return false;
        }
    });
}
// Function to handle login
function handleLogin(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const loginError = document.getElementById("loginError");
        const emailInput = document.getElementById("loginEmail");
        const passwordInput = document.getElementById("loginPassword");
        const rememberMeCheckbox = document.getElementById("rememberMe");
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
            const response = yield fetch(`${API_URL}/login`, {
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
            // Save token and user info
            const userToken = data.accessToken || data.token;
            if (userToken) {
                localStorage.setItem("token", userToken);
                token = userToken;
            }
            // Save user info
            if (data.user) {
                currentUser = data.user;
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
// Function to handle signup
function handleSignup(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const signupError = document.getElementById("signupError");
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
            const response = yield fetch(`${API_URL}/signup`, {
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
                token = data.token;
            }
            if (data.user) {
                currentUser = data.user;
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            // Show success message and redirect
            showToast("Account created successfully! Redirecting to home page...");
            setTimeout(() => {
                window.location.href = "/home.html";
            }, 1500);
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
// Function to logout
function logout() {
    // Clear user data from memory
    currentUser = null;
    token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Call your logout endpoint
    fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if you're using cookie-based auth
    })
        .then(() => {
        // Redirect user to index page
        window.location.href = "http://localhost:5173/";
    })
        .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    });
}
// Function to display error messages
function displayError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = "block";
    }
}
// Function to show toast notification
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer)
        return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
// Function to update UI for logged in user
function updateUIForLoggedInUser() {
    const profileSection = document.getElementById("profile-section");
    const adminControls = document.getElementById("adminControls");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    if (!currentUser)
        return;
    // Update profile section if it exists
    if (profileSection) {
        profileSection.innerHTML = `
          <div class="user-profile">
            <div class="user-image">
              <img src="./Images/91.jpg" alt="user image" />
            </div>
            <div class="user-info" id="details">
              <h4 id="profileName"></h4>
              <p id="userRole"></p>
            </div>
          </div>
    `;
    }
    // Show admin controls if user is admin
    if (adminControls) {
        adminControls.style.display = currentUser.role_id === 1 ? "block" : "none";
    }
    // Update login/signup/logout buttons
    if (loginBtn)
        loginBtn.style.display = "none";
    if (signupBtn)
        signupBtn.style.display = "none";
    if (logoutBtn)
        logoutBtn.style.display = "block";
    // Update profile modal if it exists
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const userRole = document.getElementById("userRole");
    if (profileName)
        profileName.textContent = currentUser.user_name || "User";
    if (profileEmail)
        profileEmail.textContent = currentUser.email || "";
    if (userRole) {
        userRole.textContent =
            currentUser.role_id === 1
                ? "Admin"
                : currentUser.role_id === 2
                    ? "Librarian"
                    : "Borrower";
    }
}
// Function to protect pages that require authentication
function protectPage() {
    const isLoggedIn = isAuthenticated();
    const currentPath = window.location.pathname;
    // If on home page and not logged in, redirect to index
    if (currentPath.includes("home.html") && !isLoggedIn) {
        window.location.href = "http://localhost:5173/";
        return;
    }
    // If on index page and already logged in, redirect to home
    if (currentPath === "/" || currentPath.includes("index.html")) {
        if (isLoggedIn) {
            // Prevent endless redirects by checking if we're coming from home
            const referrer = document.referrer;
            if (!referrer.includes("home.html")) {
                window.location.href = "/home.html";
                return;
            }
        }
    }
}
// Function to check for remembered user
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
        const emailInput = document.getElementById("loginEmail");
        const rememberMeCheckbox = document.getElementById("rememberMe");
        if (emailInput) {
            emailInput.value = rememberedUser;
        }
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
}
// Function to attach event listeners
function attachAuthEventListeners() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const switchToLogin = document.getElementById("switchToLogin");
    const switchToSignup = document.getElementById("switchToSignup");
    const loginModal = document.getElementById("loginModal");
    const signupModal = document.getElementById("signupModal");
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }
    // Auth buttons
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            if (loginModal)
                loginModal.style.display = "flex";
        });
    }
    if (signupBtn) {
        signupBtn.addEventListener("click", () => {
            if (signupModal)
                signupModal.style.display = "flex";
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
    // Switch between login and signup
    if (switchToLogin) {
        switchToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            if (signupModal)
                signupModal.style.display = "none";
            if (loginModal)
                loginModal.style.display = "flex";
        });
    }
    if (switchToSignup) {
        switchToSignup.addEventListener("click", (e) => {
            e.preventDefault();
            if (loginModal)
                loginModal.style.display = "none";
            if (signupModal)
                signupModal.style.display = "flex";
        });
    }
    // Close modal buttons
    document.querySelectorAll(".close").forEach((closeBtn) => {
        closeBtn.addEventListener("click", () => {
            const modal = closeBtn.closest(".modal");
            if (modal)
                modal.style.display = "none";
        });
    });
    // Password strength meter
    const signupPassword = document.getElementById("signupPassword");
    if (signupPassword) {
        signupPassword.addEventListener("input", updatePasswordStrength);
    }
}
// Function to update password strength
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
// Initialize auth system
function initAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if page should be protected
        protectPage();
        // Try to fetch current user
        yield fetchCurrentUser();
        // Check for remembered user
        checkRememberedUser();
        // Attach event listeners
        attachAuthEventListeners();
    });
}
// Start the auth system when the page loads
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
});
//# sourceMappingURL=index.js.map