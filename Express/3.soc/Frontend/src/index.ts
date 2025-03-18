// Types and Interfaces
interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  price: number;
  description: string;
  image: string;
  publisher: string;
}

interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  image: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthResponse {
  user: User;
  token: string;
}

// API URL
const API_URL = "http://localhost:3000";

// Global state
let books: Book[] = [];
let cart: CartItem[] = [];
let currentUser: User | null = null;
let token: string | null = null;
let isEditMode = false;
let currentPage = 1;
let totalPages = 1;
let booksPerPage = 8;
let currentFilters: Record<string, any> = {};

// DOM Elements
const domElements = {
  bookList: document.getElementById("bookList") as HTMLDivElement,
  searchInput: document.getElementById("searchInput") as HTMLInputElement,
  searchBtn: document.getElementById("searchBtn") as HTMLButtonElement,
  genreFilter: document.getElementById("genreFilter") as HTMLSelectElement,
  sortBy: document.getElementById("sortBy") as HTMLSelectElement,
  orderBy: document.getElementById("orderBy") as HTMLSelectElement,
  minPrice: document.getElementById("minPrice") as HTMLInputElement,
  maxPrice: document.getElementById("maxPrice") as HTMLInputElement,
  applyFilters: document.getElementById("applyFilters") as HTMLButtonElement,
  resetFilters: document.getElementById("resetFilters") as HTMLButtonElement,
  cartItems: document.getElementById("cartItems") as HTMLSpanElement,
  cartBtn: document.getElementById("cartBtn") as HTMLButtonElement,
  cartModal: document.getElementById("cartModal") as HTMLDivElement,
  cartDetails: document.getElementById("cartDetails") as HTMLDivElement,
  cartTotal: document.getElementById("cartTotal") as HTMLParagraphElement,
  clearCartBtn: document.getElementById("clearCartBtn") as HTMLButtonElement,
  checkoutBtn: document.getElementById("checkoutBtn") as HTMLButtonElement,
  bookModal: document.getElementById("bookModal") as HTMLDivElement,
  bookForm: document.getElementById("bookForm") as HTMLFormElement,
  bookId: document.getElementById("bookId") as HTMLInputElement,
  bookModalTitle: document.getElementById(
    "bookModalTitle"
  ) as HTMLHeadingElement,
  addBookBtn: document.getElementById("addBookBtn") as HTMLButtonElement,
  manageBooks: document.getElementById("manageBooks") as HTMLButtonElement,
  adminControls: document.getElementById("adminControls") as HTMLDivElement,
  loginBtn: document.getElementById("loginBtn") as HTMLButtonElement,
  signupBtn: document.getElementById("signupBtn") as HTMLButtonElement,
  authButtons: document.getElementById("authButtons") as HTMLDivElement,
  loginModal: document.getElementById("loginModal") as HTMLDivElement,
  signupModal: document.getElementById("signupModal") as HTMLDivElement,
  profileModal: document.getElementById("profileModal") as HTMLDivElement,
  loginForm: document.getElementById("loginForm") as HTMLFormElement,
  signupForm: document.getElementById("signupForm") as HTMLFormElement,
  switchToLogin: document.getElementById("switchToLogin") as HTMLAnchorElement,
  switchToSignup: document.getElementById(
    "switchToSignup"
  ) as HTMLAnchorElement,
  userSection: document.getElementById("userSection") as HTMLDivElement,
  profileName: document.getElementById("profileName") as HTMLHeadingElement,
  profileEmail: document.getElementById("profileEmail") as HTMLParagraphElement,
  userRole: document.getElementById("userRole") as HTMLSpanElement,
  bookDetailsModal: document.getElementById(
    "bookDetailsModal"
  ) as HTMLDivElement,
  bookDetailsContent: document.getElementById(
    "bookDetailsContent"
  ) as HTMLDivElement,
  loadingIndicator: document.getElementById(
    "loadingIndicator"
  ) as HTMLDivElement,
  noResults: document.getElementById("noResults") as HTMLDivElement,
  pagination: document.getElementById("pagination") as HTMLDivElement,
  clearFiltersBtn: document.getElementById(
    "clearFiltersBtn"
  ) as HTMLButtonElement,
  loginError: document.getElementById("loginError") as HTMLDivElement,
  signupError: document.getElementById("signupError") as HTMLDivElement,
  toastContainer: document.getElementById("toastContainer") as HTMLDivElement,
};

// Auth functions
async function checkAuth(): Promise<void> {
  // Check if token exists in local storage
  token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const user = await response.json();
    currentUser = user;
    updateUIForLoggedInUser();
  } catch (error) {
    console.error("Auth check failed:", error);
    logout();
  }
}

async function login(email: string, password: string): Promise<boolean> {
  try {
    domElements.loginError.textContent = "";

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const authData: AuthResponse = await response.json();
    token = authData.token;
    currentUser = authData.user;

    // Save token to local storage
    localStorage.setItem("token", token);

    updateUIForLoggedInUser();
    closeLoginModal();
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    domElements.loginError.textContent =
      error instanceof Error ? error.message : "Login failed";
    return false;
  }
}

async function signup(
  name: string,
  email: string,
  password: string
): Promise<boolean> {
  try {
    domElements.signupError.textContent = "";

    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Signup failed");
    }

    const authData: AuthResponse = await response.json();
    token = authData.token;
    currentUser = authData.user;

    // Save token to local storage
    localStorage.setItem("token", token);

    updateUIForLoggedInUser();
    closeSignupModal();
    return true;
  } catch (error) {
    console.error("Signup failed:", error);
    domElements.signupError.textContent =
      error instanceof Error ? error.message : "Signup failed";
    return false;
  }
}

function logout(): void {
  currentUser = null;
  token = null;
  localStorage.removeItem("token");
  updateUIForLoggedOutUser();
}

function updateUIForLoggedInUser(): void {
  if (!currentUser) return;

  // Update navbar
  domElements.authButtons.style.display = "none";
  domElements.userSection.innerHTML = `
      <div class="user-profile" id="userProfileButton">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-info">
          <p class="user-name">${currentUser.name}</p>
          <p class="user-email">${currentUser.email}</p>
        </div>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="user-dropdown" id="userDropdown">
        <div class="dropdown-item" id="viewProfileBtn">
          <i class="fas fa-user"></i> Profile
        </div>
        <div class="dropdown-item">
          <i class="fas fa-bookmark"></i> My Wishlist
        </div>
        <div class="dropdown-item">
          <i class="fas fa-shopping-bag"></i> Orders
        </div>
        ${
          currentUser.role === "admin"
            ? `
          <div class="dropdown-item admin-item">
            <i class="fas fa-cog"></i> Admin Panel
          </div>
        `
            : ""
        }
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" id="logoutBtn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </div>
      </div>
    `;

  // Show admin controls if user is admin
  if (currentUser.role === "admin") {
    domElements.adminControls.style.display = "block";
  }

  // Add event listeners for new elements
  document
    .getElementById("userProfileButton")
    ?.addEventListener("click", toggleUserDropdown);
  document
    .getElementById("viewProfileBtn")
    ?.addEventListener("click", showProfileModal);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  // Update profile modal
  domElements.profileName.textContent = currentUser.name;
  domElements.profileEmail.textContent = currentUser.email;
  domElements.userRole.textContent =
    currentUser.role === "admin" ? "Administrator" : "Member";
}

function updateUIForLoggedOutUser(): void {
  domElements.authButtons.style.display = "flex";
  domElements.userSection.innerHTML = `
      <div class="auth-buttons" id="authButtons">
        <button id="loginBtn" class="btn btn-outline"><i class="fas fa-sign-in-alt"></i> Login</button>
        <button id="signupBtn" class="btn"><i class="fas fa-user-plus"></i> Sign Up</button>
      </div>
    `;

  // Hide admin controls
  domElements.adminControls.style.display = "none";

  // Reattach event listeners
  document
    .getElementById("loginBtn")
    ?.addEventListener("click", showLoginModal);
  document
    .getElementById("signupBtn")
    ?.addEventListener("click", showSignupModal);
}

function toggleUserDropdown(): void {
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
  }
}

// Book CRUD operations
async function fetchBooks(page: number = 1): Promise<void> {
  try {
    showLoading();

    const queryParams = new URLSearchParams({
      ...currentFilters,
      _page: page.toString(),
      _limit: booksPerPage.toString(),
    });

    const url = `${API_URL}/books?${queryParams}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch books");

    const totalCount = response.headers.get("X-Total-Count");
    totalPages = totalCount
      ? Math.ceil(parseInt(totalCount) / booksPerPage)
      : 1;

    books = await response.json();

    hideLoading();
    displayBooks();
    updatePagination();
  } catch (error) {
    console.error("Error fetching books:", error);
    hideLoading();
    showNoResults();
  }
}

function displayBooks(): void {
  if (!domElements.bookList) return;

  domElements.bookList.innerHTML = "";

  if (books.length === 0) {
    showNoResults();
    return;
  }

  hideNoResults();

  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
    // bookCard.dataset.id = book.id;

    const coverImg =
      book.image && book.image.length > 0 ? book.image : "Images/book.png";

    bookCard.innerHTML = `
        <div class="book-cover">
          <img src="${coverImg}" alt="${book.title}" onerror="this.src='Images/book.png'">
          
        </div>
        <div class="book-info">
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">by ${book.author}</p>
          <div class="book-meta">
            <span class="book-genre">${book.genre}</span>
            <span class="book-year">${book.year}</span>
          </div>
          <div class="book-price">$${book.price}</div>
        </div>
        <div class="book-actions">
            <button class="btn-icon view-details" data-id="${book.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon add-to-cart" data-id="${book.id}">
              <i class="fas fa-cart-plus"></i>
            </button>
            <button class="btn-icon add-to-wishlist" data-id="${book.id}">
              <i class="far fa-heart"></i>
            </button>
          </div>
      `;

    domElements.bookList.appendChild(bookCard);

    // Add event listeners for book actions
    bookCard
      .querySelector(".view-details")
      ?.addEventListener("click", () => showBookDetails(book.id));
    bookCard
      .querySelector(".add-to-cart")
      ?.addEventListener("click", () => addToCart(book));
    bookCard
      .querySelector(".add-to-wishlist")
      ?.addEventListener("click", (e) => toggleWishlist(e, book.id));
  });
}

async function populateFilters(): Promise<void> {
  await fetchBooks();
  const genres = new Set<string>();

  books.forEach((book) => genres.add(book.genre));
  const genreFilter = document.getElementById(
    "genreFilter"
  ) as HTMLSelectElement;
  if (!genreFilter) return;

  genreFilter.innerHTML = '<option value="">All Genres</option>';
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

function showBookDetails(bookId: number): void {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  domElements.bookDetailsContent.innerHTML = `
      <div class="book-details">
        <div class="book-details-cover">
          <img src="${book.image || "Images/book.png"}" alt="${
    book.title
  }" onerror="this.src='Images/book.png'">
        </div>
        <div class="book-details-info">
          <h2>${book.title}</h2>
          <p class="author">by ${book.author}</p>
          <div class="book-metadata">
            <div class="metadata-item">
              <span class="label">Genre:</span>
              <span class="value">${book.genre}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Published:</span>
              <span class="value">${book.year}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Publisher:</span>
              <span class="value">${book.publisher}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Pages:</span>
              <span class="value">${book.pages}</span>
            </div>
          </div>
          <div class="book-price-section">
            <div class="price">$${book.price.toFixed(2)}</div>
            <button class="btn add-to-cart-btn" data-id="${book.id}">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
          <div class="book-description">
            <h3>Description</h3>
            <p>${book.description}</p>
          </div>
        </div>
      </div>
        `;

  // Add event listener for the "Add to Cart" button in the details modal
  domElements.bookDetailsContent
    .querySelector(".add-to-cart-btn")
    ?.addEventListener("click", () => addToCart(book));

  // Show the book details modal
  showModal(domElements.bookDetailsModal);
}

function addToCart(book: Book): void {
  const existingItem = cart.find((item) => item.id === book.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: 1,
      image: book.image,
    });
  }

  updateCartUI();
  showToast(`${book.title} added to cart!`);
}

function updateCartUI(): void {
  // Update cart badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  domElements.cartItems.textContent = totalItems.toString();

  // Update cart modal content
  domElements.cartDetails.innerHTML = "";
  let totalPrice = 0;

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image || "Images/book.png"}" alt="${
      item.title
    }" onerror="this.src='Images/book.png'">
        </div>
        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <p>by ${item.author}</p>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-quantity">
            <button class="btn-icon decrease-quantity" data-id="${item.id}">
              <i class="fas fa-minus"></i>
            </button>
            <span>${item.quantity}</span>
            <button class="btn-icon increase-quantity" data-id="${item.id}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <button class="btn-icon remove-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      `;

    domElements.cartDetails.appendChild(cartItem);

    // Add event listeners for quantity controls
    cartItem
      .querySelector(".decrease-quantity")
      ?.addEventListener("click", () => updateCartItemQuantity(item.id, -1));
    cartItem
      .querySelector(".increase-quantity")
      ?.addEventListener("click", () => updateCartItemQuantity(item.id, 1));
    cartItem
      .querySelector(".remove-item")
      ?.addEventListener("click", () => removeCartItem(item.id));

    totalPrice += item.price * item.quantity;
  });

  // Update total price
  domElements.cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
}

function updateCartItemQuantity(bookId: number, change: number): void {
  const item = cart.find((item) => item.id === bookId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeCartItem(bookId);
  } else {
    updateCartUI();
  }
}

function removeCartItem(bookId: number): void {
  cart = cart.filter((item) => item.id !== bookId);
  updateCartUI();
}

function clearCart(): void {
  cart = [];
  updateCartUI();
  showToast("Cart cleared!");
}

function checkout(): void {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  if (!currentUser) {
    showToast("Please log in to proceed with checkout.");
    showLoginModal();
    return;
  }

  // Simulate checkout process
  showToast("Checkout successful! Thank you for your purchase.");
  clearCart();
  closeCartModal();
}

// Wishlist functionality
function toggleWishlist(event: Event, bookId: number): void {
  event.preventDefault();
  if (!currentUser) {
    showToast("Please log in to add to wishlist.");
    showLoginModal();
    return;
  }

  // Simulate wishlist toggle
  showToast("Added to wishlist!");
}

// Pagination
function updatePagination(): void {
  domElements.pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.className = `btn ${i === currentPage ? "active" : ""}`;
    pageButton.textContent = i.toString();
    pageButton.addEventListener("click", () => {
      currentPage = i;
      fetchBooks(currentPage);
    });

    domElements.pagination.appendChild(pageButton);
  }
}

// Modal functions
function showModal(modal: HTMLElement): void {
  modal.style.display = "flex";
}

function closeModal(modal: HTMLElement): void {
  modal.style.display = "none";
}

function showLoginModal(): void {
  showModal(domElements.loginModal);
}

function closeLoginModal(): void {
  closeModal(domElements.loginModal);
}

function showSignupModal(): void {
  showModal(domElements.signupModal);
}

function closeSignupModal(): void {
  closeModal(domElements.signupModal);
}

function showProfileModal(): void {
  showModal(domElements.profileModal);
}

function closeProfileModal(): void {
  closeModal(domElements.profileModal);
}

function showCartModal(): void {
  showModal(domElements.cartModal);
}

function closeCartModal(): void {
  closeModal(domElements.cartModal);
}

// Toast notifications
function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
): void {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  domElements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Loading and no results
function showLoading(): void {
  domElements.loadingIndicator.style.display = "flex";
}

function hideLoading(): void {
  domElements.loadingIndicator.style.display = "none";
}

function showNoResults(): void {
  domElements.noResults.style.display = "flex";
}

function hideNoResults(): void {
  domElements.noResults.style.display = "none";
}

// Event listeners
function attachEventListeners(): void {
  // Search and filter
  domElements.searchBtn.addEventListener("click", () => {
    currentFilters.search = domElements.searchInput.value;
    fetchBooks();
  });

  domElements.applyFilters.addEventListener("click", () => {
    currentFilters.genre = domElements.genreFilter.value;
    currentFilters.sortBy = domElements.sortBy.value;
    currentFilters.orderBy = domElements.orderBy.value;
    currentFilters.minPrice = domElements.minPrice.value;
    currentFilters.maxPrice = domElements.maxPrice.value;
    fetchBooks();
  });

  domElements.resetFilters.addEventListener("click", () => {
    currentFilters = {};
    domElements.genreFilter.value = "";
    domElements.sortBy.value = "title";
    domElements.orderBy.value = "asc";
    domElements.minPrice.value = "";
    domElements.maxPrice.value = "";
    fetchBooks();
  });

  // Cart
  domElements.cartBtn.addEventListener("click", showCartModal);
  domElements.clearCartBtn.addEventListener("click", clearCart);
  domElements.checkoutBtn.addEventListener("click", checkout);

  // Auth
  domElements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("loginEmail") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("loginPassword") as HTMLInputElement
    ).value;
    await login(email, password);
  });

  domElements.signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (document.getElementById("signupName") as HTMLInputElement)
      .value;
    const email = (document.getElementById("signupEmail") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("signupPassword") as HTMLInputElement
    ).value;
    await signup(name, email, password);
  });

  domElements.switchToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    closeSignupModal();
    showLoginModal();
  });

  domElements.switchToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    closeLoginModal();
    showSignupModal();
  });

  // Close modals
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      const modal = closeBtn.closest(".modal") as HTMLElement;
      closeModal(modal);
    });
  });
}

// Initialize app
async function init(): Promise<void> {
  await checkAuth();
  fetchBooks();
  populateFilters();
  attachEventListeners();
}

// Start the app
init();
