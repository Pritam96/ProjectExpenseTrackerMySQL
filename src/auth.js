const enteredEmail = document.getElementById("email");
const enteredPassword = document.getElementById("password");
const loginButton = document.getElementById("login-button");

if (loginButton && enteredEmail && enteredPassword) {
  loginButton.addEventListener("click", async () => {
    if (enteredEmail.value === "" || enteredPassword.value === "") {
      alert("Missing required fields");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: enteredEmail.value.trim().toLowerCase(),
          password: enteredPassword.value.trim(),
        }
      );
      alert("Login is successful");
      localStorage.setItem("token", response.data.token);
      window.location.replace("./index.html");
    } catch (error) {
      alert("Invalid Credentials");
      window.location.replace("./login.html");
    }
  });
}

const registerButton = document.getElementById("register-button");
const enteredUsername = document.getElementById("username");
const enteredPhoneNumber = document.getElementById("phone");

if (
  registerButton &&
  enteredEmail &&
  enteredPassword &&
  enteredUsername &&
  enteredPhoneNumber
) {
  registerButton.addEventListener("click", async () => {
    if (
      enteredEmail.value === "" ||
      enteredPassword.value === "" ||
      enteredUsername.value === "" ||
      enteredPhoneNumber.value === ""
    ) {
      alert("Missing required fields");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          email: enteredEmail.value.trim().toLowerCase(),
          password: enteredPassword.value.trim(),
          username: enteredUsername.value.trim(),
          phoneNumber: enteredPhoneNumber.value.trim(),
        }
      );
      alert("Registration is successful");
      localStorage.setItem("token", response.data.token);
      window.location.replace("./index.html");
    } catch (error) {
      alert("Something Went Wrong!");
      location.reload(true);
    }
  });
}

const sendResetLinkButton = document.getElementById("forgot-button");

if (sendResetLinkButton && enteredEmail) {
  sendResetLinkButton.addEventListener("click", async () => {
    if (enteredEmail.value === "") {
      alert("Email Id is missing");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgotPassword",
        {
          email: enteredEmail.value.trim().toLowerCase(),
        }
      );
      console.log(response);
      if (response.data.success) {
        alert(
          "Email with password reset link send successfully. Please check your inbox!"
        );
        enteredEmail.value = "";
        window.location.replace("./login.html");
      }
    } catch (error) {
      if (error.response) alert(error.response.data.error);
      else console.log(error);
    }
  });
}
