let genreFilterChanged = false;
let cartCount = 0;
type CartItem = {
    book: Book;
    quantity: number;
};

let cart: CartItem[] = [];

async function fetchBooks(): Promise<Book[]> {
    try {
        const response = await fetch(`http://localhost:3000/Books`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

type Book = {
    id: number;
    title: string;
    author: string;
    genre: string;
    year: number;
    pages: number;
    publisher: string;
    description: string;
    image: string;
    price: number;
};

type Books = Book[];

// Display books
async function displayBooks(books: Books) {
    const booksList = document.getElementById("booksList");
    if (!booksList) return;
    booksList.innerHTML = "";

    books.forEach((book: Book) => {
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
        bookItem.querySelector(".buy-now")?.addEventListener("click", () => {
            showBookDetails(book);
        });
    });
}

// Show book details in a modal
function showBookDetails(book:Book) {
  const modal = document.getElementById("bookModal") as HTMLElement;
  const modalContent = modal.querySelector(".modal-content") as HTMLElement;

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

  modal.querySelector("#addToCart")?.addEventListener("click", () => {
    const quantity = parseInt((modal.querySelector("#quantity") as HTMLInputElement)?.value, 10);
    addToCart(book, quantity);
    modal.style.display = "none";
  });

  modal.querySelector(".close")?.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

// Populate genre filter dynamically
async function populateFilters() {
  const books = await fetchBooks();
  const genres = new Set<string>();

  books.forEach((book:Book) => genres.add(book.genre));

  const genreFilter = document.getElementById("genreFilter") as HTMLSelectElement;
  genreFilter .innerHTML = '<option value="">All</option>' ;
  genres.forEach((genre) => {
    const option = document.createElement("option") as HTMLOptionElement;
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Apply filters
async function applyFilters() {
  let books = await fetchBooks();
  const selectedGenre =(document.getElementById("genreFilter") as HTMLSelectElement).value.toLowerCase();
  const sortBy = (document.getElementById("sortBy") as HTMLSelectElement)?.value;
  const searchQuery = (document.getElementById("searchInput")as HTMLInputElement).value.toLowerCase();

  books = books.filter(
    (book:Book) =>
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
function addToCart(book:Book, quantity:number) {
  const existingBook = cart.find((item) => item.book.id === book.id);
  if (existingBook) {
    existingBook.quantity += quantity;
  } else {
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
  const cartCountElement = document.getElementById("cartItems")as HTMLElement;
  cartCountElement.textContent = `Cart: ${cartCount} items`;
}

// Update cart details
function updateCartDetails() {
  const cartDetails = document.getElementById("cartDetails") as HTMLElement;
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

    cartItem.querySelector(".increaseQuantity")?.addEventListener("click", () => {
        item.quantity += 1;
        (cartItem.querySelector(".quantity") as HTMLElement).textContent = item.quantity.toString();
        updateCartCount();
        updateCartCountDisplay();
        updateCartDetails();
      });

    cartItem
      .querySelector(".decreaseQuantity")?.addEventListener("click", () => {
        if (item.quantity > 1) {
          --item.quantity;
          (cartItem.querySelector(".quantity")as HTMLElement).textContent = item.quantity.toString();
          updateCartCount();
          updateCartCountDisplay();
          updateCartDetails();
        }
      });
    cartItem
      .querySelector(".remove-from-cart")?.addEventListener("click", () => {
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
  const carts = document.getElementById("carts") as HTMLElement;
  carts.style.display = "block";
  carts.querySelector(".close")?.addEventListener("click", () => {
    carts.style.display = "none";
  });
}

// Remove item from cart
function removeFromCart(bookId:number) {
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
document.getElementById("genreFilter")?.addEventListener("change", () => {
  genreFilterChanged = true;
  applyFilters();
});
document.getElementById("sortBy")?.addEventListener("change", applyFilters);
document.getElementById("searchInput")?.addEventListener("input", applyFilters);

// Initialize UI
async function init() {
  const books = await fetchBooks();
  displayBooks(books);
  populateFilters();
  updateCartCountDisplay();
}

init();
