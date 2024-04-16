const booksArray = [];
let SEARCHED_TITLE = "";
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser tidak mendukung local storage");
    return false;
  }
  return true;
}

function generateBookObject(id, title, author, year, isComplete, lastPage) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
    lastPage,
  };
}

function findBook(bookId) {
  for (bookItem of booksArray) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (index in booksArray) {
    if (booksArray[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function makeBookLastPageElement(id, lastPage) {
  const label = document.createElement("span");
  label.innerText = "Halaman terakhir dibaca:";
  const decreaseLastPage = document.createElement("i");
  decreaseLastPage.classList.add("fa-solid");
  decreaseLastPage.classList.add("fa-minus");
  const pageNum = document.createElement("p");
  pageNum.classList.add("halaman-terakhir");
  pageNum.innerText = lastPage;
  const increaseLastPage = document.createElement("i");
  increaseLastPage.classList.add("fa-solid");
  increaseLastPage.classList.add("fa-plus");
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("edit-halaman-terakhir");
  inputContainer.append(decreaseLastPage, pageNum, increaseLastPage);
  const saveButton = document.createElement("button");
  saveButton.classList.add("green-btn");
  saveButton.innerText = "Simpan";
  saveButton.setAttribute("hidden", "");
  const overallContainer = document.createElement("div");
  overallContainer.classList.add("container-halaman-terakhir");
  overallContainer.append(label, inputContainer, saveButton);
  saveButton.addEventListener("click", function (event) {
    const bookTarget = findBook(id);
    bookTarget.lastPage = parseInt(pageNum.innerText);
    saveButton.setAttribute("hidden", "");
    saveData();
  });
  decreaseLastPage.addEventListener("click", function () {
    let newLastPage = parseInt(pageNum.innerText);
    if (newLastPage >= 1) newLastPage--;
    if (newLastPage == findBook(id).lastPage) {
      saveButton.setAttribute("hidden", "");
    } else {
      saveButton.removeAttribute("hidden");
    }
    pageNum.innerText = newLastPage;
  });
  increaseLastPage.addEventListener("click", function () {
    let newLastPage = parseInt(pageNum.innerText);
    newLastPage++;
    if (newLastPage == findBook(id).lastPage) {
      saveButton.setAttribute("hidden", "");
    } else {
      saveButton.removeAttribute("hidden");
    }
    pageNum.innerText = newLastPage;
  });
  return overallContainer;
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete, lastPage } = bookObject;
  const bookTitle = document.createElement("h2");
  bookTitle.innerHTML = title;
  const bookAuthor = document.createElement("p");
  bookAuthor.innerHTML = "<span>Penulis: </span>" + author;
  const bookYear = document.createElement("p");
  bookYear.innerHTML = "<span>Tahun: </span>" + year;
  const bookLastPage = makeBookLastPageElement(id, lastPage);
  const yellowButton = document.createElement("button");
  yellowButton.classList.add("book-btn");
  yellowButton.classList.add("yellow-book-btn");
  if (isComplete) {
    bookLastPage.style.display = "none";
    yellowButton.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Belum selesai dibaca';
    yellowButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });
  } else {
    yellowButton.innerHTML = '<i class="fa-solid fa-check"></i> Selesai dibaca';
    yellowButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });
  }
  const bookDataContainer = document.createElement("div");
  bookDataContainer.classList.add("book-data");
  bookDataContainer.append(bookTitle, bookAuthor, bookYear, bookLastPage);
  const redButton = document.createElement("button");
  redButton.classList.add("book-btn");
  redButton.classList.add("red-book-btn");
  redButton.innerHTML = '<i class="fa-solid fa-trash-can"></i> Hapus buku';
  redButton.addEventListener("click", function () {
    removeBook(id);
  });
  const bookButtonsGroup = document.createElement("div");
  bookButtonsGroup.classList.add("book-item-action-btn");
  bookButtonsGroup.append(yellowButton, redButton);
  const bookItemContainer = document.createElement("div");
  bookItemContainer.classList.add("book-item");
  bookItemContainer.setAttribute("id", `book-${id}`);
  bookItemContainer.append(bookDataContainer, bookButtonsGroup);
  return bookItemContainer;
}

function addBook(isComplete) {
  const id = generateId();
  const title = document.getElementById("input-judul").value;
  const author = document.getElementById("input-penulis").value;
  const year = parseInt(document.getElementById("input-tahun").value);
  const lastPage = parseInt(document.getElementById("input-halaman-terakhir").value);
  const bookObject = generateBookObject(id, title, author, year, isComplete, lastPage);
  booksArray.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  booksArray.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(booksArray);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      booksArray.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  const searchForm = document.getElementById("searchBook");
  const bookTitleInput = document.getElementById("searchBookTitle");
  const clearSearchForm = document.getElementById("clearSearchField");
  submitForm.addEventListener("submit", function (event) {
    // event.preventDefault();
    const submitButtonValue = event.submitter.value;
    if (submitButtonValue === "button-1") {
      console.log("button-1 diklik");
      addBook(true);
    } else if (submitButtonValue === "button-2") {
      console.log("button-2 diklik");
      addBook(false);
    }
  });
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    SEARCHED_TITLE = bookTitleInput.value;
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
  bookTitleInput.addEventListener("input", function () {
    clearSearchForm.style.display = "flex";
  });
  bookTitleInput.addEventListener("change", function () {
    if (bookTitleInput.value === "") {
      clearSearchForm.style.display = "none";
    }
  });
  clearSearchForm.addEventListener("click", function () {
    SEARCHED_TITLE = "";
    bookTitleInput.value = "";
    clearSearchForm.style.display = "none";
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log("Data yang disimpan:\n" + localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBooks = document.getElementById("container-uncompleted-book");
  const completedBooks = document.getElementById("container-completed-book");
  uncompletedBooks.innerHTML = "";
  completedBooks.innerHTML = "";
  let filteredBooksArray = [];
  if (SEARCHED_TITLE === "") {
    filteredBooksArray = booksArray.map((x) => x);
  } else {
    filteredBooksArray = booksArray.filter((book) => book.title.toLowerCase().includes(SEARCHED_TITLE.toLowerCase()));
  }
  for (bookItem of filteredBooksArray) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completedBooks.append(bookElement);
    } else {
      uncompletedBooks.append(bookElement);
    }
  }
});
