export const fetchBooks = async (filter: string = "") => {
  const response = await fetch(`http://localhost:5000/api/books${filter}`);
  return response.json();
};
