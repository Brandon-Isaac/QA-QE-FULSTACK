let cartCount: number = 0;
let cart: CartItem[] = [];

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
}

interface CartItem {
  title: string;
  author: string;
  price: number;
  quantity: number;
}

// Fetch books from the backend
async function fetchBooks(
  params: Record<string, string> = {}
): Promise<Book[]> {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `http://localhost:4000/api/books?${queryParams}`;
    console.log("Fetching books from:", url);

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

// Display books in the UI
async function displayBooks(books: Book[]): Promise<void> {
  const bookList = document.getElementById("bookList") as HTMLUListElement;
  if (!bookList) return;
  bookList.innerHTML = "";

  if (books.length === 0) {
    bookList.innerHTML = "<p>No books found matching your search criteria.</p>";
    return;
  }

  books.forEach((book) => {
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

    bookItem.querySelector(".addToCart")?.addEventListener("click", () => {
      addToCart(book.title, book.author, book.price);
    });
  });
}

// Populate genre filter options
async function populateFilters(): Promise<void> {
  const books = await fetchBooks();
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

// Handle search, filter, and sort
async function handleSearch(): Promise<void> {
  const searchQuery = (
    document.getElementById("searchInput") as HTMLInputElement
  )?.value.trim();
  const selectedGenre = (
    document.getElementById("genreFilter") as HTMLSelectElement
  )?.value;
  const sortBy = (document.getElementById("sortBy") as HTMLSelectElement)
    ?.value;

  const params: Record<string, string> = {};

  if (searchQuery) params.search = searchQuery;
  if (selectedGenre) params.genre = selectedGenre;
  if (sortBy) params.sortBy = sortBy;

  const books = await fetchBooks(params);
  displayBooks(books);
}

// Add a book to the cart
function addToCart(title: string, author: string, price: number): void {
  const existingItem = cart.find((item) => item.title === title);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ title, author, price, quantity: 1 });
  }

  cartCount++;
  updateCartCountDisplay();
}

// Update the cart count in the UI
function updateCartCountDisplay(): void {
  const cartCountElement = document.getElementById("cartItems");
  if (cartCountElement) {
    cartCountElement.textContent = `${cartCount}`;
  }
}

// Show the cart modal
function showCartModal(): void {
  const modal = document.getElementById("modal") as HTMLDivElement;
  const modalMessage = document.getElementById(
    "modalMessage"
  ) as HTMLDivElement;
  const modalDetails = document.getElementById(
    "modalDetails"
  ) as HTMLDivElement;

  if (!modal || !modalMessage || !modalDetails) return;

  if (cart.length === 0) {
    modalMessage.innerHTML = "<p>Your cart is empty.</p>";
    modalDetails.innerHTML = "";
  } else {
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
function closeModal(): void {
  const modal = document.getElementById("modal") as HTMLDivElement;
  if (modal) modal.style.display = "none";
}

// Set up event listeners
function setupEventListeners(): void {
  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement;
  searchInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });

  document
    .getElementById("genreFilter")
    ?.addEventListener("change", handleSearch);
  document.getElementById("sortBy")?.addEventListener("change", handleSearch);

  document.querySelector(".cart img")?.addEventListener("click", showCartModal);
  document.querySelector(".close")?.addEventListener("click", closeModal);
}

// Initialize the app
async function init(): Promise<void> {
  const books = await fetchBooks();
  displayBooks(books);
  populateFilters();
  updateCartCountDisplay();
  setupEventListeners();
}

// Start the app
init();
