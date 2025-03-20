// // Types and Interfaces
// // Define interfaces for auth operations
// interface AuthResponse {
//     message: string;
//     accessToken?: string;
//     user: User;
//     token: string;
//   }
  
//   interface User {
//     user_id: number;
//     user_name: string;
//     email: string;
//     role_id: number;
//   }
  
//   interface LoginData {
//     email: string;
//     password: string;
//     role: string;
//   }
  
//   interface SignupData {
//     name: string;
//     email: string;
//     password: string;
//     role_id: number;
//   }
  
//   // Role mappings
//   const ROLE_MAP: Record<string, number> = {
//     admin: 1,
//     librarian: 2,
//     borrower: 3,
//   };
//   interface Book {
//     book_id: number;
//     title: string;
//     author: string;
//     genre: string;
//     year: number;
//     pages: number;
//     price: number;
//     description: string;
//     image: string;
//     publisher: string;
//   }
  
//   interface CartItem {
//     id: number;
//     title: string;
//     author: string;
//     price: number;
//     quantity: number;
//     image: string;
//   }
  
//   // API URL
//   const API_URL = "http://localhost:3000";
  
//   // Global state
//   let books: Book[] = [];
//   let cart: CartItem[] = [];
//   let currentUser: User | null = null;
//   let token: string | null = null;
//   let isEditMode = false;
//   let currentPage = 1;
//   let totalPages = 1;
//   let booksPerPage = 8;
//   let currentFilters: Record<string, any> = {};
  
//   // DOM Elements
//   const domElements = {
//     bookList: document.getElementById("bookList") as HTMLDivElement,
//     searchInput: document.getElementById("searchInput") as HTMLInputElement,
//     searchBtn: document.getElementById("searchBtn") as HTMLButtonElement,
//     genreFilter: document.getElementById("genreFilter") as HTMLSelectElement,
//     sortBy: document.getElementById("sortBy") as HTMLSelectElement,
//     applyFilters: document.getElementById("applyFilters") as HTMLButtonElement,
//     resetFilters: document.getElementById("resetFilters") as HTMLButtonElement,
//     cartItems: document.getElementById("cartItems") as HTMLSpanElement,
//     cartBtn: document.getElementById("cartBtn") as HTMLButtonElement,
//     cartModal: document.getElementById("cartModal") as HTMLDivElement,
//     cartDetails: document.getElementById("cartDetails") as HTMLDivElement,
//     cartTotal: document.getElementById("cartTotal") as HTMLParagraphElement,
//     clearCartBtn: document.getElementById("clearCartBtn") as HTMLButtonElement,
//     checkoutBtn: document.getElementById("checkoutBtn") as HTMLButtonElement,
//     bookModal: document.getElementById("bookModal") as HTMLDivElement,
//     bookForm: document.getElementById("bookForm") as HTMLFormElement,
//     bookId: document.getElementById("bookId") as HTMLInputElement,
//     bookModalTitle: document.getElementById(
//       "bookModalTitle"
//     ) as HTMLHeadingElement,
//     addBookBtn: document.getElementById("addBookBtn") as HTMLButtonElement,
//     manageBooks: document.getElementById("manageBooks") as HTMLButtonElement,
//     adminControls: document.getElementById("adminControls") as HTMLDivElement,
//     loginBtn: document.getElementById("loginBtn") as HTMLButtonElement,
//     logoutBtn: document.getElementById("logoutBtn") as HTMLButtonElement,
//     signupBtn: document.getElementById("signupBtn") as HTMLButtonElement,
//     loginModal: document.getElementById("loginModal") as HTMLDivElement,
//     signupModal: document.getElementById("signupModal") as HTMLDivElement,
//     profileModal: document.getElementById("profileModal") as HTMLDivElement,
//     loginForm: document.getElementById("loginForm") as HTMLFormElement,
//     signupForm: document.getElementById("signupForm") as HTMLFormElement,
//     switchToLogin: document.getElementById("switchToLogin") as HTMLAnchorElement,
//     switchToSignup: document.getElementById(
//       "switchToSignup"
//     ) as HTMLAnchorElement,
//     profileSection: document.getElementById("profile-section") as HTMLDivElement,
//     profileName: document.getElementById("profileName") as HTMLHeadingElement,
//     profileEmail: document.getElementById("profileEmail") as HTMLParagraphElement,
//     userRole: document.getElementById("userRole") as HTMLSpanElement,
//     bookDetailsModal: document.getElementById(
//       "bookDetailsModal"
//     ) as HTMLDivElement,
//     bookDetailsContent: document.getElementById(
//       "bookDetailsContent"
//     ) as HTMLDivElement,
//     loadingIndicator: document.getElementById(
//       "loadingIndicator"
//     ) as HTMLDivElement,
//     noResults: document.getElementById("noResults") as HTMLDivElement,
//     clearFiltersBtn: document.getElementById(
//       "clearFiltersBtn"
//     ) as HTMLButtonElement,
//     loginError: document.getElementById("loginError") as HTMLDivElement,
//     signupError: document.getElementById("signupError") as HTMLDivElement,
//     toastContainer: document.getElementById("toastContainer") as HTMLDivElement,
//   };
  
//   // Auth functions
//   // auth.ts for Library Management System
  
//   // API base URL - adjust this to your backend URL
//   const AUTH_API_URL = "http://localhost:3000";
  
//   // DOM elements
//   let loginForm: HTMLFormElement | null;
//   let signupForm: HTMLFormElement | null;
//   let loginError: HTMLElement | null;
//   let signupError: HTMLElement | null;
//   let rememberMeCheckbox: HTMLInputElement | null;
//   let logoutButton: HTMLElement | null;
//   let userInfo: HTMLElement | null;
//   let authStatusContainer: HTMLElement | null;
//   let loginLinks: NodeListOf<Element>;
//   let authRequiredElements: NodeListOf<Element>;
  
//   // Initialize auth functionality when DOM is loaded
//   document.addEventListener("DOMContentLoaded", () => {
//     initializeElements();
//     setupEventListeners();
//     checkRememberedUser();
//     updateUIBasedOnAuth();
//   });
  
//   // Function to initialize DOM elements
//   function initializeElements(): void {
//     loginForm = document.getElementById("loginForm") as HTMLFormElement;
//     signupForm = document.getElementById("signupForm") as HTMLFormElement;
//     loginError = document.getElementById("loginError");
//     signupError = document.getElementById("signupError");
//     rememberMeCheckbox = document.getElementById(
//       "rememberMe"
//     ) as HTMLInputElement;
//     logoutButton = document.getElementById("logoutButton");
//     userInfo = document.getElementById("userInfo");
//     authStatusContainer = document.getElementById("authStatusContainer");
//     loginLinks = document.querySelectorAll(".login-link");
//     authRequiredElements = document.querySelectorAll(".auth-required");
//   }
  
//   // Function to setup event listeners
//   function setupEventListeners(): void {
//     // Login form submission
//     if (loginForm) {
//       loginForm.addEventListener("submit", handleLogin);
//     }
  
//     // Signup form submission
//     if (signupForm) {
//       signupForm.addEventListener("submit", handleSignup);
//     }
  
//     // Logout button
//     if (logoutButton) {
//       logoutButton.addEventListener("click", logout);
//     }
  
//     // Password strength meter
//     const signupPassword = document.getElementById(
//       "signupPassword"
//     ) as HTMLInputElement;
//     if (signupPassword) {
//       signupPassword.addEventListener("input", updatePasswordStrength);
//     }
//   }
  
//   // Function to update password strength indicator
//   function updatePasswordStrength(e: Event): void {
//     const passwordInput = e.target as HTMLInputElement;
//     const password = passwordInput.value;
//     const strengthMeter = document.getElementById("passwordStrength");
//     const strengthText = document.getElementById("passwordStrengthText");
  
//     if (!strengthMeter || !strengthText) return;
  
//     let strength = 0;
  
//     // Criteria for password strength
//     if (password.length >= 8) strength += 1;
//     if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
//     if (password.match(/[0-9]/)) strength += 1;
//     if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
  
//     // Update the strength meter
//     strengthMeter.className = "strength-meter";
//     switch (strength) {
//       case 0:
//         strengthMeter.classList.add("weak");
//         strengthText.textContent = "Weak";
//         break;
//       case 1:
//       case 2:
//         strengthMeter.classList.add("medium");
//         strengthText.textContent = "Medium";
//         break;
//       case 3:
//       case 4:
//         strengthMeter.classList.add("strong");
//         strengthText.textContent = "Strong";
//         break;
//     }
  
//     // Update width based on strength
//     strengthMeter.style.width = `${25 * strength}%`;
//   }
  
//   // Function to handle login form submission
//   async function handleLogin(e: Event): Promise<void> {
//     e.preventDefault();
  
//     const emailInput = document.getElementById("loginEmail") as HTMLInputElement;
//     const passwordInput = document.getElementById(
//       "loginPassword"
//     ) as HTMLInputElement;
//     const roleRadios = document.querySelectorAll(
//       'input[name="userRole"]'
//     ) as NodeListOf<HTMLInputElement>;
  
//     let selectedRole = "borrower"; // Default
//     roleRadios.forEach((radio) => {
//       if (radio.checked) {
//         selectedRole = radio.value;
//       }
//     });
  
//     const loginData: LoginData = {
//       email: emailInput.value,
//       password: passwordInput.value,
//       role: selectedRole,
//     };
  
//     try {
//       if (loginError) {
//         loginError.textContent = "";
//         loginError.style.display = "none";
//       }
  
//       // Show loading indicator
//       const loginButton = document.querySelector(
//         '#loginForm button[type="submit"]'
//       ) as HTMLButtonElement;
//       if (loginButton) {
//         loginButton.disabled = true;
//         loginButton.textContent = "Logging in...";
//       }
  
//       const response = await fetch(`${AUTH_API_URL}/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: loginData.email,
//           password: loginData.password,
//         }),
//       });
  
//       const data: AuthResponse = await response.json();
  
//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }
  
//       // Check if user role matches selected role
//       if (
//         data.user &&
//         data.user.role_id !== ROLE_MAP[selectedRole as keyof typeof ROLE_MAP]
//       ) {
//         throw new Error(
//           `You don't have ${selectedRole} privileges. Please select the correct role.`
//         );
//       }
  
//       // Handle successful login
//       if (rememberMeCheckbox && rememberMeCheckbox.checked) {
//         saveUserCredentials(loginData.email);
//       }
  
//       // Save token to localStorage
//       if (data.accessToken) {
//         localStorage.setItem("token", data.accessToken);
//       } else if (data.token) {
//         localStorage.setItem("token", data.token);
//       }
  
//       // Save user info
//       if (data.user) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }
  
//       // Redirect to home page
//       window.location.href = "/home.html";
//     } catch (error: unknown) {
//       const errorMessage =
//         error instanceof Error ? error.message : "An unknown error occurred";
//       displayError(loginError, errorMessage);
  
//       // Reset login button
//       const loginButton = document.querySelector(
//         '#loginForm button[type="submit"]'
//       ) as HTMLButtonElement;
//       if (loginButton) {
//         loginButton.disabled = false;
//         loginButton.textContent = "Login";
//       }
//     }
//   }
  
//   // Function to handle signup form submission
//   async function handleSignup(e: Event): Promise<void> {
//     e.preventDefault();
  
//     const nameInput = document.getElementById("signupName") as HTMLInputElement;
//     const emailInput = document.getElementById("signupEmail") as HTMLInputElement;
//     const passwordInput = document.getElementById(
//       "signupPassword"
//     ) as HTMLInputElement;
//     const confirmPasswordInput = document.getElementById(
//       "confirmPassword"
//     ) as HTMLInputElement;
//     const agreeTermsCheckbox = document.getElementById(
//       "agreeTerms"
//     ) as HTMLInputElement;
  
//     // Validate form inputs
//     if (passwordInput.value !== confirmPasswordInput.value) {
//       displayError(signupError, "Passwords do not match");
//       return;
//     }
  
//     if (!agreeTermsCheckbox.checked) {
//       displayError(
//         signupError,
//         "You must agree to the Terms of Service and Privacy Policy"
//       );
//       return;
//     }
  
//     // Determine role ID (only borrower can register directly)
//     const role_id = ROLE_MAP.borrower;
  
//     const signupData: SignupData = {
//       name: nameInput.value,
//       email: emailInput.value,
//       password: passwordInput.value,
//       role_id: role_id,
//     };
  
//     try {
//       if (signupError) {
//         signupError.textContent = "";
//         signupError.style.display = "none";
//       }
  
//       // Show loading indicator
//       const signupButton = document.querySelector(
//         '#signupForm button[type="submit"]'
//       ) as HTMLButtonElement;
//       if (signupButton) {
//         signupButton.disabled = true;
//         signupButton.textContent = "Creating Account...";
//       }
  
//       const response = await fetch(`${AUTH_API_URL}/signup`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(signupData),
//       });
  
//       const data: AuthResponse = await response.json();
  
//       if (!response.ok) {
//         throw new Error(data.message || "Registration failed");
//       }
  
//       // Handle successful registration
//       if (data.token) {
//         localStorage.setItem("token", data.token);
//       }
  
//       if (data.user) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }
  
//       // Show success message and redirect
//       alert("Account created successfully! Redirecting to home page...");
//       window.location.href = "/home.html";
//     } catch (error: unknown) {
//       const errorMessage =
//         error instanceof Error ? error.message : "An unknown error occurred";
//       displayError(signupError, errorMessage);
  
//       // Reset signup button
//       const signupButton = document.querySelector(
//         '#signupForm button[type="submit"]'
//       ) as HTMLButtonElement;
//       if (signupButton) {
//         signupButton.disabled = false;
//         signupButton.textContent = "Sign Up";
//       }
//     }
//   }
  
//   // Function to display error messages
//   function displayError(element: HTMLElement | null, message: string): void {
//     if (element) {
//       element.textContent = message;
//       element.style.display = "block";
//     }
//   }
  
//   // Function to save user credentials for "Remember me" functionality
//   function saveUserCredentials(email: string): void {
//     localStorage.setItem("rememberedUser", email);
//   }
  
//   // Function to check for remembered user
//   function checkRememberedUser(): void {
//     const rememberedUser = localStorage.getItem("rememberedUser");
  
//     if (rememberedUser) {
//       const emailInput = document.getElementById(
//         "loginEmail"
//       ) as HTMLInputElement;
//       if (emailInput) {
//         emailInput.value = rememberedUser;
//         if (rememberMeCheckbox) {
//           rememberMeCheckbox.checked = true;
//         }
//       }
//     }
//   }
  
//   // Function to check if user is authenticated
//   function isAuthenticated(): boolean {
//     return localStorage.getItem("token") !== null;
//   }
  
//   // Function to get current user
//   function getCurrentUser(): User | null {
//     const userJson = localStorage.getItem("user");
//     return userJson ? JSON.parse(userJson) : null;
//   }
  
//   // Function to update UI based on authentication status
//   function updateUIBasedOnAuth(): void {
//     const isUserAuthenticated = isAuthenticated();
  
//     if (authStatusContainer) {
//       if (isUserAuthenticated) {
//         const user = getCurrentUser();
//         if (userInfo && user) {
//           userInfo.textContent = `Logged in as: ${user.user_name || user.email}`;
//           userInfo.style.display = "block";
//         }
  
//         // Show logout button
//         if (logoutButton) {
//           logoutButton.style.display = "block";
//         }
  
//         // Hide login links
//         loginLinks.forEach((link) => {
//           (link as HTMLElement).style.display = "none";
//         });
  
//         // Show auth required elements
//         authRequiredElements.forEach((element) => {
//           (element as HTMLElement).style.display = "block";
//         });
//       } else {
//         // Hide user info
//         if (userInfo) {
//           userInfo.style.display = "none";
//         }
  
//         // Hide logout button
//         if (logoutButton) {
//           logoutButton.style.display = "none";
//         }
  
//         // Show login links
//         loginLinks.forEach((link) => {
//           (link as HTMLElement).style.display = "block";
//         });
  
//         // Hide auth required elements
//         authRequiredElements.forEach((element) => {
//           (element as HTMLElement).style.display = "none";
//         });
//       }
//     }
//   }
  
//   // Make auth functions globally accessible
//   window.addEventListener("DOMContentLoaded", () => {
//     // Add auth functions to window object
//     (window as any).AuthModule = {
//       isAuthenticated,
//       getCurrentUser,
//       logout,
//       updateUIBasedOnAuth,
//     };
//   });
  
//   function logout(): void {
//     // Clear user data from memory
//     currentUser = null;
//     token = null;
//     localStorage.removeItem("token");
  
//     // Call your logout endpoint
//     fetch(`${API_URL}/logout`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include", // Include cookies if you're using cookie-based auth
//     })
//       .then((response) => {
//         if (response.ok) {
//           // Update UI
//           updateUIForLoggedOutUser();
  
//           // Redirect user to the specified URL
//           window.location.href = "http://localhost:5173/";
//         } else {
//           console.error("Logout failed:", response.status);
//         }
//       })
//       .catch((error) => {
//         console.error("Logout error:", error);
//       });
//   }
  
//   // Using a different name to avoid duplication with auth.ts
//   async function fetchCurrentUser(): Promise<boolean> {
//     try {
//       // Get token from localStorage
//       const storedToken = localStorage.getItem("token");
//       if (!storedToken) {
//         throw new Error("No authentication token found");
//       }
  
//       const response = await fetch(`${API_URL}/me`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${storedToken}`,
//           "Content-Type": "application/json",
//         },
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Authentication failed");
//       }
  
//       const userData = await response.json();
  
//       // Update current user data based on the response structure
//       currentUser = {
//         user_id: userData.user.userId, // Add user_id field to match the User interface
//         user_name: userData.user.name || "User", // Assuming name is returned, otherwise use a default
//         email: userData.user.email || "",
//         role_id: userData.user.roleId as 1 | 2 | 3,
//       };
  
//       // Update token if a new one is provided
//       if (userData.token) {
//         console.log(userData.token);
//         token = userData.token;
//         localStorage.getItem("token");
//       } else {
//         token = storedToken;
//       }
  
//       // Update UI
//       updateUIForLoggedInUser();
//       return true;
//     } catch (error) {
//       console.error("Getting current user failed:", error);
//       if (domElements.loginError) {
//         domElements.loginError.textContent =
//           error instanceof Error ? error.message : "Authentication failed";
//       }
//       return false;
//     }
//   }
//   async function checkAuth(): Promise<void> {
//     // Check if token exists in local storage
//     const token = localStorage.getItem("token");
//     if (!token) {
//       return;
//     }
  
//     try {
//       // Make sure API_URL is correctly set to your API's base URL
//       const response = await fetch(`${API_URL}/me`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });
  
//       if (!response.ok) {
//         throw new Error(`Authentication failed: ${response.status}`);
//       }
  
//       const data = await response.json();
//       console.log(data);
  
//       // Access the data correctly based on the server's response structure
//       const roleId = data.user.roleId; // Changed from data.role_id
//       console.log(roleId);
  
//       updateUIForLoggedInUser();
//     } catch (error) {
//       console.error("Auth check failed:", error);
//     }
//   }
  
//   function updateUIForLoggedInUser(): void {
//     if (!currentUser) return;
  
//     // Update the profile section
//     domElements.profileSection.innerHTML = `
//       <div class="user-profile">
//         <div class="user-image">
//           <img src="./Images/91.jpg" alt="user image" />
//         </div>
//         <div class="profile-details" id="details">
//           <h3>${currentUser.user_name || "User"}  </h3>
//           <p>${
//             currentUser.role_id === 1
//               ? "Admin"
//               : currentUser.role_id === 2
//               ? "Librarian"
//               : "Borrower"
//           } </p>
//         </div>
//       </div>
//     `;
  
//     // Show admin controls if user is admin
//     if (currentUser.role_id === 1) {
//       domElements.adminControls.style.display = "block";
//     } else {
//       domElements.adminControls.style.display = "none";
//     }
  
//     // Update profile modal if it exists
//     if (domElements.profileName) {
//       domElements.profileName.textContent = currentUser.user_name || "User";
//     }
//     if (domElements.profileEmail) {
//       domElements.profileEmail.textContent = currentUser.email || "";
//     }
//     if (domElements.userRole) {
//       domElements.userRole.textContent =
//         currentUser.role_id === 1
//           ? "Admin"
//           : currentUser.role_id === 2
//           ? "Librarian"
//           : "Borrower";
//     }
//   }
  
//   function updateUIForLoggedOutUser(): void {
//     domElements.adminControls.style.display = "none";
  
//     // Reattach event listeners since we replaced the HTML
//     document
//       .getElementById("loginBtn")
//       ?.addEventListener("click", showLoginModal);
//     document
//       .getElementById("signupBtn")
//       ?.addEventListener("click", showSignupModal);
//   }
  
//   function toggleUserDropdown(): void {
//     const dropdown = document.getElementById("userDropdown");
//     if (dropdown) {
//       dropdown.classList.toggle("active");
//     }
//   }
  
//   // Book CRUD operations
//   async function fetchBooks(page: number = 1): Promise<void> {
//     try {
//       showLoading();
  
//       const queryParams = new URLSearchParams({
//         ...currentFilters,
//         _page: page.toString(),
//         _limit: booksPerPage.toString(),
//       });
  
//       const url = `${API_URL}/books?${queryParams}`;
  
//       const response = await fetch(url);
//       if (!response.ok) throw new Error("Failed to fetch books");
  
//       const totalCount = response.headers.get("X-Total-Count");
//       totalPages = totalCount
//         ? Math.ceil(parseInt(totalCount) / booksPerPage)
//         : 1;
  
//       books = await response.json();
  
//       hideLoading();
//       displayBooks();
//     } catch (error) {
//       console.error("Error fetching books:", error);
//       hideLoading();
//       showNoResults();
//     }
//   }
  
//   function displayBooks(): void {
//     if (!domElements.bookList) return;
  
//     domElements.bookList.innerHTML = "";
  
//     if (books.length === 0) {
//       showNoResults();
//       return;
//     }
  
//     hideNoResults();
  
//     books.forEach((book) => {
//       const bookCard = document.createElement("div");
//       bookCard.className = "book-card";
  
//       const coverImg =
//         book.image && book.image.length > 0 ? book.image : "Images/book.png";
  
//       bookCard.innerHTML = `
//           <div class="book-cover">
//             <img src="${coverImg}" alt="${book.title}" onerror="this.src='Images/book.png'">
//           </div>
//           <div class="book-info">
//             <h3 class="book-title">${book.title}</h3>
//             <p class="book-author">by ${book.author}</p>
//             <div class="book-meta">
//               <span class="book-genre">${book.genre}</span>
//               <span class="book-year">${book.year}</span>
//             </div>
//             <div class="book-price">$${book.price}</div>
//           </div>
//           <div class="book-actions">
//               <button class="btn-icon view-details" data-id="${book.book_id}">
//                 <i class="fas fa-eye"></i>
//               </button>
//               <button class="btn-icon add-to-cart" data-id="${book.book_id}">
//                 <i class="fas fa-cart-plus"></i>
//               </button>
//               <button class="btn-icon add-to-wishlist" data-id="${book.book_id}">
//                 <i class="far fa-heart"></i>
//               </button>
//             </div>
//         `;
  
//       domElements.bookList.appendChild(bookCard);
  
//       // Add event listeners for book actions
//       bookCard
//         .querySelector(".view-details")
//         ?.addEventListener("click", () => showBookDetails(book.book_id));
//       bookCard
//         .querySelector(".add-to-cart")
//         ?.addEventListener("click", () => addToCart(book));
//       bookCard
//         .querySelector(".add-to-wishlist")
//         ?.addEventListener("click", (e) => toggleWishlist(e, book.book_id));
//     });
//   }
  
//   async function populateFilters(): Promise<void> {
//     await fetchBooks();
//     const genres = new Set<string>();
  
//     books.forEach((book) => genres.add(book.genre));
//     const genreFilter = document.getElementById(
//       "genreFilter"
//     ) as HTMLSelectElement;
//     if (!genreFilter) return;
  
//     genreFilter.innerHTML = '<option value="">All Genres</option>';
//     genres.forEach((genre) => {
//       const option = document.createElement("option");
//       option.value = genre;
//       option.textContent = genre;
//       genreFilter.appendChild(option);
//     });
//   }
  
//   function showBookDetails(bookId: number): void {
//     const book = books.find((b) => b.book_id === bookId);
//     if (!book) return;
  
//     domElements.bookDetailsContent.innerHTML = `
//         <div class="book-details">
//           <div class="book-details-cover">
//             <img src="${book.image || "Images/book.png"}" alt="${
//       book.title
//     }" onerror="this.src='Images/book.png'">
//           </div>
//           <div class="book-details-info">
//             <h2>${book.title}</h2>
//             <p class="author">by ${book.author}</p>
//             <div class="book-metadata">
//               <div class="metadata-item">
//                 <span class="label">Genre:</span>
//                 <span class="value">${book.genre}</span>
//               </div>
//               <div class="metadata-item">
//                 <span class="label">Published:</span>
//                 <span class="value">${book.year}</span>
//               </div>
//               <div class="metadata-item">
//                 <span class="label">Publisher:</span>
//                 <span class="value">${book.publisher}</span>
//               </div>
//               <div class="metadata-item">
//                 <span class="label">Pages:</span>
//                 <span class="value">${book.pages}</span>
//               </div>
//             </div>
//             <div class="book-price-section">
//               <div class="price">$${book.price}</div>
//               <button class="btn add-to-cart-btn" data-id="${book.book_id}">
//                 <i class="fas fa-cart-plus"></i> Add to Cart
//               </button>
//             </div>
//             <div class="book-description">
//               <h3>Description</h3>
//               <p>${book.description}</p>
//             </div>
//           </div>
//         </div>
//           `;
  
//     // Add event listener for the "Add to Cart" button in the details modal
//     domElements.bookDetailsContent
//       .querySelector(".add-to-cart-btn")
//       ?.addEventListener("click", () => addToCart(book));
  
//     // Show the book details modal
//     showModal(domElements.bookDetailsModal);
//   }
//   const addBookForm = document.getElementById("add-book-form") as HTMLFormElement;
//   addBookForm.addEventListener("submit", async (event) => {
//     event.preventDefault();
  
//     const formData = new FormData(addBookForm);
//     const bookData = {
//       title: formData.get("title"),
//       author: formData.get("author"),
//       genre: formData.get("genre"),
//       year: Number(formData.get("year")),
//       publisher: formData.get("publisher"),
//       description: formData.get("description"),
//       available_copies: Number(formData.get("available-copies")),
//       total_copies: Number(formData.get("total-copies")),
//       image: formData.get("image"),
//       price: Number(formData.get("price")),
//     };
  
//     try {
//       const response = await fetch("/books", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(bookData),
//       });
  
//       if (response.ok) {
//         alert("Book added successfully!");
//         addBookForm.reset();
//       } else {
//         alert("Failed to add book. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error adding book:", error);
//       alert("An error occurred. Please try again.");
//     }
//   });
//   function addToCart(book: Book): void {
//     const existingItem = cart.find((item) => item.id === book.book_id);
  
//     if (existingItem) {
//       existingItem.quantity += 1;
//     } else {
//       cart.push({
//         id: book.book_id,
//         title: book.title,
//         author: book.author,
//         price: book.price,
//         quantity: 1,
//         image: book.image,
//       });
//     }
//     updateCartUI();
//     showToast(`${book.title} added to cart!`);
//   }
  
//   function updateCartUI(): void {
//     const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
//     domElements.cartItems.textContent = totalItems.toString();
  
//     domElements.cartDetails.innerHTML = "";
//     domElements.cartDetails.className = "modal-body";
//     let totalPrice = 0;
  
//     cart.forEach((item) => {
//       const cartItem = document.createElement("div");
//       cartItem.className = "cart-item";
//       cartItem.innerHTML = `
//         <div class="cart-item-info">
//         <div class="dets">
//           <p><b>${item.title}</b> by ${item.author}</p>
//           <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
//         </div>
//         <div class="cart-item-quantity">
//           <button class="btn-icon decrease-quantity" data-id="${item.id}">
//           <i class="fas fa-minus"></i>
//           </button>
//           <span>${item.quantity}</span>
//           <button class="btn-icon increase-quantity" data-id="${item.id}">
//           <i class="fas fa-plus"></i>
//           </button>
//           <button class="btn-icon remove-item" data-id="${item.id}">
//           <i class="fas fa-trash"></i>
//           </button>
//         </div>
//         </div>
//       `;
  
//       domElements.cartDetails.appendChild(cartItem);
  
//       cartItem
//         .querySelector(".decrease-quantity")
//         ?.addEventListener("click", () => updateCartItemQuantity(item.id, -1));
//       cartItem
//         .querySelector(".increase-quantity")
//         ?.addEventListener("click", () => updateCartItemQuantity(item.id, 1));
//       cartItem
//         .querySelector(".remove-item")
//         ?.addEventListener("click", () => removeCartItem(item.id));
  
//       totalPrice += item.price * item.quantity;
//     });
  
//     domElements.cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
//     domElements.cartDetails.appendChild(domElements.cartTotal);
//   }
  
//   function updateCartItemQuantity(bookId: number, change: number): void {
//     const item = cart.find((item) => item.id === bookId);
//     if (!item) return;
  
//     item.quantity += change;
  
//     if (item.quantity <= 0) {
//       removeCartItem(bookId);
//     } else {
//       updateCartUI();
//     }
//   }
  
//   function removeCartItem(bookId: number): void {
//     cart = cart.filter((item) => item.id !== bookId);
//     updateCartUI();
//   }
  
//   function clearCart(): void {
//     cart = [];
//     updateCartUI();
//     showToast("Cart cleared!");
//   }
  
//   function checkout(): void {
//     if (cart.length === 0) {
//       showToast("Your cart is empty!");
//       return;
//     }
  
//     if (!currentUser) {
//       showToast("Please log in to proceed with checkout.");
//       showLoginModal();
//       return;
//     }
  
//     // Simulate checkout process
//     showToast("Checkout successful! Thank you for your purchase.");
//     clearCart();
//     closeCartModal();
//   }
  
//   // Wishlist functionality
//   function toggleWishlist(event: Event, bookId: number): void {
//     event.preventDefault();
//     if (!currentUser) {
//       showToast("Please log in to add to wishlist.");
//       showLoginModal();
//       return;
//     }
  
//     // Simulate wishlist toggle
//     showToast("Added to wishlist!");
//   }
  
//   // Modal functions
//   function showModal(modal: HTMLElement): void {
//     modal.style.display = "flex";
//   }
  
//   function closeModal(modal: HTMLElement): void {
//     modal.style.display = "none";
//   }
  
//   function showLoginModal(): void {
//     showModal(domElements.loginModal);
//   }
  
//   function closeLoginModal(): void {
//     closeModal(domElements.loginModal);
//   }
  
//   function showSignupModal(): void {
//     showModal(domElements.signupModal);
//   }
  
//   function closeSignupModal(): void {
//     closeModal(domElements.signupModal);
//   }
  
//   function showProfileModal(): void {
//     showModal(domElements.profileModal);
//   }
  
//   function closeProfileModal(): void {
//     closeModal(domElements.profileModal);
//   }
  
//   function showCartModal(): void {
//     showModal(domElements.cartModal);
//   }
  
//   function closeCartModal(): void {
//     closeModal(domElements.cartModal);
//   }
  
//   // Toast notifications
//   function showToast(
//     message: string,
//     type: "success" | "error" | "info" = "info"
//   ): void {
//     const toast = document.createElement("div");
//     toast.className = `toast ${type}`;
//     toast.textContent = message;
  
//     domElements.toastContainer.appendChild(toast);
  
//     setTimeout(() => {
//       toast.remove();
//     }, 3000);
//   }
  
//   // Loading and no results
//   function showLoading(): void {
//     domElements.loadingIndicator.style.display = "flex";
//   }
  
//   function hideLoading(): void {
//     domElements.loadingIndicator.style.display = "none";
//   }
  
//   function showNoResults(): void {
//     domElements.noResults.style.display = "flex";
//   }
  
//   function hideNoResults(): void {
//     domElements.noResults.style.display = "none";
//   }
  
//   // Event listeners
//   function attachEventListeners(): void {
//     // Search and filter
//     domElements.searchBtn.addEventListener("click", () => {
//       currentFilters.search = domElements.searchInput.value;
//       fetchBooks();
//     });
  
//     domElements.applyFilters.addEventListener("click", () => {
//       currentFilters.genre = domElements.genreFilter.value;
//       currentFilters.sortBy = domElements.sortBy.value;
//       fetchBooks();
//     });
  
//     domElements.resetFilters.addEventListener("click", () => {
//       currentFilters = {};
//       domElements.genreFilter.value = "";
//       domElements.sortBy.value = "title";
//       fetchBooks();
//     });
  
//     // Cart
//     domElements.cartBtn.addEventListener("click", showCartModal);
//     domElements.clearCartBtn.addEventListener("click", clearCart);
//     domElements.checkoutBtn.addEventListener("click", checkout);
  
//     // Auth
//     domElements.loginBtn?.addEventListener("click", showLoginModal);
//     domElements.signupBtn?.addEventListener("click", showSignupModal);
//     domElements.logoutBtn?.addEventListener("click", (e) => {
//       e.preventDefault();
//       console.log("Logout button pressed");
//       logout();
//       console.log("This is the user", currentUser);
//     });
  
//     // domElements.loginForm?.addEventListener("submit", async (e) => {
//     //   e.preventDefault();
//     //   const email = (document.getElementById("loginEmail") as HTMLInputElement)
//     //     .value;
//     //   const password = (
//     //     document.getElementById("loginPassword") as HTMLInputElement
//     //   ).value;
  
//     // });
  
//     // domElements.signupForm?.addEventListener("submit", async (e) => {
//     //   e.preventDefault();
//     //   const name = (document.getElementById("signupName") as HTMLInputElement)
//     //     .value;
//     //   const email = (document.getElementById("signupEmail") as HTMLInputElement)
//     //     .value;
//     //   const password = (
//     //     document.getElementById("signupPassword") as HTMLInputElement
//     //   ).value;
//     //   await signup(name, email, password);
//     // });
  
//     // domElements.switchToLogin?.addEventListener("click", (e) => {
//     //   e.preventDefault();
//     //   closeSignupModal();
//     //   showLoginModal();
//     // });
  
//     // domElements.switchToSignup?.addEventListener("click", (e) => {
//     //   e.preventDefault();
//     //   closeLoginModal();
//     //   showSignupModal();
//     // });
  
//     // Close modals
//     document.querySelectorAll(".close").forEach((closeBtn) => {
//       closeBtn.addEventListener("click", () => {
//         const modal = closeBtn.closest(".modal") as HTMLElement;
//         if (modal) closeModal(modal);
//       });
//     });
//   }
  
//   // Initialize app
//   async function init(): Promise<void> {
//     await fetchCurrentUser(); // Changed from getCurrentUser() to fetchCurrentUser()
//     await fetchBooks();
//     displayBooks();
//     populateFilters();
//     attachEventListeners();
//     updateUIForLoggedInUser();
//   }
  
//   // Start the app
//   document.addEventListener("DOMContentLoaded", () => {
//     init();
//   });
  