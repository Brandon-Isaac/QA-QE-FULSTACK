// Global variables
let cartCount: number = 0;
let cart: CartItem[] = [];

// Interfaces
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
  publisher: string;
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
    const url = `http://localhost:3000/books?${queryParams}`;
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
  async function fetchBookImage(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        return imageUrl;
      } else {
        throw new Error("Image not found");
      }
    } catch {
      return "Images/book.png";
    }
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

    const imageUrl = await fetchBookImage(book.image);

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

    bookItem.querySelector(".addToCart")?.addEventListener("click", () => {
      addToCart(book.title, book.author, book.price);
    });
    // Handle Delete with Confirmation
    bookItem.querySelector(".delete-icon")?.addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
        deleteBook(book.id, bookItem);
      }
    });

    // Handle Edit (opens modal)
    bookItem.querySelector(".edit-icon")?.addEventListener("click", () => {
      openEditModal(book);
    });
  }
  // Function to Delete a Book
  function deleteBook(bookId: number, bookElement: HTMLElement) {
    fetch(`http://localhost:3000/books/${bookId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to delete book");
        bookElement.remove(); // Remove from UI
      })
      .catch((error) => console.error("Error deleting book:", error));
  }

  // Function to Open Edit Modal
  function openEditModal(book: any) {
    (document.getElementById("editBookId") as HTMLInputElement).value = book.id;
    (document.getElementById("editTitle") as HTMLInputElement).value =
      book.title;
    (document.getElementById("editAuthor") as HTMLInputElement).value =
      book.author;
    (document.getElementById("editPrice") as HTMLInputElement).value =
      book.price;

    editModal.style.display = "block";
  }

  // Close Edit Modal
  document.querySelector(".close-modal")?.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // Handle Edit Form Submission
  document
    .getElementById("editBookForm")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      const bookId = (document.getElementById("editBookId") as HTMLInputElement)
        .value;
      const updatedBook = {
        title: (document.getElementById("editTitle") as HTMLInputElement).value,
        author: (document.getElementById("editAuthor") as HTMLInputElement)
          .value,
        price: parseFloat(
          (document.getElementById("editPrice") as HTMLInputElement).value
        ),
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
  const cartModal = document.getElementById("cartModal") as HTMLDivElement;
  const cartDetails = document.getElementById("cartDetails") as HTMLDivElement;
  const cartTotal = document.getElementById(
    "cartTotal"
  ) as HTMLParagraphElement;

  if (!cartModal || !cartDetails || !cartTotal) return;

  if (cart.length === 0) {
    cartDetails.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.innerHTML = "";
  } else {
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
function closeCartModal(): void {
  const cartModal = document.getElementById("cartModal") as HTMLDivElement;
  if (cartModal) cartModal.style.display = "none";
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

  const addBookBtn = document.getElementById("addBookBtn") as HTMLButtonElement;
  const bookModal = document.getElementById("bookModal") as HTMLDivElement;
  const closeModalBtn = document.querySelector(".close") as HTMLSpanElement;

  addBookBtn?.addEventListener("click", () => {
    bookModal.style.display = "flex";
  });

  closeModalBtn?.addEventListener("click", () => {
    bookModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === bookModal) {
      bookModal.style.display = "none";
    }
  });

  document
    .getElementById("bookForm")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const id = parseInt(
        (document.getElementById("id") as HTMLInputElement).value,
        10
      );
      const title = (document.getElementById("title") as HTMLInputElement)
        .value;
      const author = (document.getElementById("author") as HTMLInputElement)
        .value;
      const year = parseInt(
        (document.getElementById("year") as HTMLInputElement).value,
        10
      );
      const genre = (document.getElementById("genre") as HTMLInputElement)
        .value;
      const pages = parseInt(
        (document.getElementById("pages") as HTMLInputElement).value,
        10
      );
      const publisher = (
        document.getElementById("publisher") as HTMLInputElement
      ).value;
      const description = (
        document.getElementById("description") as HTMLInputElement
      ).value;
      const image = (document.getElementById("image") as HTMLInputElement)
        .value;
      const price = parseInt(
        (document.getElementById("price") as HTMLInputElement).value,
        10
      );

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
        const response = await fetch("http://localhost:3000/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book),
        });

        if (!response.ok) throw new Error("Failed to add book");

        const newBook = await response.json();
        console.log("Book added:", newBook);

        // Refresh books list
        const books = await fetchBooks();
        displayBooks(books);

        // Close modal
        bookModal.style.display = "none";
      } catch (error) {
        console.error("Error:", error);
      }
    });
}
// Initialize the app
async function init(): Promise<void> {
  const books = await fetchBooks();
  displayBooks(books);
  populateFilters();
  setupEventListeners();
}

// Start the app
init();
