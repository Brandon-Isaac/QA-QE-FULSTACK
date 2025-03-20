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
const API_BASE_URL = 'http://localhost:3000';
// State management
let currentUser = null;
let books = [];
let filteredBooks = [];
let cart = [];
// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const bookSection = document.getElementById('bookSection');
const userSection = document.getElementById('userSection');
const bookList = document.getElementById('bookList');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartDropdown = document.getElementById('cartDropdown');
const cartItems = document.getElementById('cartItems');
const clearCartBtn = document.getElementById('clearCartBtn');
const borrowBooksBtn = document.getElementById('borrowBooksBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const filterGenre = document.getElementById('filterGenre');
const sortOptions = document.getElementById('sortOptions');
const addBookBtn = document.getElementById('addBookBtn');
const userInfo = document.getElementById('userInfo');
const notification = document.getElementById('notification');
const bookFormModal = document.getElementById('bookFormModal');
const bookForm = document.getElementById('bookForm');
const closeModal = document.getElementById('closeModal');
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (token in cookies/localStorage)
    checkAuthStatus();
    // Event Listeners
    setupEventListeners();
});
// Check authentication status
function checkAuthStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = localStorage.getItem('access_token');
        if (!token) {
            showLoginPage();
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Authentication failed');
            }
            const data = yield response.json();
            localStorage.setItem('access_token', data.access_token);
            // Fetch user data
            yield fetchUserData();
            // Show main application
            showMainApp();
        }
        catch (error) {
            console.error('Auth check failed:', error);
            showLoginPage();
        }
    });
}
// Fetch current user data
function fetchUserData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const userData = yield response.json();
            currentUser = userData;
            updateUserUI();
        }
        catch (error) {
            console.error('Fetch user data failed:', error);
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
        addBookBtn.style.display = isAdminOrLibrarian ? 'block' : 'none';
    }
}
// Login functionality
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = yield response.json();
            // Store tokens
            localStorage.setItem('access_token', data.tokens.access_token);
            // Store user data
            currentUser = data.user;
            // Show main application
            showMainApp();
            return true;
        }
        catch (error) {
            console.error('Login failed:', error);
            if (error instanceof Error) {
                showNotification(`Login failed: ${error.message}`);
            }
            else {
                showNotification('Login failed: An unknown error occurred');
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role_id }),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            showNotification('Registration successful! Please login.');
            return true;
        }
        catch (error) {
            console.error('Registration failed:', error);
            if (error instanceof Error) {
                showNotification(`Registration failed: ${error.message}`);
            }
            else {
                showNotification('Registration failed: An unknown error occurred');
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
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            // Clear local storage and cookies
            localStorage.removeItem('access_token');
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
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            const data = yield response.json();
            books = data;
            filteredBooks = [...books];
            renderBooks();
            populateGenreFilter();
        }
        catch (error) {
            console.error('Fetch books failed:', error);
            showNotification('Failed to load books. Please try again later.');
        }
    });
}
// Render books to the book list
function renderBooks() {
    if (!bookList)
        return;
    bookList.innerHTML = '';
    if (filteredBooks.length === 0) {
        bookList.innerHTML = '<p class="no-books">No books found matching your criteria.</p>';
        return;
    }
    filteredBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
      <div class="book-image">
        <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}">
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
        ${(currentUser && (currentUser.role_id === 1 || currentUser.role_id === 2)) ?
            `<button class="btn edit-btn" data-id="${book.book_id}">Edit</button>
           <button class="btn delete-btn" data-id="${book.book_id}">Delete</button>` : ''}
      </div>
    `;
        bookList.appendChild(bookCard);
    });
    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.currentTarget.getAttribute('data-id');
            viewBookDetails(Number(bookId));
        });
    });
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.currentTarget.getAttribute('data-id');
            addToCart(Number(bookId));
        });
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.currentTarget.getAttribute('data-id');
            editBook(Number(bookId));
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.currentTarget.getAttribute('data-id');
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
    filterGenre.innerHTML = '';
    filterGenre.appendChild(defaultOption);
    // Get unique genres
    const genres = [...new Set(books.map(book => book.genre))];
    // Add genre options
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        filterGenre.appendChild(option);
    });
}
// Filter books based on search, genre, etc.
function filterBooks() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedGenre = filterGenre ? filterGenre.value : '';
    filteredBooks = books.filter(book => {
        // Filter by search term
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.description.toLowerCase().includes(searchTerm);
        // Filter by genre
        const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });
    sortBooks();
    renderBooks();
}
// Sort books based on selected option
function sortBooks() {
    const sortBy = sortOptions ? sortOptions.value : '';
    switch (sortBy) {
        case 'title-asc':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'price-asc':
            filteredBooks.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredBooks.sort((a, b) => b.price - a.price);
            break;
        case 'year-asc':
            filteredBooks.sort((a, b) => a.year - b.year);
            break;
        case 'year-desc':
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
    const book = books.find(b => b.book_id === bookId);
    if (!book)
        return;
    // Create and show modal with book details
    const modal = document.createElement('div');
    modal.className = 'modal book-details-modal';
    modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <div class="book-details">
        <div class="book-image">
          <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}">
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
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            addToCart(bookId);
        });
    }
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}
// Add book to cart
function addToCart(bookId) {
    if (!currentUser) {
        showNotification('Please login to add books to cart');
        return;
    }
    const book = books.find(b => b.book_id === bookId);
    if (!book)
        return;
    // Check if book is already in cart
    const existingItem = cart.find(item => item.book.book_id === bookId);
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
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
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
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.getAttribute('data-id');
                updateCartItemQuantity(Number(bookId), -1);
            });
        });
        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookId = e.currentTarget.getAttribute('data-id');
                updateCartItemQuantity(Number(bookId), 1);
            });
        });
    }
}
// Update cart item quantity
function updateCartItemQuantity(bookId, change) {
    const cartItem = cart.find(item => item.book.book_id === bookId);
    if (!cartItem)
        return;
    cartItem.quantity += change;
    if (cartItem.quantity <= 0) {
        // Remove item from cart
        cart = cart.filter(item => item.book.book_id !== bookId);
    }
    updateCartUI();
}
// Clear cart
function clearCart() {
    cart = [];
    updateCartUI();
    showNotification('Cart cleared');
}
// Borrow books in cart
function borrowBooks() {
    if (!currentUser) {
        showNotification('Please login to borrow books');
        return;
    }
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    // Here you would implement the API call to borrow books
    // For now, we'll just show a notification
    showNotification('Books borrowed successfully! Feature coming soon.');
    cart = [];
    updateCartUI();
}
// Create a new book
function createBook(bookData) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser) {
            showNotification('Please login to create a book');
            return false;
        }
        if (currentUser.role_id !== 1 && currentUser.role_id !== 2) {
            showNotification('Only admins and librarians can create books');
            return false;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/books/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Failed to create book');
            }
            yield fetchBooks(); // Refresh book list
            showNotification('Book created successfully');
            return true;
        }
        catch (error) {
            console.error('Create book failed:', error);
            if (error instanceof Error) {
                showNotification(`Failed to create book: ${error.message}`);
            }
            else {
                showNotification('Failed to create book: An unknown error occurred');
            }
            return false;
        }
    });
}
// Edit a book
function editBook(bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser) {
            showNotification('Please login to edit a book');
            return;
        }
        if (currentUser.role_id !== 1 && currentUser.role_id !== 2) {
            showNotification('Only admins and librarians can edit books');
            return;
        }
        const book = books.find(b => b.book_id === bookId);
        if (!book)
            return;
        // Show edit form modal
        if (bookFormModal && bookForm) {
            // Set form title
            const formTitle = bookFormModal.querySelector('h2');
            if (formTitle)
                formTitle.textContent = 'Edit Book';
            // Set form fields
            const titleInput = bookForm.querySelector('#bookTitle');
            const authorInput = bookForm.querySelector('#bookAuthor');
            const genreInput = bookForm.querySelector('#bookGenre');
            const yearInput = bookForm.querySelector('#bookYear');
            const pagesInput = bookForm.querySelector('#bookPages');
            const publisherInput = bookForm.querySelector('#bookPublisher');
            const descriptionInput = bookForm.querySelector('#bookDescription');
            const imageInput = bookForm.querySelector('#bookImage');
            const priceInput = bookForm.querySelector('#bookPrice');
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
                    title: formData.get('title'),
                    author: formData.get('author'),
                    genre: formData.get('genre'),
                    year: parseInt(formData.get('year')),
                    pages: parseInt(formData.get('pages')),
                    publisher: formData.get('publisher'),
                    description: formData.get('description'),
                    image: formData.get('image'),
                    price: parseFloat(formData.get('price')),
                };
                // Update book in database
                try {
                    const response = yield fetch(`${API_BASE_URL}/api/books/${bookId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedBook),
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        const errorData = yield response.json();
                        throw new Error(errorData.message || 'Failed to update book');
                    }
                    yield fetchBooks(); // Refresh book list
                    showNotification('Book updated successfully');
                    bookFormModal.style.display = 'none';
                }
                catch (error) {
                    console.error('Update book failed:', error);
                    if (error instanceof Error) {
                        showNotification(`Failed to update book: ${error.message}`);
                    }
                    else {
                        showNotification('Failed to update book: An unknown error occurred');
                    }
                }
            });
            // Show modal
            bookFormModal.style.display = 'block';
        }
    });
}
// Delete a book
function deleteBook(bookId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUser) {
            showNotification('Please login to delete a book');
            return;
        }
        if (currentUser.role_id !== 1 && currentUser.role_id !== 2) {
            showNotification('Only admins and librarians can delete books');
            return;
        }
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Failed to delete book');
            }
            yield fetchBooks(); // Refresh book list
            showNotification('Book deleted successfully');
        }
        catch (error) {
            console.error('Delete book failed:', error);
            if (error instanceof Error) {
                showNotification(`Failed to delete book: ${error.message}`);
            }
            else {
                showNotification('Failed to delete book: An unknown error occurred');
            }
        }
    });
}
// Show notification
function showNotification(message) {
    if (!notification)
        return;
    notification.textContent = message;
    notification.classList.add('show');
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
// Show login page
function showLoginPage() {
    var _a, _b;
    (_a = document.querySelector('.auth-container')) === null || _a === void 0 ? void 0 : _a.classList.remove('hidden');
    (_b = document.querySelector('.main-container')) === null || _b === void 0 ? void 0 : _b.classList.add('hidden');
}
// Show main application
function showMainApp() {
    var _a, _b;
    (_a = document.querySelector('.auth-container')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    (_b = document.querySelector('.main-container')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
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
        loginForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            yield login(email, password);
        }));
    }
    // Register form
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const role_id = parseInt(document.getElementById('registerRole').value);
            yield register(name, email, password, role_id);
        }));
    }
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
    // Toggle between login and register forms
    (_a = document.getElementById('showRegister')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        var _a, _b;
        (_a = document.getElementById('loginContainer')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        (_b = document.getElementById('registerContainer')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
    });
    (_b = document.getElementById('showLogin')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
        var _a, _b;
        (_a = document.getElementById('registerContainer')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        (_b = document.getElementById('loginContainer')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
    });
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterBooks();
        });
    }
    // Genre filter
    if (filterGenre) {
        filterGenre.addEventListener('change', () => {
            filterBooks();
        });
    }
    // Sort options
    if (sortOptions) {
        sortOptions.addEventListener('change', () => {
            sortBooks();
        });
    }
    // Cart icon click (show/hide dropdown)
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if (cartDropdown) {
                cartDropdown.classList.toggle('show');
            }
        });
    }
    // Close cart dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (cartDropdown && cartIcon && !cartIcon.contains(e.target) && !cartDropdown.contains(e.target)) {
            cartDropdown.classList.remove('show');
        }
    });
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            clearCart();
        });
    }
    // Borrow books button
    if (borrowBooksBtn) {
        borrowBooksBtn.addEventListener('click', () => {
            borrowBooks();
        });
    }
    // Add book button
    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => {
            // Show add book form modal
            if (bookFormModal && bookForm) {
                // Reset form
                bookForm.reset();
                // Set form title
                const formTitle = bookFormModal.querySelector('h2');
                if (formTitle)
                    formTitle.textContent = 'Add New Book';
                // Set form submission handler
                bookForm.onsubmit = (e) => __awaiter(this, void 0, void 0, function* () {
                    e.preventDefault();
                    // Get form data
                    const formData = new FormData(bookForm);
                    const newBook = {
                        title: formData.get('title'),
                        author: formData.get('author'),
                        genre: formData.get('genre'),
                        year: parseInt(formData.get('year')),
                        pages: parseInt(formData.get('pages')),
                        publisher: formData.get('publisher'),
                        description: formData.get('description'),
                        image: formData.get('image'),
                        price: parseFloat(formData.get('price')),
                    };
                    // Create book in database
                    const success = yield createBook(newBook);
                    if (success) {
                        bookFormModal.style.display = 'none';
                    }
                });
                // Show modal
                bookFormModal.style.display = 'block';
            }
        });
    }
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (bookFormModal) {
                bookFormModal.style.display = 'none';
            }
        });
    }
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (bookFormModal && e.target === bookFormModal) {
            bookFormModal.style.display = 'none';
        }
    });
}
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (token in cookies/localStorage)
    checkAuthStatus();
    // Event Listeners
    setupEventListeners();
});
// Utility function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    showNotification(error.message || 'An error occurred. Please try again later.');
}
// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
// Utility function to validate form inputs
function validateFormInputs(inputs) {
    for (const key in inputs) {
        if (!inputs[key]) {
            showNotification(`Please fill in the ${key} field.`);
            return false;
        }
    }
    return true;
}
// Utility function to handle form submissions
function handleFormSubmission(url, method, body, successMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Request failed');
            }
            showNotification(successMessage);
            return true;
        }
        catch (error) {
            handleApiError(error);
            return false;
        }
    });
}
// Additional utility functions can be added here as needed
// Example of adding a new utility function to fetch data
function fetchData(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        try {
            const response = yield fetch(url, options);
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Failed to fetch data');
            }
            return yield response.json();
        }
        catch (error) {
            handleApiError(error);
            return null;
        }
    });
}
// Example of adding a new utility function to post data
function postData(url_1, body_1) {
    return __awaiter(this, arguments, void 0, function* (url, body, options = {}) {
        try {
            const response = yield fetch(url, Object.assign({ method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers), body: JSON.stringify(body) }, options));
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Failed to post data');
            }
            return yield response.json();
        }
        catch (error) {
            handleApiError(error);
            return null;
        }
    });
}
// Example of adding a new utility function to update data
function updateData(url_1, body_1) {
    return __awaiter(this, arguments, void 0, function* (url, body, options = {}) {
        try {
            const response = yield fetch(url, Object.assign({ method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers), body: JSON.stringify(body) }, options));
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Failed to update data');
            }
            return yield response.json();
        }
        catch (error) {
            handleApiError(error);
            return null;
        }
    });
}
// Example of adding a new utility function to delete data
function deleteData(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        try {
            const response = yield fetch(url, Object.assign({ method: 'DELETE', headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers) }, options));
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.message || 'Failed to delete data');
            }
            return yield response.json();
        }
        catch (error) {
            handleApiError(error);
            return null;
        }
    });
}
// Ensure all event listeners are properly set up
function ensureEventListeners() {
    // Add any additional event listeners here
    // Example: Adding a listener for a new button or form
    const newButton = document.getElementById('newButton');
    if (newButton) {
        newButton.addEventListener('click', () => {
            // Handle new button click
        });
    }
}
// Final initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    ensureEventListeners();
});
//# sourceMappingURL=index.js.map