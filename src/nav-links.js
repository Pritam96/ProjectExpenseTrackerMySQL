const token = localStorage.getItem("token");
let currentUser;

if (!token) {
  alert("Token is missing");
  window.location.replace("./login.html");
}

document.addEventListener("DOMContentLoaded", (event) => {
  getCurrentUser();
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

    if (currentUser.username) showLoggedInUsername(currentUser.username);

    buyPremiumHideUnhide();

    return response.data.data;
  } catch (error) {
    console.log(error);
  }
}

function buyPremiumHideUnhide() {
  const buyButton = document.getElementById("buy-button");
  if (currentUser.isPremium) {
    buyButton.hidden = true;
  } else {
    buyButton.hidden = false;
  }
}

function logoutHandler() {
  localStorage.removeItem("token");
  window.location.replace("./login.html");
}

function showLoggedInUsername(name) {
  const displayUsernameSection = document.getElementById("username");
  if (name) displayUsernameSection.innerText = " " + name;
}
