"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// API URL
const API_URL = "http://localhost:3000";
// Global state
let books = [];
let cart = [];
let currentUser = null;
let token = null;
let isEditMode = false;
let currentPage = 1;
let totalPages = 1;
let booksPerPage = 8;
let currentFilters = {};
// DOM Elements
const domElements = {
    bookList: document.getElementById("bookList"),
    searchInput: document.getElementById("searchInput"),
    searchBtn: document.getElementById("searchBtn"),
    genreFilter: document.getElementById("genreFilter"),
    sortBy: document.getElementById("sortBy"),
    orderBy: document.getElementById("orderBy"),
    minPrice: document.getElementById("minPrice"),
    maxPrice: document.getElementById("maxPrice"),
    applyFilters: document.getElementById("applyFilters"),
    resetFilters: document.getElementById("resetFilters"),
    cartItems: document.getElementById("cartItems"),
    cartBtn: document.getElementById("cartBtn"),
    cartModal: document.getElementById("cartModal"),
    cartDetails: document.getElementById("cartDetails"),
    cartTotal: document.getElementById("cartTotal"),
    clearCartBtn: document.getElementById("clearCartBtn"),
    checkoutBtn: document.getElementById("checkoutBtn"),
    bookModal: document.getElementById("bookModal"),
    bookForm: document.getElementById("bookForm"),
    bookId: document.getElementById("bookId"),
    bookModalTitle: document.getElementById("bookModalTitle"),
    addBookBtn: document.getElementById("addBookBtn"),
    manageBooks: document.getElementById("manageBooks"),
    adminControls: document.getElementById("adminControls"),
    loginBtn: document.getElementById("loginBtn"),
    signupBtn: document.getElementById("signupBtn"),
    authButtons: document.getElementById("authButtons"),
    loginModal: document.getElementById("loginModal"),
    signupModal: document.getElementById("signupModal"),
    profileModal: document.getElementById("profileModal"),
    loginForm: document.getElementById("loginForm"),
    signupForm: document.getElementById("signupForm"),
    switchToLogin: document.getElementById("switchToLogin"),
    switchToSignup: document.getElementById("switchToSignup"),
    userSection: document.getElementById("userSection"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById("profileEmail"),
    userRole: document.getElementById("userRole"),
    bookDetailsModal: document.getElementById("bookDetailsModal"),
    bookDetailsContent: document.getElementById("bookDetailsContent"),
    loadingIndicator: document.getElementById("loadingIndicator"),
    noResults: document.getElementById("noResults"),
    pagination: document.getElementById("pagination"),
    clearFiltersBtn: document.getElementById("clearFiltersBtn"),
    loginError: document.getElementById("loginError"),
    signupError: document.getElementById("signupError"),
    toastContainer: document.getElementById("toastContainer"),
};
// Auth functions
function checkAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if token exists in local storage
        token = localStorage.getItem("token");
        if (!token)
            return;
        try {
            const response = yield fetch(`${API_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Authentication failed");
            }
            const user = yield response.json();
            currentUser = user;
            updateUIForLoggedInUser();
        }
        catch (error) {
            console.error("Auth check failed:", error);
            logout();
        }
    });
}
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            domElements.loginError.textContent = "";
            const response = yield fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Login failed");
            }
            const authData = yield response.json();
            token = authData.token;
            currentUser = authData.user;
            // Save token to local storage
            localStorage.setItem("token", token);
            updateUIForLoggedInUser();
            closeLoginModal();
            return true;
        }
        catch (error) {
            console.error("Login failed:", error);
            domElements.loginError.textContent =
                error instanceof Error ? error.message : "Login failed";
            return false;
        }
    });
}
function signup(name, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            domElements.signupError.textContent = "";
            const response = yield fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Signup failed");
            }
            const authData = yield response.json();
            token = authData.token;
            currentUser = authData.user;
            // Save token to local storage
            localStorage.setItem("token", token);
            updateUIForLoggedInUser();
            closeSignupModal();
            return true;
        }
        catch (error) {
            console.error("Signup failed:", error);
            domElements.signupError.textContent =
                error instanceof Error ? error.message : "Signup failed";
            return false;
        }
    });
}
function logout() {
    currentUser = null;
    token = null;
    localStorage.removeItem("token");
    updateUIForLoggedOutUser();
}
function updateUIForLoggedInUser() {
    var _a, _b, _c;
    if (!currentUser)
        return;
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
        ${currentUser.role === "admin"
        ? `
          <div class="dropdown-item admin-item">
            <i class="fas fa-cog"></i> Admin Panel
          </div>
        `
        : ""}
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
    (_a = document
        .getElementById("userProfileButton")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", toggleUserDropdown);
    (_b = document
        .getElementById("viewProfileBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", showProfileModal);
    (_c = document.getElementById("logoutBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", logout);
    // Update profile modal
    domElements.profileName.textContent = currentUser.name;
    domElements.profileEmail.textContent = currentUser.email;
    domElements.userRole.textContent =
        currentUser.role === "admin" ? "Administrator" : "Member";
}
function updateUIForLoggedOutUser() {
    var _a, _b;
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
    (_a = document
        .getElementById("loginBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", showLoginModal);
    (_b = document
        .getElementById("signupBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", showSignupModal);
}
function toggleUserDropdown() {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) {
        dropdown.classList.toggle("active");
    }
}
// Book CRUD operations
function fetchBooks() {
    return __awaiter(this, arguments, void 0, function* (page = 1) {
        try {
            showLoading();
            const queryParams = new URLSearchParams(Object.assign(Object.assign({}, currentFilters), { _page: page.toString(), _limit: booksPerPage.toString() }));
            const url = `${API_URL}/books?${queryParams}`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error("Failed to fetch books");
            const totalCount = response.headers.get("X-Total-Count");
            totalPages = totalCount
                ? Math.ceil(parseInt(totalCount) / booksPerPage)
                : 1;
            books = yield response.json();
            hideLoading();
            displayBooks();
            updatePagination();
        }
        catch (error) {
            console.error("Error fetching books:", error);
            hideLoading();
            showNoResults();
        }
    });
}
function displayBooks() {
    if (!domElements.bookList)
        return;
    domElements.bookList.innerHTML = "";
    if (books.length === 0) {
        showNoResults();
        return;
    }
    hideNoResults();
    books.forEach((book) => {
        var _a, _b, _c;
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        // bookCard.dataset.id = book.id;
        const coverImg = book.image && book.image.length > 0 ? book.image : "Images/book.png";
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
        (_a = bookCard
            .querySelector(".view-details")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => showBookDetails(book.id));
        (_b = bookCard
            .querySelector(".add-to-cart")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => addToCart(book));
        (_c = bookCard
            .querySelector(".add-to-wishlist")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (e) => toggleWishlist(e, book.id));
    });
}
function populateFilters() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetchBooks();
        const genres = new Set();
        books.forEach((book) => genres.add(book.genre));
        const genreFilter = document.getElementById("genreFilter");
        if (!genreFilter)
            return;
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        genres.forEach((genre) => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    });
}
function showBookDetails(bookId) {
    var _a;
    const book = books.find((b) => b.id === bookId);
    if (!book)
        return;
    domElements.bookDetailsContent.innerHTML = `
      <div class="book-details">
        <div class="book-details-cover">
          <img src="${book.image || "Images/book.png"}" alt="${book.title}" onerror="this.src='Images/book.png'">
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
    (_a = domElements.bookDetailsContent
        .querySelector(".add-to-cart-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => addToCart(book));
    // Show the book details modal
    showModal(domElements.bookDetailsModal);
}
function addToCart(book) {
    const existingItem = cart.find((item) => item.id === book.id);
    if (existingItem) {
        existingItem.quantity += 1;
    }
    else {
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
function updateCartUI() {
    // Update cart badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    domElements.cartItems.textContent = totalItems.toString();
    // Update cart modal content
    domElements.cartDetails.innerHTML = "";
    let totalPrice = 0;
    cart.forEach((item) => {
        var _a, _b, _c;
        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image || "Images/book.png"}" alt="${item.title}" onerror="this.src='Images/book.png'">
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
        (_a = cartItem
            .querySelector(".decrease-quantity")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => updateCartItemQuantity(item.id, -1));
        (_b = cartItem
            .querySelector(".increase-quantity")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => updateCartItemQuantity(item.id, 1));
        (_c = cartItem
            .querySelector(".remove-item")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => removeCartItem(item.id));
        totalPrice += item.price * item.quantity;
    });
    // Update total price
    domElements.cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
}
function updateCartItemQuantity(bookId, change) {
    const item = cart.find((item) => item.id === bookId);
    if (!item)
        return;
    item.quantity += change;
    if (item.quantity <= 0) {
        removeCartItem(bookId);
    }
    else {
        updateCartUI();
    }
}
function removeCartItem(bookId) {
    cart = cart.filter((item) => item.id !== bookId);
    updateCartUI();
}
function clearCart() {
    cart = [];
    updateCartUI();
    showToast("Cart cleared!");
}
function checkout() {
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
function toggleWishlist(event, bookId) {
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
function updatePagination() {
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
function showModal(modal) {
    modal.style.display = "flex";
}
function closeModal(modal) {
    modal.style.display = "none";
}
function showLoginModal() {
    showModal(domElements.loginModal);
}
function closeLoginModal() {
    closeModal(domElements.loginModal);
}
function showSignupModal() {
    showModal(domElements.signupModal);
}
function closeSignupModal() {
    closeModal(domElements.signupModal);
}
function showProfileModal() {
    showModal(domElements.profileModal);
}
function closeProfileModal() {
    closeModal(domElements.profileModal);
}
function showCartModal() {
    showModal(domElements.cartModal);
}
function closeCartModal() {
    closeModal(domElements.cartModal);
}
// Toast notifications
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    domElements.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
// Loading and no results
function showLoading() {
    domElements.loadingIndicator.style.display = "flex";
}
function hideLoading() {
    domElements.loadingIndicator.style.display = "none";
}
function showNoResults() {
    domElements.noResults.style.display = "flex";
}
function hideNoResults() {
    domElements.noResults.style.display = "none";
}
// Event listeners
function attachEventListeners() {
    // Search and filter
    domElements.searchBtn.addEventListener("click", () => {
        currentFilters.search = domElements.searchInput.value;
        fetchBooks();
    });
    domElements.searchBtn.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            currentFilters.search = domElements.searchInput.value;
            fetchBooks();
        }
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
    domElements.loginForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const email = document.getElementById("loginEmail")
            .value;
        const password = document.getElementById("loginPassword").value;
        yield login(email, password);
    }));
    domElements.signupForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById("signupName")
            .value;
        const email = document.getElementById("signupEmail")
            .value;
        const password = document.getElementById("signupPassword").value;
        yield signup(name, email, password);
    }));
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
            const modal = closeBtn.closest(".modal");
            closeModal(modal);
        });
    });
}
// Initialize app
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield checkAuth();
        fetchBooks();
        populateFilters();
        attachEventListeners();
    });
}
// Start the app
init();
//# sourceMappingURL=index.js.map