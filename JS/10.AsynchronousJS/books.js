let genreFilterChanged = false;
let cartCount = 0;
let cart = [];

async function fetchBooks() {
  try {
    const response = await fetch(`http://localhost:3000/Books`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Display books
async function displayBooks(books) {
  const booksList = document.getElementById("booksList");
  booksList.innerHTML = "";

  books.forEach((book) => {
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
    bookItem.querySelector(".buy-now").addEventListener("click", () => {
      showBookDetails(book);
    });
  });
}

// Show book details in a modal
function showBookDetails(book) {
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

  modal.querySelector("#addToCart").addEventListener("click", () => {
    const quantity = parseInt(modal.querySelector("#quantity").value, 10);
    addToCart(book, quantity);
    modal.style.display = "none";
  });

  modal.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
  });
}

// Populate genre filter dynamically
async function populateFilters() {
  const books = await fetchBooks();
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
}

// Apply filters
async function applyFilters() {
  let books = await fetchBooks();
  const selectedGenre = document
    .getElementById("genreFilter")
    .value.toLowerCase();
  const sortBy = document.getElementById("sortBy").value;
  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase();

  books = books.filter(
    (book) =>
      (selectedGenre === "" || book.genre.toLowerCase() === selectedGenre) &&
      (searchQuery === "" || book.title.toLowerCase().includes(searchQuery))
  );

  // Sort books
  if (sortBy === "year") {
    books.sort((a, b) => a.year - b.year);
  } else if (sortBy === "pages") {
    books.sort((a, b) => a.pages - b.pages);
  }

  displayBooks(books);
}

// Adding items to cart
function addToCart(book, quantity) {
  const existingBook = cart.find((item) => item.book.id === book.id);
  if (existingBook) {
    existingBook.quantity += quantity;
  } else {
    cart.push({ book, quantity });
  }
  cartCount += quantity;
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

    cartItem
      .querySelector(".increaseQuantity")
      .addEventListener("click", () => {
        item.quantity += 1;
        cartItem.querySelector(".quantity").textContent = item.quantity;
        updateCartCount();
        updateCartCountDisplay();
        updateCartDetails();
      });

    cartItem
      .querySelector(".decreaseQuantity")
      .addEventListener("click", () => {
        if (item.quantity > 1) {
          --item.quantity;
          cartItem.querySelector(".quantity").textContent = item.quantity;
          updateCartCount();
          updateCartCountDisplay();
          updateCartDetails();
        }
      });

    cartItem
      .querySelector(".remove-from-cart")
      .addEventListener("click", () => {
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
  const carts = document.getElementById("carts");
  carts.style.display = "block";
  carts.querySelector(".close").addEventListener("click", () => {
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
document.getElementById("genreFilter").addEventListener("change", () => {
  genreFilterChanged = true;
  applyFilters();
});
document.getElementById("sortBy").addEventListener("change", applyFilters);
document.getElementById("searchInput").addEventListener("input", applyFilters);

// Initialize UI
async function init() {
  const books = await fetchBooks();
  displayBooks(books);
  populateFilters();
  updateCartCountDisplay();
}

init();
