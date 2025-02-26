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
var _a, _b, _c;
let genreFilterChanged = false;
let cartCount = 0;
let cart = [];
function fetchBooks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`http://localhost:3000/Books`);
            return yield response.json();
        }
        catch (error) {
            console.error(error);
            return [];
        }
    });
}
// Display books
function displayBooks(books) {
    return __awaiter(this, void 0, void 0, function* () {
        const booksList = document.getElementById("booksList");
        if (!booksList)
            return;
        booksList.innerHTML = "";
        books.forEach((book) => {
            var _a;
            const bookItem = document.createElement("li");
            bookItem.title = `${book.price}$  ${book.description}`;
            bookItem.innerHTML = `
                <img src="${book.image}" alt="${book.title}"> 
                <div>
                    <strong>${book.title}</strong> by ${book.author} <br> 
                    Genre: ${book.genre} | Year: ${book.year} | Pages: ${book.pages}
                </div>
                <button class="buy-now"> Buy Now </button>
            `;
            bookItem.classList.add("book");
            booksList.appendChild(bookItem);
            // Add event listener to the "Buy Now" button
            (_a = bookItem.querySelector(".buy-now")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                showBookDetails(book);
            });
        });
    });
}
// Show book details in a modal
function showBookDetails(book) {
    var _a, _b;
    const modal = document.getElementById("bookModal");
    const modalContent = modal.querySelector(".modal-content");
    modalContent.innerHTML = `
    <span class="close">&times;</span>
    <h2>${book.title}</h2>
    <p>${book.description}</p>
    <p>Price: $${book.price}</p>
    <label for="quantity">Quantity:</label>
    <input type="number" id="quantity" name="quantity" value="1" min="1">
    <button id="addToCart">Add to Cart</button>
  `;
    modal.style.display = "block";
    (_a = modal.querySelector("#addToCart")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        var _a;
        const quantity = parseInt((_a = modal.querySelector("#quantity")) === null || _a === void 0 ? void 0 : _a.value, 10);
        addToCart(book, quantity);
        modal.style.display = "none";
    });
    (_b = modal.querySelector(".close")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        modal.style.display = "none";
    });
}
// Populate genre filter dynamically
function populateFilters() {
    return __awaiter(this, void 0, void 0, function* () {
        const books = yield fetchBooks();
        const genres = new Set();
        books.forEach((book) => genres.add(book.genre));
        const genreFilter = document.getElementById("genreFilter");
        genreFilter.innerHTML = '<option value="">All</option>';
        genres.forEach((genre) => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    });
}
// Apply filters
function applyFilters() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let books = yield fetchBooks();
        const selectedGenre = document.getElementById("genreFilter").value.toLowerCase();
        const sortBy = (_a = document.getElementById("sortBy")) === null || _a === void 0 ? void 0 : _a.value;
        const searchQuery = document.getElementById("searchInput").value.toLowerCase();
        books = books.filter((book) => (selectedGenre === "" || book.genre.toLowerCase() === selectedGenre) &&
            (searchQuery === "" || book.title.toLowerCase().includes(searchQuery)));
        // Sort books
        if (sortBy === "year") {
            books.sort((a, b) => a.year - b.year);
        }
        else if (sortBy === "pages") {
            books.sort((a, b) => a.pages - b.pages);
        }
        displayBooks(books);
    });
}
// Adding items to cart
function addToCart(book, quantity) {
    const existingBook = cart.find((item) => item.book.id === book.id);
    if (existingBook) {
        existingBook.quantity += quantity;
    }
    else {
        cart.push({ book, quantity });
    }
    function updateCartCount() {
        cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    }
    updateCartCount();
    updateCartCountDisplay();
    updateCartDetails();
}
function updateCartCount() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
}
// Update cart count display
function updateCartCountDisplay() {
    const cartCountElement = document.getElementById("cartItems");
    cartCountElement.textContent = `Cart: ${cartCount} items`;
}
// Update cart details
function updateCartDetails() {
    const cartDetails = document.getElementById("cartDetails");
    cartDetails.innerHTML = "";
    let totalCost = 0;
    cart.forEach((item) => {
        var _a, _b, _c;
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
    <div>
          <img src="${item.book.image}" alt="${item.book.title}"> 
      <span>${item.book.title} - $${item.book.price}</span>
    </div>

      <div>
        <button class="decreaseQuantity">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="increaseQuantity">+</button>
      </div>
      <button class="remove-from-cart">Remove</button>
      <hr/>
    `;
        cartDetails.appendChild(cartItem);
        totalCost += item.book.price * item.quantity;
        (_a = cartItem.querySelector(".increaseQuantity")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            item.quantity += 1;
            cartItem.querySelector(".quantity").textContent = item.quantity.toString();
            updateCartCount();
            updateCartCountDisplay();
            updateCartDetails();
        });
        (_b = cartItem
            .querySelector(".decreaseQuantity")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            if (item.quantity > 1) {
                --item.quantity;
                cartItem.querySelector(".quantity").textContent = item.quantity.toString();
                updateCartCount();
                updateCartCountDisplay();
                updateCartDetails();
            }
        });
        (_c = cartItem
            .querySelector(".remove-from-cart")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            removeFromCart(item.book.id);
            updateCartDetails();
        });
    });
    const totalCostElement = document.createElement("div");
    totalCostElement.classList.add("cart-total");
    totalCostElement.textContent = `Total: $${totalCost}`;
    cartDetails.appendChild(totalCostElement);
}
function showCart() {
    var _a;
    const carts = document.getElementById("carts");
    carts.style.display = "block";
    (_a = carts.querySelector(".close")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        carts.style.display = "none";
    });
}
// Remove item from cart
function removeFromCart(bookId) {
    const itemIndex = cart.findIndex((item) => item.book.id === bookId);
    if (itemIndex > -1) {
        cartCount -= cart[itemIndex].quantity;
        cart.splice(itemIndex, 1);
        updateCartCount();
        updateCartCountDisplay();
        updateCartDetails();
    }
}
// Event Listeners
(_a = document.getElementById("genreFilter")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", () => {
    genreFilterChanged = true;
    applyFilters();
});
(_b = document.getElementById("sortBy")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", applyFilters);
(_c = document.getElementById("searchInput")) === null || _c === void 0 ? void 0 : _c.addEventListener("input", applyFilters);
// Initialize UI
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const books = yield fetchBooks();
        displayBooks(books);
        populateFilters();
        updateCartCountDisplay();
    });
}
init();
//# sourceMappingURL=index.js.map