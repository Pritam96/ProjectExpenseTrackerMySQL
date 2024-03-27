let paginationNext;
let paginationPrev;
let paginationTotal;
let paginationCurrent;

let startDate;
let endDate;

const viewTypeSelector = document.getElementById("view-type");
const weekPickerSection = document.getElementById("week-picker-section");
const monthPickerSection = document.getElementById("month-picker-section");
const weekPicker = document.getElementById("week-picker");
const monthPicker = document.getElementById("month-picker");

const buttonDownload = document.getElementById("download-button");

viewTypeSelector.addEventListener("change", () => {
  if (viewTypeSelector.value === "weekly") {
    monthPickerSection.hidden = true;
    weekPickerSection.hidden = false;

    weekPicker.addEventListener("change", () => {
      console.log("Selected Week:", weekPicker.value);

      const start = moment(weekPicker.value + "-1")
        .startOf("isoWeek")
        .format("YYYY-MM-DD");
      const end = moment(weekPicker.value + "-7")
        .endOf("isoWeek")
        .format("YYYY-MM-DD");

      startDate = start;
      endDate = end;
      getExpenseByDateRange();
    });
  } else if (viewTypeSelector.value === "monthly") {
    weekPickerSection.hidden = true;
    monthPickerSection.hidden = false;

    monthPicker.addEventListener("change", () => {
      console.log("Selected Month:", monthPicker.value);
      const start = moment(monthPicker.value)
        .startOf("month")
        .format("YYYY-MM-DD");
      const end = moment(monthPicker.value).endOf("month").format("YYYY-MM-DD");

      startDate = start;
      endDate = end;
      getExpenseByDateRange();
    });
  } else {
    weekPickerSection.hidden = true;
    monthPickerSection.hidden = true;
  }
});

async function getExpenseByDateRange(page, limit) {
  console.log(startDate, endDate);

  let url = `http://localhost:5000/api/report?startDate=${startDate}&endDate=${endDate}`;

  if (page || limit) {
    url += "&";
    if (page) url += `page=${page}`;
    if (page && limit) url += "&";
    if (limit) url += `limit=${limit}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Expenses:", response.data.data);
    console.log("Pagination:", response.data.pagination);

    if (response.data.count > 0) {
      document.getElementById("nav-pagination").hidden = false;
      populateExpenses(response.data.data);
      loadPagination(response.data.pagination);
      buttonDownload.hidden = false;
    } else {
      document.getElementById("nav-pagination").hidden = true;
      const expenseList = document.getElementById("expense-list");
      expenseList.innerText = "";
      const pNotFound = document.createElement("p");
      pNotFound.innerText = "No expenses found!";
      pNotFound.classList.add("text-center");
      expenseList.appendChild(pNotFound);
      buttonDownload.hidden = true;
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
    divColInfo.classList.add("col-md-12");
    divRow.appendChild(divColInfo);

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
  });
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
        getExpenseByDateRange(paginationPrev.page, paginationPrev.limit);
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
            getExpenseByDateRange(i, null);
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
        getExpenseByDateRange(paginationNext.page, paginationNext.limit);
      };
    }
  }
}

buttonDownload.addEventListener("click", async () => {
  try {
    let url = `http://localhost:5000/api/report/download?startDate=${startDate}&endDate=${endDate}`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `expenses_${Date.now()}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.log(error);
  }
});
