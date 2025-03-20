// Clean up the auth functionality to prevent redundancy

// Types and Interfaces
interface AuthResponse {
  message: string;
  accessToken?: string;
  user: User;
  token: string;
}

interface User {
  user_id: number;
  user_name: string;
  email: string;
  role_id: number;
}

interface LoginData {
  email: string;
  password: string;
  role: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role_id: number;
}

// Role mappings
const ROLE_MAP: Record<string, number> = {
  admin: 1,
  librarian: 2,
  borrower: 3,
};

// API URL
const API_URL = "http://localhost:3000";

// Global state
let currentUser: User | null = null;
let token: string | null = null;

// Auth functions
// ---------------------------------------

// Check if user is authenticated
function isAuthenticated(): boolean {
  return localStorage.getItem("token") !== null;
}

// Get current user from local storage
function getCurrentUser(): User | null {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

// Save user credentials for "Remember me" functionality
function saveUserCredentials(email: string): void {
  localStorage.setItem("rememberedUser", email);
}

// Function to fetch the current user profile
async function fetchCurrentUser(): Promise<boolean> {
  try {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    console.log(storedToken);
    if (!storedToken) {
      return false;
    }

    token = storedToken;

    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    const userData = await response.json();

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
  } catch (error) {
    console.error("Getting current user failed:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
}

// Function to handle login
async function handleLogin(e: Event): Promise<void> {
  e.preventDefault();

  const loginError = document.getElementById("loginError");
  const emailInput = document.getElementById("loginEmail") as HTMLInputElement;
  const passwordInput = document.getElementById(
    "loginPassword"
  ) as HTMLInputElement;
  const rememberMeCheckbox = document.getElementById(
    "rememberMe"
  ) as HTMLInputElement;
  const roleRadios = document.querySelectorAll(
    'input[name="userRole"]'
  ) as NodeListOf<HTMLInputElement>;

  let selectedRole = "borrower"; // Default
  roleRadios.forEach((radio) => {
    if (radio.checked) {
      selectedRole = radio.value;
    }
  });

  const loginData: LoginData = {
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
    const loginButton = document.querySelector(
      '#loginForm button[type="submit"]'
    ) as HTMLButtonElement;
    if (loginButton) {
      loginButton.disabled = true;
      loginButton.textContent = "Logging in...";
    }

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
      }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Check if user role matches selected role
    if (
      data.user &&
      data.user.role_id !== ROLE_MAP[selectedRole as keyof typeof ROLE_MAP]
    ) {
      throw new Error(
        `You don't have ${selectedRole} privileges. Please select the correct role.`
      );
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    displayError(loginError, errorMessage);

    // Reset login button
    const loginButton = document.querySelector(
      '#loginForm button[type="submit"]'
    ) as HTMLButtonElement;
    if (loginButton) {
      loginButton.disabled = false;
      loginButton.textContent = "Login";
    }
  }
}

// Function to handle signup
async function handleSignup(e: Event): Promise<void> {
  e.preventDefault();

  const signupError = document.getElementById("signupError");
  const nameInput = document.getElementById("signupName") as HTMLInputElement;
  const emailInput = document.getElementById("signupEmail") as HTMLInputElement;
  const passwordInput = document.getElementById(
    "signupPassword"
  ) as HTMLInputElement;
  const confirmPasswordInput = document.getElementById(
    "confirmPassword"
  ) as HTMLInputElement;
  const agreeTermsCheckbox = document.getElementById(
    "agreeTerms"
  ) as HTMLInputElement;

  // Validate form inputs
  if (passwordInput.value !== confirmPasswordInput.value) {
    displayError(signupError, "Passwords do not match");
    return;
  }

  if (!agreeTermsCheckbox.checked) {
    displayError(
      signupError,
      "You must agree to the Terms of Service and Privacy Policy"
    );
    return;
  }

  // Determine role ID (only borrower can register directly)
  const role_id = ROLE_MAP.borrower;

  const signupData: SignupData = {
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
    const signupButton = document.querySelector(
      '#signupForm button[type="submit"]'
    ) as HTMLButtonElement;
    if (signupButton) {
      signupButton.disabled = true;
      signupButton.textContent = "Creating Account...";
    }

    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    const data: AuthResponse = await response.json();

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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    displayError(signupError, errorMessage);

    // Reset signup button
    const signupButton = document.querySelector(
      '#signupForm button[type="submit"]'
    ) as HTMLButtonElement;
    if (signupButton) {
      signupButton.disabled = false;
      signupButton.textContent = "Sign Up";
    }
  }
}

// Function to logout
function logout(): void {
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
function displayError(element: HTMLElement | null, message: string): void {
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
}

// Function to show toast notification
function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
): void {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Function to update UI for logged in user
function updateUIForLoggedInUser(): void {
  const profileSection = document.getElementById("profile-section");
  const adminControls = document.getElementById("adminControls");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!currentUser) return;

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
  if (loginBtn) loginBtn.style.display = "none";
  if (signupBtn) signupBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "block";

  // Update profile modal if it exists
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const userRole = document.getElementById("userRole");

  if (profileName) profileName.textContent = currentUser.user_name || "User";
  if (profileEmail) profileEmail.textContent = currentUser.email || "";
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
function protectPage(): void {
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
function checkRememberedUser(): void {
  const rememberedUser = localStorage.getItem("rememberedUser");

  if (rememberedUser) {
    const emailInput = document.getElementById(
      "loginEmail"
    ) as HTMLInputElement;
    const rememberMeCheckbox = document.getElementById(
      "rememberMe"
    ) as HTMLInputElement;

    if (emailInput) {
      emailInput.value = rememberedUser;
    }

    if (rememberMeCheckbox) {
      rememberMeCheckbox.checked = true;
    }
  }
}

// Function to attach event listeners
function attachAuthEventListeners(): void {
  const loginForm = document.getElementById("loginForm") as HTMLFormElement;
  const signupForm = document.getElementById("signupForm") as HTMLFormElement;
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
      if (loginModal) loginModal.style.display = "flex";
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      if (signupModal) signupModal.style.display = "flex";
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
      if (signupModal) signupModal.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
    });
  }

  if (switchToSignup) {
    switchToSignup.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginModal) loginModal.style.display = "none";
      if (signupModal) signupModal.style.display = "flex";
    });
  }

  // Close modal buttons
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      const modal = closeBtn.closest(".modal") as HTMLElement;
      if (modal) modal.style.display = "none";
    });
  });

  // Password strength meter
  const signupPassword = document.getElementById(
    "signupPassword"
  ) as HTMLInputElement;
  if (signupPassword) {
    signupPassword.addEventListener("input", updatePasswordStrength);
  }
}

// Function to update password strength
function updatePasswordStrength(e: Event): void {
  const passwordInput = e.target as HTMLInputElement;
  const password = passwordInput.value;
  const strengthMeter = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("passwordStrengthText");

  if (!strengthMeter || !strengthText) return;

  let strength = 0;

  // Criteria for password strength
  if (password.length >= 8) strength += 1;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
  if (password.match(/[0-9]/)) strength += 1;
  if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

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
async function initAuth(): Promise<void> {
  // Check if page should be protected
  protectPage();

  // Try to fetch current user
  await fetchCurrentUser();

  // Check for remembered user
  checkRememberedUser();

  // Attach event listeners
  attachAuthEventListeners();
}

// Start the auth system when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
});
