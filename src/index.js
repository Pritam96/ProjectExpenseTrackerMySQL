// const token = localStorage.getItem("token");
// let currentUser;

let paginationNext;
let paginationPrev;
let paginationTotal;
let paginationCurrent;

// if (!token) {
//   alert("Token is missing");
//   window.location.replace("./login.html");
// }

document.addEventListener("DOMContentLoaded", (event) => {
  resetForm();
  getCurrentUser();
  getExpenses();
});

async function getCurrentUser() {
  try {
    const response = await axios.get("http://localhost:5000/api/user/getMe", {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Current User:", response.data.data);
    console.log("CURRENT USER FETCHED");
    currentUser = response.data.data;

    buyPremiumHideUnhide();

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
}

async function getCategories() {
  try {
    const response = await axios.get("http://localhost:5000/api/category", {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Categories:", response.data.data);
    console.log("CATEGORIES FETCHED");
    if (response.data.data.count !== 0)
      populateCategories(response.data.data.categories);
  } catch (error) {
    console.log(error);
  }
}

function populateCategories(categories) {
  const categorySelect = document.getElementById("expense-category");
  categorySelect.innerText = "";

  categories.forEach((category) => {
    const optionElement = document.createElement("option");
    optionElement.value = category._id;
    optionElement.innerText = category.categoryName;
    categorySelect.appendChild(optionElement);
  });
}

// Create or Modify Expense Button
const createEditExpenseButton = document.getElementById(
  "add-or-edit-expense-button"
);
createEditExpenseButton?.addEventListener("click", createOrEditExpense);

async function createOrEditExpense() {
  const expenseId = document.getElementById("expense-id");
  const expenseTitle = document.getElementById("expense-title");
  const expenseAmount = document.getElementById("expense-amount");
  const selectedCategory = document.getElementById("expense-category");
  const subExpense = document.getElementById("expense-sub");

  const expenseData = {
    statement: expenseTitle.value.trim(),
    amount: +expenseAmount.value.trim(),
    category: selectedCategory.value,
  };

  if (subExpense?.value.trim() !== "")
    expenseData.subExpense = subExpense.value.trim();

  console.log("Entered Expense Data:", expenseData);

  try {
    if (expenseId.value === "") {
      const response = await axios.post(
        "http://localhost:5000/api/expense",
        expenseData,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Create Expense:", response.data.data);
      console.log("EXPENSE ADDED");
    } else {
      const response = await axios.post(
        `http://localhost:5000/api/expense/${expenseId.value}`,
        expenseData,
        {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Modified Expense:", response.data.data);
      console.log("EXPENSE EDITED");
    }
    resetForm();
    getExpenses();
  } catch (error) {
    console.log(error);
  }
}

const selectedCategory = document.getElementById("expense-category");

async function getExpenses(page, limit) {
  try {
    let url = "http://localhost:5000/api/expense";
    if (page || limit) {
      url += "?";
      if (page) url += `page=${page}`;
      if (page && limit) url += "&";
      if (limit) url += `limit=${limit}`;
    }

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Get Expenses:", response.data.data);

    console.log("Pagination:", response.data.pagination);

    console.log("EXPENSES FETCHED");
    if (response.data.count !== 0) {
      populateExpenses(response.data.data);
      document.getElementById("nav-pagination").hidden = false;
      loadPagination(response.data.pagination);
    } else {
      const expenseList = document.getElementById("expense-list");
      expenseList.innerText = "";
      const pNotFound = document.createElement("p");
      pNotFound.innerText = "No expenses found!";
      pNotFound.classList.add("text-center");
      expenseList.appendChild(pNotFound);
      document.getElementById("nav-pagination").hidden = true;
    }
  } catch (error) {
    console.log(error);
  }
}

function populateExpenses(expenses) {
  const expenseList = document.getElementById("expense-list");
  expenseList.innerText = "";

  expenses.forEach((expense) => {
    const divCard = document.createElement("div");
    divCard.classList.add("card", "mb-3");
    expenseList.appendChild(divCard);

    const divRow = document.createElement("div");
    divRow.classList.add("row", "no-gutters");
    divCard.appendChild(divRow);

    const divColInfo = document.createElement("div");
    divColInfo.classList.add("col-md-8");
    divRow.appendChild(divColInfo);

    const divColAction = document.createElement("div");
    divColAction.classList.add("col-md-4");
    divRow.appendChild(divColAction);

    const divCardBodyInfo = document.createElement("div");
    divCardBodyInfo.classList.add("card-body");
    divColInfo.appendChild(divCardBodyInfo);

    const hCardTitleAmount = document.createElement("h4");
    hCardTitleAmount.classList.add("card-title");
    hCardTitleAmount.innerText = `₹${expense.amount}`;
    divCardBodyInfo.appendChild(hCardTitleAmount);

    const pCardSubtitleStatement = document.createElement("p");
    pCardSubtitleStatement.classList.add("card-subtitle", "mb-2", "text-muted");
    pCardSubtitleStatement.innerText = expense.statement;
    divCardBodyInfo.appendChild(pCardSubtitleStatement);

    if (expense.subExpense) {
      const pCardTextSubExpense = document.createElement("p");
      pCardTextSubExpense.classList.add("card-text");
      pCardTextSubExpense.innerText = expense.subExpense;
      divCardBodyInfo.appendChild(pCardTextSubExpense);
    }

    const spanBadgeCreatedAt = document.createElement("span");
    spanBadgeCreatedAt.classList.add("badge", "badge-dark", "mb-2", "mr-2");
    spanBadgeCreatedAt.innerText = moment(expense.createdAt).format(
      "MMMM Do YYYY, h:mm:ss a"
    );
    divCardBodyInfo.appendChild(spanBadgeCreatedAt);

    const spanBadgeCategory = document.createElement("span");
    spanBadgeCategory.classList.add("badge", "badge-success");
    spanBadgeCategory.innerText = expense.category.categoryName;
    divCardBodyInfo.appendChild(spanBadgeCategory);

    const divCardBodyAction = document.createElement("div");
    divCardBodyAction.classList.add("card-body", "float-right");
    divColAction.appendChild(divCardBodyAction);

    const buttonEdit = document.createElement("button");
    buttonEdit.classList.add("btn", "btn-sm", "btn-info", "btn-block");
    buttonEdit.innerText = "Edit";
    divCardBodyAction.appendChild(buttonEdit);

    const buttonDelete = document.createElement("button");
    buttonDelete.classList.add("btn", "btn-sm", "btn-danger", "btn-block");
    buttonDelete.innerText = "Delete";
    divCardBodyAction.appendChild(buttonDelete);

    buttonEdit.addEventListener("click", () => {
      populateExpenseForEdit(expense);
    });
    buttonDelete.addEventListener("click", () => {
      deleteExpense(expense);
    });
  });
}

function populateExpenseForEdit(expense) {
  const expenseId = document.getElementById("expense-id");
  const expenseTitle = document.getElementById("expense-title");
  const expenseAmount = document.getElementById("expense-amount");
  const selectedCategory = document.getElementById("expense-category");
  const subExpense = document.getElementById("expense-sub");

  expenseId.value = expense._id;
  expenseTitle.value = expense.statement;
  expenseAmount.value = expense.amount;
  selectedCategory.value = expense.categoryId;
  if (expense.subExpense) subExpense.value = expense.subExpense;

  createEditExpenseButton.innerText = "Edit Expense";
}

// Reset Button
// const resetExpenseButton = document.getElementById("reset-expense-button");
// resetExpenseButton.addEventListener("click", resetForm);

function resetForm() {
  const expenseId = document.getElementById("expense-id");
  const expenseTitle = document.getElementById("expense-title");
  const expenseAmount = document.getElementById("expense-amount");
  const selectedCategory = document.getElementById("expense-category");
  const subExpense = document.getElementById("expense-sub");

  expenseId.value = "";
  expenseTitle.value = "";
  expenseAmount.value = "";
  subExpense.value = "";

  getCategories();
  selectedCategory.selectIndex = 0;

  createEditExpenseButton.innerText = "Save Expense";
}

async function deleteExpense(expense) {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/expense/${expense._id}`,
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Delete Expenses:", response.data.data);
    console.log("EXPENSE DELETED");
    getExpenses();
  } catch (error) {
    console.log(error);
  }
}

function logoutHandler() {
  localStorage.removeItem("token");
  window.location.replace("./login.html");
}

function loadPagination(pagination) {
  if (JSON.stringify(pagination) !== "{}") {
    if (pagination.next) {
      paginationNext = pagination.next;
    } else {
      paginationNext = undefined;
    }
    if (pagination.prev) {
      paginationPrev = pagination.prev;
    } else {
      paginationPrev = undefined;
    }
    paginationTotal = pagination.total;
    paginationCurrent = pagination.current;
  }

  const navPagination = document.getElementById("nav-pagination");
  navPagination.innerText = "";

  if (paginationNext || paginationPrev) {
    const ulPagination = document.createElement("ul");
    ulPagination.classList.add("pagination");
    navPagination.appendChild(ulPagination);

    if (paginationPrev) {
      const liPageItemPrev = document.createElement("li");
      liPageItemPrev.classList.add("page-item");
      ulPagination.appendChild(liPageItemPrev);
      const aPageLinkPrev = document.createElement("a"); // Previous Link
      aPageLinkPrev.classList.add("page-link");
      aPageLinkPrev.innerText = "Previous";
      liPageItemPrev.appendChild(aPageLinkPrev);
      aPageLinkPrev.onclick = function () {
        console.log("Previous clicked. Go to page:", paginationPrev.page);
        getExpenses(paginationPrev.page, paginationPrev.limit);
      };
    }

    if (paginationTotal > 1) {
      // show all page numbers
      let start = paginationCurrent || 1;
      let stop = start + 4 > paginationTotal ? paginationTotal : start + 4;
      if (paginationTotal)
        for (let i = start; i <= stop; i++) {
          const liPageItem = document.createElement("li");
          liPageItem.classList.add("page-item");
          ulPagination.appendChild(liPageItem);

          const aPageLink = document.createElement("a");
          aPageLink.classList.add("page-link");
          aPageLink.innerText = i;
          liPageItem.appendChild(aPageLink);

          aPageLink.onclick = function () {
            console.log("Go to page:", i);
            getExpenses(i, null);
          };
        }
    }

    if (paginationNext) {
      const liPageItemNext = document.createElement("li");
      liPageItemNext.classList.add("page-item");
      ulPagination.appendChild(liPageItemNext);

      const aPageLinkNext = document.createElement("a"); // Next Link
      aPageLinkNext.classList.add("page-link");
      aPageLinkNext.innerText = "Next";
      liPageItemNext.appendChild(aPageLinkNext);

      aPageLinkNext.onclick = function () {
        console.log("Next clicked Go to page:", paginationNext.page);
        getExpenses(paginationNext.page, paginationNext.limit);
      };
    }
  }
}
