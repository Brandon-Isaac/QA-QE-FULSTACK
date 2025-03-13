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
// Global variables
let cartCount = 0;
let cart = [];
// Fetch books from the backend
function fetchBooks() {
    return __awaiter(this, arguments, void 0, function* (params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const url = `http://localhost:3000/books?${queryParams}`;
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
        var _a;
        const bookList = document.getElementById("bookList");
        if (!bookList)
            return;
        bookList.innerHTML = "";
        if (books.length === 0) {
            bookList.innerHTML = "<p>No books found matching your search criteria.</p>";
            return;
        }
        function fetchBookImage(imageUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch(imageUrl);
                    if (response.ok) {
                        return imageUrl;
                    }
                    else {
                        throw new Error("Image not found");
                    }
                }
                catch (_a) {
                    return "Images/book.png";
                }
            });
        }
        for (const book of books) {
            const bookItem = document.createElement("li");
            bookItem.classList.add("book");
            bookItem.setAttribute("data-id", book.id.toString());
            const imageUrl = yield fetchBookImage(book.image);
            bookItem.innerHTML = `
      <img src="${imageUrl}" alt="${book.title}">
      <div>
        <strong>${book.title}</strong> by ${book.author} <br>
        Genre: ${book.genre} | Year: ${book.year} | Pages: ${book.pages} <br>
        Price: <strong>$${book.price}</strong>
      </div>
      <button class="addToCart" data-title="${book.title}">Add to Cart</button>
    `;
            bookList.appendChild(bookItem);
            (_a = bookItem.querySelector(".addToCart")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                addToCart(book.title, book.author, book.price);
            });
        }
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
    const cartModal = document.getElementById("cartModal");
    const cartDetails = document.getElementById("cartDetails");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartModal || !cartDetails || !cartTotal)
        return;
    if (cart.length === 0) {
        cartDetails.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.innerHTML = "";
    }
    else {
        cartDetails.innerHTML = "";
        let totalAmount = 0;
        cart.forEach((item) => {
            totalAmount += item.price * item.quantity;
            const cartRow = document.createElement("div");
            cartRow.innerHTML = `
        <p><strong>📖 ${item.title}</strong> by ${item.author} - $${item.price} x ${item.quantity}</p>
      `;
            cartDetails.appendChild(cartRow);
        });
        cartTotal.innerHTML = `<strong>Total: $${totalAmount}</strong>`;
    }
    cartModal.style.display = "flex";
}
// Close the cart modal
function closeCartModal() {
    const cartModal = document.getElementById("cartModal");
    if (cartModal)
        cartModal.style.display = "none";
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
// Set up event listeners
function setupEventListeners() {
    var _a, _b, _c;
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
    const addBookBtn = document.getElementById("addBookBtn");
    const bookModal = document.getElementById("bookModal");
    const closeModalBtn = document.querySelector(".close");
    addBookBtn === null || addBookBtn === void 0 ? void 0 : addBookBtn.addEventListener("click", () => {
        bookModal.style.display = "flex";
    });
    closeModalBtn === null || closeModalBtn === void 0 ? void 0 : closeModalBtn.addEventListener("click", () => {
        bookModal.style.display = "none";
    });
    window.addEventListener("click", (event) => {
        if (event.target === bookModal) {
            bookModal.style.display = "none";
        }
    });
    (_c = document
        .getElementById("bookForm")) === null || _c === void 0 ? void 0 : _c.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const id = parseInt(document.getElementById("id").value, 10);
        const title = document.getElementById("title")
            .value;
        const author = document.getElementById("author")
            .value;
        const year = parseInt(document.getElementById("year").value, 10);
        const genre = document.getElementById("genre")
            .value;
        const pages = parseInt(document.getElementById("pages").value, 10);
        const publisher = document.getElementById("publisher").value;
        const description = document.getElementById("description").value;
        const image = document.getElementById("image")
            .value;
        const price = parseInt(document.getElementById("price").value, 10);
        const book = {
            id,
            title,
            author,
            genre,
            year,
            pages,
            publisher,
            description,
            image,
            price,
        };
        try {
            const response = yield fetch("http://localhost:3000/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(book),
            });
            if (!response.ok)
                throw new Error("Failed to add book");
            const newBook = yield response.json();
            console.log("Book added:", newBook);
            // Refresh books list
            const books = yield fetchBooks();
            displayBooks(books);
            // Close modal
            bookModal.style.display = "none";
        }
        catch (error) {
            console.error("Error:", error);
        }
    }));
    const updateBookBtn = document.getElementById("updateBook");
    updateBookBtn === null || updateBookBtn === void 0 ? void 0 : updateBookBtn.addEventListener("click", () => {
        const bookItems = document.querySelectorAll(".book");
        bookItems.forEach((bookItem) => {
            var _a, _b, _c, _d;
            const deleteIcon = document.createElement("span");
            deleteIcon.innerHTML = "🗑️";
            deleteIcon.classList.add("delete-icon");
            deleteIcon.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const bookId = bookItem.getAttribute("data-id");
                    if (!bookId)
                        throw new Error("Book ID not found");
                    const response = yield fetch(`http://localhost:3000/books/${bookId}`, {
                        method: "DELETE",
                    });
                    if (!response.ok)
                        throw new Error("Failed to delete book");
                    console.log("Book deleted:", bookItem);
                    bookItem.remove();
                }
                catch (error) {
                    console.error("Error deleting book:", error);
                }
            }));
            const editIcon = document.createElement("span");
            editIcon.innerHTML = "✏️";
            editIcon.classList.add("edit-icon");
            editIcon.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const bookId = bookItem.getAttribute("data-id");
                if (!bookId) {
                    console.error("Book ID not found");
                    return;
                }
                try {
                    const response = yield fetch(`http://localhost:3000/books/${bookId}`);
                    if (!response.ok)
                        throw new Error("Failed to fetch book details");
                    const book = yield response.json();
                    // Populate the form with book details
                    document.getElementById("id").value = book.id;
                    document.getElementById("title").value =
                        book.title;
                    document.getElementById("author").value =
                        book.author;
                    document.getElementById("year").value =
                        book.year;
                    document.getElementById("genre").value =
                        book.genre;
                    document.getElementById("pages").value =
                        book.pages;
                    document.getElementById("publisher").value =
                        book.publisher;
                    document.getElementById("description").value =
                        book.description;
                    document.getElementById("image").value =
                        book.image;
                    document.getElementById("price").value =
                        book.price;
                    // Show the modal
                    bookModal.style.display = "flex";
                    // Handle form submission for updating the book
                    (_a = document
                        .getElementById("bookForm")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (event) => __awaiter(this, void 0, void 0, function* () {
                        event.preventDefault();
                        const updatedBook = {
                            id: parseInt(document.getElementById("id").value, 10),
                            title: document.getElementById("title")
                                .value,
                            author: document.getElementById("author")
                                .value,
                            year: parseInt(document.getElementById("year").value, 10),
                            genre: document.getElementById("genre")
                                .value,
                            pages: parseInt(document.getElementById("pages").value, 10),
                            publisher: document.getElementById("publisher").value,
                            description: document.getElementById("description").value,
                            image: document.getElementById("image")
                                .value,
                            price: parseInt(document.getElementById("price").value, 10),
                        };
                        try {
                            const response = yield fetch(`http://localhost:3000/books/${bookId}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(updatedBook),
                            });
                            if (!response.ok)
                                throw new Error("Failed to update book");
                            const updatedBookResponse = yield response.json();
                            console.log("Book updated:", updatedBookResponse);
                            // Refresh books list
                            const books = yield fetchBooks();
                            displayBooks(books);
                            // Close modal
                            bookModal.style.display = "none";
                        }
                        catch (error) {
                            console.error("Error updating book:", error);
                        }
                    }));
                }
                catch (error) {
                    console.error("Error fetching book details:", error);
                }
            }));
            (_b = (_a = bookItem.querySelector("img")) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(deleteIcon);
            (_d = (_c = bookItem.querySelector("img")) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.appendChild(editIcon);
        });
    });
}
// Initialize the app
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const books = yield fetchBooks();
        displayBooks(books);
        populateFilters();
        setupEventListeners();
    });
}
// Start the app
init();
//# sourceMappingURL=index.js.map