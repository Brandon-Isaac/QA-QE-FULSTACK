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
        var _a, _b, _c, _d, _e;
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
        // Create the edit modal
        const editModal = document.createElement("div");
        editModal.id = "editModal";
        editModal.innerHTML = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Edit Book</h2>
        <form id="editBookForm">
            <input type="hidden" id="editBookId">
            <label>Title:</label>
            <input type="text" id="editTitle">
            <label>Author:</label>
            <input type="text" id="editAuthor">
            <label>Price:</label>
            <input type="number" id="editPrice">
            <button type="submit">Update</button>
        </form>
    </div>
`;
        document.body.appendChild(editModal);
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
      <div class="book-actions">
            <span class="edit-icon" title="Edit">✏</span>
            <span class="delete-icon" title="Delete">❌</span>
        </div>
    `;
            bookList.appendChild(bookItem);
            (_a = bookItem.querySelector(".addToCart")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                addToCart(book.title, book.author, book.price);
            });
            // Handle Delete with Confirmation
            (_b = bookItem.querySelector(".delete-icon")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
                if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                    deleteBook(book.id, bookItem);
                }
            });
            // Handle Edit (opens modal)
            (_c = bookItem.querySelector(".edit-icon")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
                openEditModal(book);
            });
        }
        // Function to Delete a Book
        function deleteBook(bookId, bookElement) {
            fetch(`http://localhost:3000/books/${bookId}`, {
                method: "DELETE",
            })
                .then((response) => {
                if (!response.ok)
                    throw new Error("Failed to delete book");
                bookElement.remove(); // Remove from UI
            })
                .catch((error) => console.error("Error deleting book:", error));
        }
        // Function to Open Edit Modal
        function openEditModal(book) {
            document.getElementById("editBookId").value = book.id;
            document.getElementById("editTitle").value =
                book.title;
            document.getElementById("editAuthor").value =
                book.author;
            document.getElementById("editPrice").value =
                book.price;
            editModal.style.display = "block";
        }
        // Close Edit Modal
        (_d = document.querySelector(".close-modal")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            editModal.style.display = "none";
        });
        // Handle Edit Form Submission
        (_e = document
            .getElementById("editBookForm")) === null || _e === void 0 ? void 0 : _e.addEventListener("submit", (event) => {
            event.preventDefault();
            const bookId = document.getElementById("editBookId")
                .value;
            const updatedBook = {
                title: document.getElementById("editTitle").value,
                author: document.getElementById("editAuthor")
                    .value,
                price: parseFloat(document.getElementById("editPrice").value),
            };
            fetch(`http://localhost:3000/books/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedBook),
            })
                .then((response) => response.json())
                .then((data) => {
                alert("Book updated successfully!");
                editModal.style.display = "none";
                location.reload(); // Refresh page to show updated book
            })
                .catch((error) => console.error("Error updating book:", error));
        });
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