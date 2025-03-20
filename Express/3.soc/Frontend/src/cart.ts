// Types and Interfaces
interface Book {
    book_id: number;
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
    id: number;
    title: string;
    author: string;
    price: number;
    quantity: number;
    image: string;
}

interface User {
    user_id: number;
    name?: string;
    email: string;
    role_id: number;
    role_name?: string;
}

interface AuthResponse {
    user: User;
    token: string;
}
const ROLE_TYPES = {
    ADMIN: 1,
    LIBRARIAN: 2,
    BORROWER: 3,
};

// API URL
const API_URL = "http://localhost:3000";

// Global state
let books: Book[] = [];
let cart: CartItem[] = [];
let currentUser: User | null = null;
let token: string | null = null;
let isEditMode = false;
let currentPage = 1;
let totalPages = 1;
let booksPerPage = 8;
let currentFilters: Record<string, any> = {};

// DOM Elements
const domElements = {
    bookList: document.getElementById("bookList") as HTMLDivElement,
    searchInput: document.getElementById("searchInput") as HTMLInputElement,
    searchBtn: document.getElementById("searchBtn") as HTMLButtonElement,
    genreFilter: document.getElementById("genreFilter") as HTMLSelectElement,
    sortBy: document.getElementById("sortBy") as HTMLSelectElement,
    applyFilters: document.getElementById("applyFilters") as HTMLButtonElement,
    resetFilters: document.getElementById("resetFilters") as HTMLButtonElement,
    cartItems: document.getElementById("cartItems") as HTMLSpanElement,
    cartBtn: document.getElementById("cartBtn") as HTMLButtonElement,
    cartModal: document.getElementById("cartModal") as HTMLDivElement,
    cartDetails: document.getElementById("cartDetails") as HTMLDivElement,
    cartTotal: document.getElementById("cartTotal") as HTMLParagraphElement,
    clearCartBtn: document.getElementById("clearCartBtn") as HTMLButtonElement,
    checkoutBtn: document.getElementById("checkoutBtn") as HTMLButtonElement,
    bookModal: document.getElementById("bookModal") as HTMLDivElement,
    bookForm: document.getElementById("bookForm") as HTMLFormElement,
    bookId: document.getElementById("bookId") as HTMLInputElement,
    bookModalTitle: document.getElementById(
        "bookModalTitle"
    ) as HTMLHeadingElement,
    addBookBtn: document.getElementById("addBookBtn") as HTMLButtonElement,
    manageBooks: document.getElementById("manageBooks") as HTMLButtonElement,
    adminControls: document.getElementById("adminControls") as HTMLDivElement,
    logoutBtn: document.getElementById("logoutBtn") as HTMLButtonElement,
    authButtons: document.getElementById("authButtons") as HTMLDivElement,
    profileModal: document.getElementById("profileModal") as HTMLDivElement,
    profileSection: document.getElementById("profile-section") as HTMLDivElement,
    profileName: document.getElementById("profileName") as HTMLHeadingElement,
    profileEmail: document.getElementById("profileEmail") as HTMLParagraphElement,
    userRole: document.getElementById("userRole") as HTMLSpanElement,
    bookDetailsModal: document.getElementById(
        "bookDetailsModal"
    ) as HTMLDivElement,
    bookDetailsContent: document.getElementById(
        "bookDetailsContent"
    ) as HTMLDivElement,
    loadingIndicator: document.getElementById(
        "loadingIndicator"
    ) as HTMLDivElement,
    noResults: document.getElementById("noResults") as HTMLDivElement,
    pagination: document.getElementById("pagination") as HTMLDivElement,
    clearFiltersBtn: document.getElementById(
        "clearFiltersBtn"
    ) as HTMLButtonElement,
    loginError: document.getElementById("loginError") as HTMLDivElement,
    signupError: document.getElementById("signupError") as HTMLDivElement,
    toastContainer: document.getElementById("toastContainer") as HTMLDivElement,
};

// logout function
function logout(): void {
    // Clear user data from memory
    currentUser = null;
    token = null;
    localStorage.removeItem("token");

    // Call your logout endpoint
    fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if you're using cookie-based auth
    })
        .then((response) => {
            if (response.ok) {
                // Update UI
                updateUIForLoggedOutUser();

                // Redirect user to the specified URL
                window.location.href = "http://localhost:5173/";
            } else {
                console.error("Logout failed:", response.status);
            }
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
}

// Using a different name to avoid duplication with auth.ts
async function fetchCurrentUser(): Promise<boolean> {
    try {
        // Clear any previous error messages
        if (domElements.loginError) {
            domElements.loginError.textContent = "";
        }

        // Get token from localStorage
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            console.error("No token found in localStorage");
            throw new Error("No authentication token found");
        }
        console.log(localStorage.getItem("token")); // Check the stored token
        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // If token is invalid, clear it from storage and force re-authentication
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                throw new Error("Session expired. Please log in again.");
            }

            const errorData = await response.json();
            throw new Error(errorData.message || "Authentication failed");
        }

        const userData = await response.json();

        // Update current user data based on the response structure
        currentUser = {
            id: userData.user.userId,
            user_id: userData.user.userId,
            name: userData.user.name || "User", // Default name if not provided
            email: userData.user.email || "",
            role_id: userData.user.roleId as 1 | 2 | 3, // Enforcing strict role types
        };

        // Update token if a new one is provided
        if (userData.token) {
            console.log("New token received, updating...");
            token = userData.token;
            localStorage.setItem("token", userData.token); // Corrected token update
        } else {
            token = storedToken;
        }
        return true;
    } catch (error) {
        console.error("Getting current user failed:", error);

        // Display user-friendly error messages
        if (domElements.loginError) {
            domElements.loginError.textContent =
                error instanceof Error ? error.message : "Authentication failed";
        }

        return false;
    }
}

function updateUIForLoggedInUser(): void {
    if (!currentUser) return;

    // Update the profile section
    domElements.profileSection.innerHTML = `
    <div class="user-profile">
      <div class="user-image">
        <img src="./Images/91.jpg" alt="user image" />
      </div>
      <div class="profile-details" id="details">
        <h3>${currentUser.name || "User"}  </h3>
        <p>${
        currentUser.role_id === 1
            ? "Admin"
            : currentUser.role_id === 2
                ? "Librarian"
                : "Borrower"
    } </p>
      </div>
    </div>
  `;

    // Show admin controls if user is admin
    if (currentUser.role_id === 1) {
        domElements.adminControls.style.display = "block";
    } else {
        domElements.adminControls.style.display = "none";
    }

    // Update profile modal if it exists
    if (domElements.profileName) {
        domElements.profileName.textContent = currentUser.name || "User";
    }
    if (domElements.profileEmail) {
        domElements.profileEmail.textContent = currentUser.email || "";
    }
    if (domElements.userRole) {
        domElements.userRole.textContent =
            currentUser.role_id === 1
                ? "Admin"
                : currentUser.role_id === 2
                    ? "Librarian"
                    : "Borrower";
    }
}

function updateUIForLoggedOutUser(): void {
    domElements.authButtons.style.display = "flex";

    // Hide admin controls
    domElements.adminControls.style.display = "none";

    // Update profile section for logged out state
    domElements.profileSection.innerHTML = `
    <div class="auth-buttons" id="authButtons">
      <button id="loginBtn" class="btn">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
      <button id="signupBtn" class="btn btn-outline">
        <i class="fas fa-user-plus"></i> Sign Up
      </button>
    </div>
  `;

    // Reattach event listeners since we replaced the HTML

    function toggleUserDropdown(): void {
        const dropdown = document.getElementById("userDropdown");
        if (dropdown) {
            dropdown.classList.toggle("active");
        }
    }

    // Book CRUD operations
    async function fetchBooks(page: number = 1): Promise<void> {
        try {
            showLoading();

            const queryParams = new URLSearchParams({
                ...currentFilters,
                _page: page.toString(),
                _limit: booksPerPage.toString(),
            });

            const url = `${API_URL}/books?${queryParams}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch books");

            const totalCount = response.headers.get("X-Total-Count");
            totalPages = totalCount
                ? Math.ceil(parseInt(totalCount) / booksPerPage)
                : 1;

            books = await response.json();

            hideLoading();
            displayBooks();
            updatePagination();
        } catch (error) {
            console.error("Error fetching books:", error);
            hideLoading();
            showNoResults();
        }
    }

    function displayBooks(): void {
        if (!domElements.bookList) return;

        domElements.bookList.innerHTML = "";

        if (books.length === 0) {
            showNoResults();
            return;
        }

        hideNoResults();

        books.forEach((book) => {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";

            const coverImg =
                book.image && book.image.length > 0 ? book.image : "Images/book.png";

            bookCard.innerHTML = `
        <div class="book-cover">
          <img src="${coverImg}" alt="${book.title}" onerror="this.src='Images/book.png'">
        </div>
        <div class="book-info">
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">by ${book.author}</p>
          <div class="book-meta">
            <span class="book-genre">${book.genre}</span>
            <span class="book-year">${book.year}</span>
          </div>
          <div class="book-price">$${book.price}</div>
        </div>
        <div class="book-actions">
            <button class="btn-icon view-details" data-id="${book.book_id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon add-to-cart" data-id="${book.book_id}">
              <i class="fas fa-cart-plus"></i>
            </button>
            <button class="btn-icon add-to-wishlist" data-id="${book.book_id}">
              <i class="far fa-heart"></i>
            </button>
          </div>
      `;

            domElements.bookList.appendChild(bookCard);

            // Add event listeners for book actions
            bookCard
                .querySelector(".view-details")
                ?.addEventListener("click", () => showBookDetails(book.book_id));
            bookCard
                .querySelector(".add-to-cart")
                ?.addEventListener("click", () => addToCart(book));
            bookCard
                .querySelector(".add-to-wishlist")
                ?.addEventListener("click", (e) => toggleWishlist(e, book.book_id));
        });
    }

    async function populateFilters(): Promise<void> {
        await fetchBooks();
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

    function showBookDetails(bookId: number): void {
        const book = books.find((b) => b.book_id === bookId);
        if (!book) return;

        domElements.bookDetailsContent.innerHTML = `
      <div class="book-details">
        <div class="book-details-cover">
          <img src="${book.image || "Images/book.png"}" alt="${
            book.title
        }" onerror="this.src='Images/book.png'">
        </div>
        <div class="book-details-info">
          <h2>${book.title}</h2>
          <p class="author">by ${book.author}</p>
          <div class="book-metadata">
            <div class="metadata-item">
              <span class="label">Genre:</span>
              <span class="value">${book.genre}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Published:</span>
              <span class="value">${book.year}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Publisher:</span>
              <span class="value">${book.publisher}</span>
            </div>
            <div class="metadata-item">
              <span class="label">Pages:</span>
              <span class="value">${book.pages}</span>
            </div>
          </div>
          <div class="book-price-section">
            <div class="price">$${book.price}</div>
            <button class="btn add-to-cart-btn" data-id="${book.book_id}">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
          <div class="book-description">
            <h3>Description</h3>
            <p>${book.description}</p>
          </div>
        </div>
      </div>
        `;

        // Add event listener for the "Add to Cart" button in the details modal
        domElements.bookDetailsContent
            .querySelector(".add-to-cart-btn")
            ?.addEventListener("click", () => addToCart(book));

        // Show the book details modal
        showModal(domElements.bookDetailsModal);
    }

    function addToCart(book: Book): void {
        const existingItem = cart.find((item) => item.id === book.book_id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: book.book_id,
                title: book.title,
                author: book.author,
                price: book.price,
                quantity: 1,
                image: book.image,
            });
        }
        updateCartUI();
        showToast(`${book.title} added to cart!`);
    }

    function updateCartUI(): void {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        domElements.cartItems.textContent = totalItems.toString();

        domElements.cartDetails.innerHTML = "";
        domElements.cartDetails.className = "modal-body";
        let totalPrice = 0;

        cart.forEach((item) => {
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p>by ${item.author}</p>
        <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
        <div class="cart-item-quantity">
          <button class="btn-icon decrease-quantity" data-id="${item.id}">
            <i class="fas fa-minus"></i>
          </button>
          <span>${item.quantity}</span>
          <button class="btn-icon increase-quantity" data-id="${item.id}">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <button class="btn-icon remove-item" data-id="${item.id}">
        <i class="fas fa-trash"></i>
      </button>
    `;

            domElements.cartDetails.appendChild(cartItem);

            cartItem
                .querySelector(".decrease-quantity")
                ?.addEventListener("click", () => updateCartItemQuantity(item.id, -1));
            cartItem
                .querySelector(".increase-quantity")
                ?.addEventListener("click", () => updateCartItemQuantity(item.id, 1));
            cartItem
                .querySelector(".remove-item")
                ?.addEventListener("click", () => removeCartItem(item.id));

            totalPrice += item.price * item.quantity;
        });

        domElements.cartTotal.textContent = `Total: $${totalPrice.toFixed(2)}`;
    }

    function updateCartItemQuantity(bookId: number, change: number): void {
        const item = cart.find((item) => item.id === bookId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            removeCartItem(bookId);
        } else {
            updateCartUI();
        }
    }

    function removeCartItem(bookId: number): void {
        cart = cart.filter((item) => item.id !== bookId);
        updateCartUI();
    }

    function clearCart(): void {
        cart = [];
        updateCartUI();
        showToast("Cart cleared!");
    }

    function checkout(): void {
        if (cart.length === 0) {
            showToast("Your cart is empty!");
            return;
        }

        if (!currentUser) {
            showToast("Please log in to proceed with checkout.");
            return;
        }

        // Simulate checkout process
        showToast("Checkout successful! Thank you for your purchase.");
        clearCart();
        closeCartModal();
    }

    // Wishlist functionality
    function toggleWishlist(event: Event, bookId: number): void {
        event.preventDefault();
        if (!currentUser) {
            showToast("Please log in to add to wishlist.");
            return;
        }

        // Simulate wishlist toggle
        showToast("Added to wishlist!");
    }

    // Pagination
    function updatePagination(): void {
        domElements.pagination.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.className = `btn ${i === currentPage ? "active" : ""}`;
            pageButton.textContent = i.toString();
            pageButton.addEventListener("click", () => {
                currentPage = i;
                fetchBooks(currentPage);
            });

            domElements.pagination.appendChild(pageButton);
        }
    }

    // Modal functions
    function showModal(modal: HTMLElement): void {
        modal.style.display = "flex";
    }

    function closeModal(modal: HTMLElement): void {
        modal.style.display = "none";
    }
    function showProfileModal(): void {
        showModal(domElements.profileModal);
    }

    function closeProfileModal(): void {
        closeModal(domElements.profileModal);
    }

    function showCartModal(): void {
        showModal(domElements.cartModal);
    }

    function closeCartModal(): void {
        closeModal(domElements.cartModal);
    }

    // Toast notifications
    function showToast(
        message: string,
        type: "success" | "error" | "info" = "info"
    ): void {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;

        domElements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Loading and no results
    function showLoading(): void {
        domElements.loadingIndicator.style.display = "flex";
    }

    function hideLoading(): void {
        domElements.loadingIndicator.style.display = "none";
    }

    function showNoResults(): void {
        domElements.noResults.style.display = "flex";
    }

    function hideNoResults(): void {
        domElements.noResults.style.display = "none";
    }

    // Event listeners
    function attachEventListeners(): void {
        // Search and filter
        domElements.searchBtn.addEventListener("click", () => {
            currentFilters.search = domElements.searchInput.value;
            fetchBooks();
        });

        domElements.applyFilters.addEventListener("click", () => {
            currentFilters.genre = domElements.genreFilter.value;
            currentFilters.sortBy = domElements.sortBy.value;
            fetchBooks();
        });

        domElements.resetFilters.addEventListener("click", () => {
            currentFilters = {};
            domElements.genreFilter.value = "";
            domElements.sortBy.value = "title";
            fetchBooks();
        });

        // Cart
        domElements.cartBtn.addEventListener("click", showCartModal);
        domElements.clearCartBtn.addEventListener("click", clearCart);
        domElements.checkoutBtn.addEventListener("click", checkout);

        // Auth
        domElements.logoutBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Logout button pressed");
            console.log("This is the user", currentUser);
            logout();
        });

        // Close modals
        document.querySelectorAll(".close").forEach((closeBtn) => {
            closeBtn.addEventListener("click", () => {
                const modal = closeBtn.closest(".modal") as HTMLElement;
                if (modal) closeModal(modal);
            });
        });
    }

    // Initialize app
    async function init(): Promise<void> {
        await fetchCurrentUser(); // Changed from getCurrentUser() to fetchCurrentUser()
        await fetchBooks();
        displayBooks();
        populateFilters();
        attachEventListeners();
        updateUIForLoggedInUser();
    }

    // Start the app
    document.addEventListener("DOMContentLoaded", () => {
        init();
    });
}