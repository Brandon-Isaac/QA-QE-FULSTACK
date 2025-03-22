"use strict";
// index.ts - Frontend for Datches Library Management System
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// API Base URL
const API_BASE_URL = "http://localhost:3000";
// State management
let currentUser = null;
let books = [];
let filteredBooks = [];
let cart = [];
// DOM Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const bookSection = document.getElementById("bookSection");
const userSection = document.getElementById("userSection");
const bookList = document.getElementById("bookList");
const cartIcon = document.getElementById("cartIcon");
const cartCount = document.getElementById("cartCount");
const cartDropdown = document.getElementById("cartDropdown");
const cartItems = document.getElementById("cartItems");
const clearCartBtn = document.getElementById("clearCartBtn");
const borrowBooksBtn = document.getElementById("borrowBooksBtn");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");
const filterGenre = document.getElementById("filterGenre");
const sortOptions = document.getElementById("sortOptions");
const addBookBtn = document.getElementById("addBookBtn");
const userInfo = document.getElementById("userInfo");
const notification = document.getElementById("notification");
const bookFormModal = document.getElementById("bookFormModal");
const bookForm = document.getElementById("bookForm");
const closeModal = document.getElementById("closeModal");
// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in (token in cookies/localStorage)
    checkAuthStatus();
    // Event Listeners
    setupEventListeners();
});
// Check authentication status
function checkAuthStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = localStorage.getItem("access_token");
        if (!token) {
            showLoginPage();
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Authentication failed");
            }
            const data = yield response.json();
            localStorage.setItem("access_token", data.access_token);
            // Fetch user data
            yield fetchUserData();
            // Show main application
            showMainApp();
        }
        catch (error) {
            console.error("Auth check failed:", error);
            showLoginPage();
        }
    });
}
// Fetch current user data
function fetchUserData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE_URL}/api/user/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            const userData = yield response.json();
            currentUser = userData;
            updateUserUI();
        }
        catch (error) {
            console.error("Fetch user data failed:", error);
            logout();
        }
    });
}
// Update user interface with user info
function updateUserUI() {
    if (!currentUser || !userInfo)
        return;
    userInfo.innerHTML = `
    <div class="user-details">
      <h3>Welcome, ${currentUser.name}</h3>
      <p>Role: ${currentUser.role_name}</p>
      <p>Email: ${currentUser.email}</p>
    </div>
  `;
    // Show/hide admin/librarian-only buttons based on user role
    const isAdminOrLibrarian = currentUser.role_id === 1 || currentUser.role_id === 2;
    if (addBookBtn) {
        addBookBtn.style.display = isAdminOrLibrarian ? "block" : "none";
    }
}
// Login functionality
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Login failed");
            }
            const data = yield response.json();
            // Store tokens
            localStorage.setItem("access_token", data.tokens.access_token);
            // Store user data
            currentUser = data.user;
            // Show main application
            showMainApp();
            return true;
        }
        catch (error) {
            console.error("Login failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
            return false;
        }
    });
}
// Register functionality
function register(name, email, password, role_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, role_id }),
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Registration failed");
            }
            showNotification("Registration successful! Please login.");
            return true;
        }
        catch (error) {
            console.error("Registration failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
            return false;
        }
    });
}
// Logout functionality
function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
        }
        catch (error) {
            console.error("Logout error:", error);
        }
        finally {
            // Clear local storage and cookies
            localStorage.removeItem("access_token");
            currentUser = null;
            cart = [];
            // Show login page
            showLoginPage();
        }
    });
}
// Fetch all books
function fetchBooks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE_URL}/api/books/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch books");
            }
            const data = yield response.json();
            books = data;
            filteredBooks = [...books];
            renderBooks();
            populateGenreFilter();
        }
        catch (error) {
            console.error("Fetch books failed:", error);
            showNotification("Failed to load books. Please try again later.");
        }
    });
}
// Render books to the book list
function renderBooks() {
    currentPage = 1;
    renderPaginatedBooks();
    setupPagination();
    if (!bookList)
        return;
    bookList.innerHTML = "";
    if (filteredBooks.length === 0) {
        bookList.innerHTML =
            '<p class="no-books">No books found matching your criteria.</p>';
        return;
    }
    filteredBooks.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.innerHTML = `
      <div class="book-image">
        <img src="${book.image || "placeholder.jpg"}" alt="${book.title}">
      </div>
      <div class="book-info">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Genre:</strong> ${book.genre}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><strong>Price:</strong> $${book.price}</p>
      </div>
      <div class="book-actions">
        <button class="btn view-btn" data-id="${book.book_id}">View Details</button>
        <button class="btn add-to-cart-btn" data-id="${book.book_id}">Add to Cart</button>
        ${currentUser &&
            (currentUser.role_id === 1 || currentUser.role_id === 2)
            ? `<button class="btn edit-btn" data-id="${book.book_id}">Edit</button>
           <button class="btn delete-btn" data-id="${book.book_id}">Delete</button>`
            : ""}
      </div>
    `;
        bookList.appendChild(bookCard);
    });
    // Add event listeners to action buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            viewBookDetails(Number(bookId));
        });
    });
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            addToCart(Number(bookId));
        });
    });
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            editBook(Number(bookId));
        });
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            deleteBook(Number(bookId));
        });
    });
}
// Populate genre filter from available books
function populateGenreFilter() {
    if (!filterGenre)
        return;
    // Clear existing options except the first one
    const defaultOption = filterGenre.options[0];
    filterGenre.innerHTML = "";
    filterGenre.appendChild(defaultOption);
    // Get unique genres
    const genres = [...new Set(books.map((book) => book.genre))];
    // Add genre options
    genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        filterGenre.appendChild(option);
    });
}
// Filter books based on search, genre, etc.
function filterBooks() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedGenre = filterGenre ? filterGenre.value : "";
    filteredBooks = books.filter((book) => {
        // Filter by search term
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.description.toLowerCase().includes(searchTerm);
        // Filter by genre
        const matchesGenre = selectedGenre === "" || book.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });
    sortBooks();
    renderBooks();
}
// Sort books based on selected option
function sortBooks() {
    const sortBy = sortOptions ? sortOptions.value : "";
    switch (sortBy) {
        case "title-asc":
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "title-desc":
            filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case "price-asc":
            filteredBooks.sort((a, b) => a.price - b.price);
            break;
        case "price-desc":
            filteredBooks.sort((a, b) => b.price - a.price);
            break;
        case "year-asc":
            filteredBooks.sort((a, b) => a.year - b.year);
            break;
        case "year-desc":
            filteredBooks.sort((a, b) => b.year - a.year);
            break;
        default:
            // No sorting or default sort
            break;
    }
    renderBooks();
}
// View book details
function viewBookDetails(bookId) {
    const book = books.find((b) => b.book_id === bookId);
    if (!book)
        return;
    // Create and show modal with book details
    const modal = document.createElement("div");
    modal.className = "modal book-details-modal";
    modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <div class="book-details">
        <div class="book-image">
          <img src="${book.image || "placeholder.jpg"}" alt="${book.title}">
        </div>
        <div class="book-info">
          <h2>${book.title}</h2>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Genre:</strong> ${book.genre}</p>
          <p><strong>Year:</strong> ${book.year}</p>
          <p><strong>Pages:</strong> ${book.pages}</p>
          <p><strong>Publisher:</strong> ${book.publisher}</p>
          <p><strong>Price:</strong> $${book.price}</p>
          <p><strong>Description:</strong> ${book.description}</p>
        </div>
        <div class="book-actions">
          <button class="btn add-to-cart-btn" data-id="${book.book_id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    // Add event listeners
    const closeBtn = modal.querySelector(".close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.body.removeChild(modal);
        });
    }
    const addToCartBtn = modal.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            addToCart(bookId);
        });
    }
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}
// Add book to cart
function addToCart(bookId) {
    if (!currentUser) {
        showNotification("Please login to add books to cart");
        return;
    }
    const book = books.find((b) => b.book_id === bookId);
    if (!book)
        return;
    // Check if book is already in cart
    const existingItem = cart.find((item) => item.book.book_id === bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    }
    else {
        cart.push({ book, quantity: 1 });
    }
    updateCartUI();
    showNotification(`"${book.title}" added to cart`);
}
// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems.toString();
        cartCount.style.display = totalItems > 0 ? "block" : "none";
    }
    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = "";
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }
        cart.forEach((item) => {
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.book.title}</h4>
          <p>Price: $${item.book.price}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn decrease" data-id="${item.book.book_id}">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn increase" data-id="${item.book.book_id}">+</button>
        </div>
        <div class="cart-item-total">
          $${(item.book.price * item.quantity).toFixed(2)}
        </div>
      `;
            cartItems.appendChild(cartItem);
        });
        // Add event listeners to quantity buttons
        document.querySelectorAll(".decrease").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const bookId = e.currentTarget.getAttribute("data-id");
                updateCartItemQuantity(Number(bookId), -1);
            });
        });
        document.querySelectorAll(".increase").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const bookId = e.currentTarget.getAttribute("data-id");
                updateCartItemQuantity(Number(bookId), 1);
            });
        });
    }
}
// Update cart item quantity
function updateCartItemQuantity(bookId, change) {
    const cartItem = cart.find((item) => item.book.book_id === bookId);
    if (!cartItem)
        return;
    cartItem.quantity += change;
    if (cartItem.quantity <= 0) {
        // Remove item from cart
        cart = cart.filter((item) => item.book.book_id !== bookId);
    }
    updateCartUI();
}
// Clear cart
function clearCart() {
    cart = [];
    updateCartUI();
    showNotification("Cart cleared");
}
// Borrow books in cart
function borrowBooks() {
    if (!currentUser) {
        showNotification("Please login to borrow books");
        return;
    }
    if (cart.length === 0) {
        showNotification("Your cart is empty");
        return;
    }
    // Here you would implement the API call to borrow books
    // For now, we'll just show a notification
    showNotification("Books borrowed successfully! Feature coming soon.");
    cart = [];
    updateCartUI();
}
// Create a new book
function createBook(bookData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser) {
            showNotification("Please login to create a book");
            return false;
        }
        if (currentUser.role_id !== 1 && currentUser.role_id !== 2) {
            showNotification("Only admins and librarians can create books");
            return false;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/books/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookData),
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Failed to create book");
            }
            yield fetchBooks(); // Refresh book list
            showNotification("Book created successfully");
            return true;
        }
        catch (error) {
            console.error("Create book failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
            return false;
        }
    });
}
// Edit a book
function editBook(bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser) {
            showNotification("Please login to edit a book");
            return;
        }
        if (currentUser.role_id !== 1 && currentUser.role_id !== 2) {
            showNotification("Only admins and librarians can edit books");
            return;
        }
        const book = books.find((b) => b.book_id === bookId);
        if (!book)
            return;
        // Show edit form modal
        if (bookFormModal && bookForm) {
            // Set form title
            const formTitle = bookFormModal.querySelector("h2");
            if (formTitle)
                formTitle.textContent = "Edit Book";
            // Set form fields
            const titleInput = bookForm.querySelector("#bookTitle");
            const authorInput = bookForm.querySelector("#bookAuthor");
            const genreInput = bookForm.querySelector("#bookGenre");
            const yearInput = bookForm.querySelector("#bookYear");
            const pagesInput = bookForm.querySelector("#bookPages");
            const publisherInput = bookForm.querySelector("#bookPublisher");
            const descriptionInput = bookForm.querySelector("#bookDescription");
            const imageInput = bookForm.querySelector("#bookImage");
            const priceInput = bookForm.querySelector("#bookPrice");
            if (titleInput)
                titleInput.value = book.title;
            if (authorInput)
                authorInput.value = book.author;
            if (genreInput)
                genreInput.value = book.genre;
            if (yearInput)
                yearInput.value = book.year.toString();
            if (pagesInput)
                pagesInput.value = book.pages.toString();
            if (publisherInput)
                publisherInput.value = book.publisher;
            if (descriptionInput)
                descriptionInput.value = book.description;
            if (imageInput)
                imageInput.value = book.image;
            if (priceInput)
                priceInput.value = book.price.toString();
            // Set form submission handler
            bookForm.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                // Get form data
                const formData = new FormData(bookForm);
                const updatedBook = {
                    title: formData.get("title"),
                    author: formData.get("author"),
                    genre: formData.get("genre"),
                    year: parseInt(formData.get("year")),
                    pages: parseInt(formData.get("pages")),
                    publisher: formData.get("publisher"),
                    description: formData.get("description"),
                    image: formData.get("image"),
                    price: parseFloat(formData.get("price")),
                };
                // Update book in database
                try {
                    const response = yield fetch(`${API_BASE_URL}/api/books/${bookId}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedBook),
                        credentials: "include",
                    });
                    if (!response.ok) {
                        const errorData = yield response.json();
                        throw new Error(errorData.message || "Failed to update book");
                    }
                    yield fetchBooks(); // Refresh book list
                    showNotification("Book updated successfully");
                    bookFormModal.style.display = "none";
                }
                catch (error) {
                    console.error("Update book failed:", error);
                    if (error instanceof Error) {
                        showNotification(`Login failed: ${error.message}`);
                    }
                    else {
                        showNotification("Login failed: An unknown error occurred");
                    }
                }
            });
            // Show modal
            bookFormModal.style.display = "block";
        }
    });
}
// Delete a book
function deleteBook(bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser) {
            showNotification("Please login to delete a book");
            return;
        }
        if (currentUser.role_id !== 1 && currentUser.role_id !== 2) {
            showNotification("Only admins and librarians can delete books");
            return;
        }
        // Confirm deletion
        if (!confirm("Are you sure you want to delete this book?")) {
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/books/${bookId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Failed to delete book");
            }
            yield fetchBooks(); // Refresh book list
            showNotification("Book deleted successfully");
        }
        catch (error) {
            console.error("Delete book failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
        }
    });
}
// Show notification
function showNotification(message) {
    if (!notification)
        return;
    notification.textContent = message;
    notification.classList.add("show");
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
// Show login page
function showLoginPage() {
    var _a, _b;
    (_a = document.querySelector(".auth-container")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    (_b = document.querySelector(".main-container")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
}
// Show main application
function showMainApp() {
    var _a, _b;
    (_a = document.querySelector(".auth-container")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    (_b = document.querySelector(".main-container")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    // Fetch and display books
    fetchBooks();
    // Update user info
    updateUserUI();
    // Update cart UI
    updateCartUI();
}
// Setup all event listeners
function setupEventListeners() {
    var _a, _b;
    // Login form
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const email = document.getElementById("loginEmail")
                .value;
            const password = document.getElementById("loginPassword").value;
            yield login(email, password);
        }));
    }
    // Register form
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const name = document.getElementById("registerName")
                .value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const role_id = parseInt(document.getElementById("registerRole").value);
            yield register(name, email, password, role_id);
        }));
    }
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logout();
        });
    }
    // Toggle between login and register forms
    (_a = document.getElementById("showRegister")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        var _a, _b;
        (_a = document.getElementById("loginContainer")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("registerContainer")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
    (_b = document.getElementById("showLogin")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        var _a, _b;
        (_a = document.getElementById("registerContainer")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("loginContainer")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
    // Search input
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterBooks();
        });
    }
    // Genre filter
    if (filterGenre) {
        filterGenre.addEventListener("change", () => {
            filterBooks();
        });
    }
    // Sort options
    if (sortOptions) {
        sortOptions.addEventListener("change", () => {
            sortBooks();
        });
    }
    // Cart icon click (show/hide dropdown)
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            if (cartDropdown) {
                cartDropdown.classList.toggle("show");
            }
        });
    }
    // Close cart dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (cartDropdown &&
            cartIcon &&
            !cartIcon.contains(e.target) &&
            !cartDropdown.contains(e.target)) {
            cartDropdown.classList.remove("show");
        }
    });
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            clearCart();
        });
    }
    // Borrow books button
    if (borrowBooksBtn) {
        borrowBooksBtn.addEventListener("click", () => {
            borrowBooks();
        });
    }
    // Add book button
    if (addBookBtn) {
        addBookBtn.addEventListener("click", () => {
            // Show add book form modal
            if (bookFormModal && bookForm) {
                // Reset form
                bookForm.reset();
                // Set form title
                const formTitle = bookFormModal.querySelector("h2");
                if (formTitle)
                    formTitle.textContent = "Add New Book";
                // Set form submission handler
                bookForm.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
                    e.preventDefault();
                    // Get form data
                    const formData = new FormData(bookForm);
                    const newBook = {
                        title: formData.get("title"),
                        author: formData.get("author"),
                        genre: formData.get("genre"),
                        year: parseInt(formData.get("year")),
                        pages: parseInt(formData.get("pages")),
                        publisher: formData.get("publisher"),
                        description: formData.get("description"),
                        image: formData.get("image"),
                        price: parseFloat(formData.get("price")),
                    };
                    // Create book in database
                    const success = yield createBook(newBook);
                    if (success) {
                        bookFormModal.style.display = "none";
                    }
                });
                // Show modal
                bookFormModal.style.display = "block";
            }
        });
    }
    // Close modal
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            if (bookFormModal) {
                bookFormModal.style.display = "none";
            }
        });
    }
    // Close modal when clicking outside
    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (bookFormModal && e.target === bookFormModal) {
            bookFormModal.style.display = "none";
        }
    });
    // Book details modal close when clicking outside
    document.addEventListener("click", (e) => {
        const detailsModal = document.querySelector(".book-details-modal");
        if (detailsModal && e.target === detailsModal) {
            document.body.removeChild(detailsModal);
        }
    });
}
// Pagination functions
let currentPage = 1;
const booksPerPage = 12;
function setupPagination() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer)
        return;
    paginationContainer.innerHTML = "";
    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn prev";
    prevBtn.innerHTML = "&laquo; Previous";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPaginatedBooks();
            setupPagination();
        }
    });
    paginationContainer.appendChild(prevBtn);
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `pagination-btn page ${i === currentPage ? "active" : ""}`;
        pageBtn.textContent = i.toString();
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            renderPaginatedBooks();
            setupPagination();
        });
        paginationContainer.appendChild(pageBtn);
    }
    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn next";
    nextBtn.innerHTML = "Next &raquo;";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPaginatedBooks();
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextBtn);
}
function renderPaginatedBooks() {
    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const paginatedBooks = filteredBooks.slice(start, end);
    if (!bookList)
        return;
    bookList.innerHTML = "";
    if (paginatedBooks.length === 0) {
        bookList.innerHTML =
            '<p class="no-books">No books found matching your criteria.</p>';
        return;
    }
    paginatedBooks.forEach((book) => {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.innerHTML = `
    <div class="book-image">
      <img src="${book.image || "placeholder.jpg"}" alt="${book.title}">
    </div>
    <div class="book-info">
      <h3>${book.title}</h3>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Genre:</strong> ${book.genre}</p>
      <p><strong>Year:</strong> ${book.year}</p>
      <p><strong>Price:</strong> $${book.price}</p>
      ${book.available_copies !== undefined
            ? `<p class="availability ${book.available_copies > 0 ? "in-stock" : "out-of-stock"}">
          ${book.available_copies > 0
                ? `Available: ${book.available_copies}/${book.total_copies}`
                : "Out of Stock"}
        </p>`
            : ""}
    </div>
    <div class="book-actions">
      <button class="btn view-btn" data-id="${book.book_id}">View Details</button>
      <button class="btn add-to-cart-btn" data-id="${book.book_id}" ${book.available_copies !== undefined && book.available_copies === 0
            ? "disabled"
            : ""}>
        ${book.available_copies !== undefined && book.available_copies === 0
            ? "Out of Stock"
            : "Add to Cart"}
      </button>
      ${currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2)
            ? `<button class="btn edit-btn" data-id="${book.book_id}">Edit</button>
         <button class="btn delete-btn" data-id="${book.book_id}">Delete</button>`
            : ""}
    </div>
  `;
        bookList.appendChild(bookCard);
    });
    // Add event listeners to action buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            viewBookDetails(Number(bookId));
        });
    });
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
        if (!btn.disabled) {
            btn.addEventListener("click", (e) => {
                const bookId = e.currentTarget.getAttribute("data-id");
                addToCart(Number(bookId));
            });
        }
    });
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            editBook(Number(bookId));
        });
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const bookId = e.currentTarget.getAttribute("data-id");
            deleteBook(Number(bookId));
        });
    });
}
// // Modify renderBooks to use pagination
// function renderBooks() {
// // Reset to first page when filtering/sorting
// }
// User management for admins
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser || currentUser.role_id !== 1) {
            showNotification("Only admins can access user management");
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/users/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const users = yield response.json();
            renderUserManagementUI(users);
        }
        catch (error) {
            console.error("Fetch users failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
        }
    });
}
function renderUserManagementUI(users) {
    const userManagementSection = document.getElementById("userManagementSection");
    if (!userManagementSection)
        return;
    userManagementSection.innerHTML = `
  <h2>User Management</h2>
  <div class="user-list">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users
        .map((user) => `
          <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role_name}</td>
            <td>
              <button class="btn edit-user-btn" data-id="${user.id}">Edit</button>
              <button class="btn delete-user-btn" data-id="${user.id}">Delete</button>
            </td>
          </tr>
        `)
        .join("")}
      </tbody>
    </table>
  </div>
`;
    // Add event listeners
    document.querySelectorAll(".edit-user-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const userId = e.currentTarget.getAttribute("data-id");
            editUser(userId);
        });
    });
    document.querySelectorAll(".delete-user-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const userId = e.currentTarget.getAttribute("data-id");
            deleteUser(userId);
        });
    });
}
function editUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser || currentUser.role_id !== 1) {
            showNotification("Only admins can edit users");
            return;
        }
        try {
            // Fetch user details
            const response = yield fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user details");
            }
            const user = yield response.json();
            // Create and show edit user modal
            const modal = document.createElement("div");
            modal.className = "modal user-edit-modal";
            modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Edit User</h2>
      <form id="editUserForm">
        <div class="form-group">
          <label for="userName">Name</label>
          <input type="text" id="userName" name="name" value="${user.name}" required>
        </div>
        <div class="form-group">
          <label for="userEmail">Email</label>
          <input type="email" id="userEmail" name="email" value="${user.email}" required>
        </div>
        <div class="form-group">
          <label for="userRole">Role</label>
          <select id="userRole" name="role_id" required>
            <option value="1" ${user.role_id === 1 ? "selected" : ""}>Admin</option>
            <option value="2" ${user.role_id === 2 ? "selected" : ""}>Librarian</option>
            <option value="3" ${user.role_id === 3 ? "selected" : ""}>Member</option>
          </select>
        </div>
        <div class="form-group">
          <button type="submit" class="btn primary-btn">Update User</button>
        </div>
      </form>
    </div>
  `;
            document.body.appendChild(modal);
            // Close button event
            const closeBtn = modal.querySelector(".close");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    document.body.removeChild(modal);
                });
            }
            // Form submit event
            const form = modal.querySelector("#editUserForm");
            if (form) {
                form.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const userData = {
                        name: formData.get("name"),
                        email: formData.get("email"),
                        role_id: parseInt(formData.get("role_id")),
                    };
                    try {
                        const updateResponse = yield fetch(`${API_BASE_URL}/api/users/${userId}`, {
                            method: "PUT",
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(userData),
                            credentials: "include",
                        });
                        if (!updateResponse.ok) {
                            const errorData = yield updateResponse.json();
                            throw new Error(errorData.message || "Failed to update user");
                        }
                        showNotification("User updated successfully");
                        document.body.removeChild(modal);
                        yield fetchUsers(); // Refresh user list
                    }
                    catch (error) {
                        console.error("Update user failed:", error);
                        if (error instanceof Error) {
                            showNotification(`Login failed: ${error.message}`);
                        }
                        else {
                            showNotification("Login failed: An unknown error occurred");
                        }
                    }
                }));
            }
            // Close modal when clicking outside
            window.addEventListener("click", (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }
        catch (error) {
            console.error("Edit user failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
        }
    });
}
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser || currentUser.role_id !== 1) {
            showNotification("Only admins can delete users");
            return;
        }
        // Confirm deletion
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || "Failed to delete user");
            }
            showNotification("User deleted successfully");
            yield fetchUsers(); // Refresh user list
        }
        catch (error) {
            console.error("Delete user failed:", error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification("Login failed: An unknown error occurred");
            }
        }
    });
}
// Show loading indicator
function showLoading(element, message = "Loading...") {
    const loadingEl = document.createElement("div");
    loadingEl.className = "loading-indicator";
    loadingEl.innerHTML = `
  <div class="spinner"></div>
  <p>${message}</p>
`;
    element.innerHTML = "";
    element.appendChild(loadingEl);
}
// // Modify fetchBooks to show loading state
// async function fetchBooks() {
//   if (!bookList) return;
//   showLoading(bookList);
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/books/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     if (!response.ok) {
//       throw new Error("Failed to fetch books");
//     }
//     const data = await response.json();
//     books = data;
//     filteredBooks = [...books];
//     renderBooks();
//     populateGenreFilter();
//   } catch (error) {
//     console.error("Fetch books failed:", error);
//     if (bookList) {
//       bookList.innerHTML = `<p class="error-message">Failed to load books: ${error.message}</p>`;
//     }
//     showNotification("Failed to load books. Please try again later.");
//   }
// }
// Initialize admin dashboard if user is admin
function initAdminDashboard() {
    var _a, _b, _c;
    if (!currentUser || currentUser.role_id !== 1)
        return;
    const adminSection = document.getElementById("adminSection");
    if (!adminSection)
        return;
    adminSection.innerHTML = `
  <h2>Admin Dashboard</h2>
  <div class="admin-actions">
    <button id="manageUsersBtn" class="btn primary-btn">Manage Users</button>
    <button id="viewReportsBtn" class="btn primary-btn">View Reports</button>
    <button id="systemSettingsBtn" class="btn primary-btn">System Settings</button>
  </div>
  <div id="adminContent"></div>
`;
    // Add event listeners
    (_a = document.getElementById("manageUsersBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        fetchUsers();
    });
    (_b = document.getElementById("viewReportsBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        showReports();
    });
    (_c = document
        .getElementById("systemSettingsBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        showSystemSettings();
    });
}
// Show reports for admin
function showReports() {
    if (!currentUser || currentUser.role_id !== 1) {
        showNotification("Only admins can view reports");
        return;
    }
    const adminContent = document.getElementById("adminContent");
    if (!adminContent)
        return;
    adminContent.innerHTML = `
  <h3>System Reports</h3>
  <div class="reports-container">
    <div class="report-card">
      <h4>Popular Books</h4>
      <p>Coming soon...</p>
    </div>
    <div class="report-card">
      <h4>Active Users</h4>
      <p>Coming soon...</p>
    </div>
    <div class="report-card">
      <h4>Overdue Books</h4>
      <p>Coming soon...</p>
    </div>
  </div>
`;
}
// Show system settings for admin
function showSystemSettings() {
    var _a;
    if (!currentUser || currentUser.role_id !== 1) {
        showNotification("Only admins can access system settings");
        return;
    }
    const adminContent = document.getElementById("adminContent");
    if (!adminContent)
        return;
    adminContent.innerHTML = `
  <h3>System Settings</h3>
  <form id="systemSettingsForm">
    <div class="form-group">
      <label for="borrowDuration">Default Borrow Duration (days)</label>
      <input type="number" id="borrowDuration" name="borrowDuration" value="14" min="1" max="90">
    </div>
    <div class="form-group">
      <label for="lateFee">Late Fee ($ per day)</label>
      <input type="number" id="lateFee" name="lateFee" value="0.50" step="0.10" min="0">
    </div>
    <div class="form-group">
      <label for="maxBooksPerUser">Max Books Per User</label>
      <input type="number" id="maxBooksPerUser" name="maxBooksPerUser" value="5" min="1">
    </div>
    <div class="form-group">
      <button type="submit" class="btn primary-btn">Save Settings</button>
    </div>
  </form>
`;
    // Add form submit event
    (_a = document
        .getElementById("systemSettingsForm")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (e) => {
        e.preventDefault();
        showNotification("Settings saved successfully!");
    });
}
//# sourceMappingURL=index.js.map