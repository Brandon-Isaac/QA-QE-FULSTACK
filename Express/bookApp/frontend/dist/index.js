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
let cartCount = 0;
let cart = [];
// Fetch books from the backend
function fetchBooks() {
    return __awaiter(this, arguments, void 0, function* (params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const url = `http://localhost:4000/api/books?${queryParams}`;
            console.log("Fetching books from:", url);
            const response = yield fetch(url);
            return yield response.json();
        }
        catch (error) {
            console.error("Error fetching books:", error);
            return [];
        }
    });
}
// Display books in the UI
function displayBooks(books) {
    return __awaiter(this, void 0, void 0, function* () {
        const bookList = document.getElementById("bookList");
        if (!bookList)
            return;
        bookList.innerHTML = "";
        if (books.length === 0) {
            bookList.innerHTML = "<p>No books found matching your search criteria.</p>";
            return;
        }
        books.forEach((book) => {
            var _a;
            const bookItem = document.createElement("li");
            bookItem.classList.add("book");
            bookItem.title = book.description;
            bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <div>
                <strong>${book.title}</strong> by ${book.author} <br>
                Genre: ${book.genre} | Year: ${book.year} | Pages: ${book.pages} <br>
                Price: <strong>$${book.price}</strong>
            </div>
            <button class="addToCart" data-title="${book.title}">Add to cart</button>
        `;
            bookList.appendChild(bookItem);
            (_a = bookItem.querySelector(".addToCart")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                addToCart(book.title, book.author, book.price);
            });
        });
    });
}
// Populate genre filter options
function populateFilters() {
    return __awaiter(this, void 0, void 0, function* () {
        const books = yield fetchBooks();
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
// Handle search, filter, and sort
function handleSearch() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const searchQuery = (_a = document.getElementById("searchInput")) === null || _a === void 0 ? void 0 : _a.value.trim();
        const selectedGenre = (_b = document.getElementById("genreFilter")) === null || _b === void 0 ? void 0 : _b.value;
        const sortBy = (_c = document.getElementById("sortBy")) === null || _c === void 0 ? void 0 : _c.value;
        const params = {};
        if (searchQuery)
            params.search = searchQuery;
        if (selectedGenre)
            params.genre = selectedGenre;
        if (sortBy)
            params.sortBy = sortBy;
        const books = yield fetchBooks(params);
        displayBooks(books);
    });
}
// Add a book to the cart
function addToCart(title, author, price) {
    const existingItem = cart.find((item) => item.title === title);
    if (existingItem) {
        existingItem.quantity++;
    }
    else {
        cart.push({ title, author, price, quantity: 1 });
    }
    cartCount++;
    updateCartCountDisplay();
}
// Update the cart count in the UI
function updateCartCountDisplay() {
    const cartCountElement = document.getElementById("cartItems");
    if (cartCountElement) {
        cartCountElement.textContent = `${cartCount}`;
    }
}
// Show the cart modal
function showCartModal() {
    const modal = document.getElementById("modal");
    const modalMessage = document.getElementById("modalMessage");
    const modalDetails = document.getElementById("modalDetails");
    if (!modal || !modalMessage || !modalDetails)
        return;
    if (cart.length === 0) {
        modalMessage.innerHTML = "<p>Your cart is empty.</p>";
        modalDetails.innerHTML = "";
    }
    else {
        modalMessage.innerHTML = "<h3>🛍 Your Cart:</h3>";
        modalDetails.innerHTML = "";
        let totalAmount = 0;
        cart.forEach((cartItem) => {
            totalAmount += cartItem.price * cartItem.quantity;
            const cartRow = document.createElement("div");
            cartRow.innerHTML = `
                <p><strong>📖 ${cartItem.title}</strong> by ${cartItem.author} - $${cartItem.price} x ${cartItem.quantity}</p>
            `;
            modalDetails.appendChild(cartRow);
        });
        const totalElement = document.createElement("p");
        totalElement.innerHTML = `<strong>Total: $${totalAmount}</strong>`;
        modalDetails.appendChild(totalElement);
    }
    modal.style.display = "flex";
}
// Close the cart modal
function closeModal() {
    const modal = document.getElementById("modal");
    if (modal)
        modal.style.display = "none";
}
// Set up event listeners
function setupEventListeners() {
    var _a, _b, _c, _d;
    const searchInput = document.getElementById("searchInput");
    searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
        }
    });
    (_a = document
        .getElementById("genreFilter")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", handleSearch);
    (_b = document.getElementById("sortBy")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", handleSearch);
    (_c = document.querySelector(".cart img")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", showCartModal);
    (_d = document.querySelector(".close")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", closeModal);
}
// Initialize the app
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const books = yield fetchBooks();
        displayBooks(books);
        populateFilters();
        updateCartCountDisplay();
        setupEventListeners();
    });
}
// Start the app
init();
//# sourceMappingURL=index.js.map