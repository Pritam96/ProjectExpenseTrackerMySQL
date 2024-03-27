document.addEventListener("DOMContentLoaded", async (event) => {
  const user = await getCurrentUser();
  if (!user.isPremium) {
    alert("Please buy premium to use this feature");
    window.location.replace("./index.html");
  }
  getUsersWithTotalExpense();
});

async function getUsersWithTotalExpense() {
  try {
    const response = await axios.get("http://localhost:5000/api/leaderboard", {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("User with Total Expense:", response.data.data);
    if (response.data.count > 0) createRows(response.data.data);
  } catch (error) {
    console.log(error);
  }
}

function createRows(users) {
  const divUserTotalExpenses = document.getElementById("user-total-expenses");
  divUserTotalExpenses.innerText = "";

  users.forEach((user, index) => {
    const divRowMain = document.createElement("div");
    divRowMain.classList.add("row", "no-gutters");
    divUserTotalExpenses.appendChild(divRowMain);

    const divClassBody = document.createElement("div");
    divClassBody.classList.add("card-body");
    divRowMain.appendChild(divClassBody);

    const divRow = document.createElement("div");
    divRow.classList.add("row", "text-center");
    divClassBody.appendChild(divRow);

    const divColRank = document.createElement("div");
    divColRank.classList.add("col-md-4", "col-sm-4");
    divRow.appendChild(divColRank);

    const hCardTextRank = document.createElement("h5");
    hCardTextRank.classList.add("card-text");
    hCardTextRank.innerText = index + 1;
    divColRank.appendChild(hCardTextRank);

    const divColUsername = document.createElement("div");
    divColUsername.classList.add("col-md-4", "col-sm-4");
    divRow.appendChild(divColUsername);

    const pCardTextUsername = document.createElement("p");
    pCardTextUsername.classList.add("card-text");
    pCardTextUsername.innerText = user.username;
    divColUsername.appendChild(pCardTextUsername);

    const divColTotalExpense = document.createElement("div");
    divColTotalExpense.classList.add("col-md-4", "col-sm-4");
    divRow.appendChild(divColTotalExpense);

    const pCardTextTotalExpense = document.createElement("p");
    pCardTextTotalExpense.classList.add("card-text");
    pCardTextTotalExpense.innerText = user.TotalExpense.totalExpense;
    divColTotalExpense.appendChild(pCardTextTotalExpense);
  });
}
