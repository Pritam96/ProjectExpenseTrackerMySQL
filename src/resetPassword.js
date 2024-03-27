const saveNewPasswordButton = document.getElementById("save-password-button");
const enteredPassword = document.getElementById("password");
const enteredConfirmPassword = document.getElementById("confirm-password");
const resetToken = document.getElementById("reset-token");

saveNewPasswordButton.addEventListener("click", async () => {
  // Get Reset token
  if (resetToken.value.trim() === "") {
    alert("Reset token is missing! Please try again");
    return;
  }

  if (enteredPassword.value === "" || enteredConfirmPassword.value === "") {
    alert("Please provide all fields!");
    return;
  }
  if (enteredPassword.value !== enteredConfirmPassword.value) {
    alert("Password not matched!");
    enteredPassword.value = "";
    enteredConfirmPassword.value = "";
    return;
  }
  try {
    const response = await axios.put(
      "http://localhost:5000/api/auth/resetPassword",
      {
        resetToken: resetToken.value.trim(),
        password: enteredPassword.value.trim(),
      }
    );
    console.log(response);
    alert("Password changed successfully!");
    resetToken.value = "";
    enteredPassword.value = "";
    enteredConfirmPassword.value = "";
    window.location.replace("./login.html");
  } catch (error) {
    if (error.response) alert(error.response.data.error);
    else console.log(error);
  }
});
