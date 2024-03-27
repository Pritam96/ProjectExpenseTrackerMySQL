const crypto = require("crypto");

const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const { Op } = require("sequelize");
const db = require("../config/db");

exports.register = async (req, res, next) => {
  let transaction;

  try {
    const { username, email, phoneNumber, password } = req.body;

    transaction = await db.transaction();

    const user = await User.create(
      {
        username,
        email,
        phoneNumber,
        passwordHash: password,
      },
      { transaction }
    );

    const token = user.getSignedToken();

    // Initiate TotalExpense for that user
    await user.createTotalExpense(
      {},
      {
        transaction,
      }
    );

    await transaction.commit();

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.log(error);
    if (transaction) await transaction.rollback();
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password.", 400)
      );
    }
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      const token = user.getSignedToken();
      return res.status(200).json({ success: true, token });
    }
    return next(new ErrorResponse("Invalid Credentials.", 401));
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    // Don't run any validation before save
    await user.save({ validateBeforeSave: false });

    // Creating reset URL - http://localhost:5000/api/auth/resetPassword/:resetToken
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetPassword/${resetToken}`;

    const message = `You are receiving this email because you has requested the reset of a password. Please go to this link: \n\n${resetUrl}`;

    try {
      // Sending the un-hashed token to the user by email
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });
      res.status(200).json({ success: true, data: "Email sent successfully" });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = null;
      user.resetPasswordToken = null;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.body.resetToken)
      .digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() },
      },
    });

    if (!user) return next(new ErrorResponse("Invalid token", 400));

    await user.update({
      passwordHash: req.body.password,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });
    const token = user.getSignedToken();
    res.status(201).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

exports.setNewPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const hostUrl = `${req.protocol}://${req.get("host")}`;
  res.status(200).send(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <script src="https://kit.fontawesome.com/3da1a747b2.js"></script>
      <!-- Add Bootstrap CSS -->
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
        integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
        crossorigin="anonymous"
      />
      <!-- <link rel="stylesheet" href="css/style.css" /> -->
      <title>ExpenseTrack | Track and Manage Your Expenses with Ease</title>
    </head>
    <body>
      <!-- Navbar -->
      <nav class="navbar navbar-expand-md navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" href="${hostUrl}/index.html"
            ><i class="fas fa-wallet"></i> ExpenseTrack</a
          >
          <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto">
              <li class="nav-item">
                <a class="nav-link" href="${hostUrl}/login.html"
                  ><i class="fas fa-sign-in-alt"></i> Login</a
                >
              </li>
              <li class="nav-item">
                <a class="nav-link" href="${hostUrl}/register.html"
                  ><i class="fas fa-user-plus"></i> Register</a
                >
              </li>
              <!-- <li class="nav-item d-none d-sm-block">
                <a class="nav-link" href="#">|</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="${hostUrl}/bootcamps.html">Browse Bootcamps</a>
              </li> -->
            </ul>
          </div>
        </div>
      </nav>
  
      <section class="container mt-5">
        <div class="row">
          <div class="col-md-8 m-auto">
            <div class="card bg-white py-2 px-4">
              <div class="card-body">
                <a href="${hostUrl}/login.html">Back to login</a>
                <h1 class="mb-2">Reset Password</h1>
                <p>
                  Use this form to reset your password using the registered email
                  address.
                </p>
                <div>
                  <input
                    type="hidden"
                    name="reset-token"
                    id="reset-token"
                    value="${resetToken}"
                  />
                  <div class="form-group">
                    <label for="password">New Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      class="form-control"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="confirm-password">Confirm Password</label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      class="form-control"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <button
                      type="submit"
                      id="save-password-button"
                      class="btn btn-dark btn-block"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"
        integrity="sha512-b94Z6431JyXY14iSXwgzeZurHHRNkLt9d6bAHt7BZT38eqV+GyngIi/tVye4jBKPYQ2lBdRs0glww4fmpuLRwA=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      ></script>
      <!-- Add Bootstrap JS (popper.js is required for some Bootstrap components) -->
      <script
        src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
        integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossorigin="anonymous"
      ></script>
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
        integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"
      ></script>
      <script
        src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
        integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossorigin="anonymous"
      ></script>
      <script>
        const saveNewPasswordButton = document.getElementById(
          "save-password-button"
        );
        const enteredPassword = document.getElementById("password");
        const enteredConfirmPassword =
          document.getElementById("confirm-password");
        const resetToken = document.getElementById("reset-token");
  
        saveNewPasswordButton.addEventListener("click", async () => {
          // Get Reset token
          if (resetToken.value.trim() === "") {
            alert("Reset token is missing! Please try again");
            return;
          }
  
          if (
            enteredPassword.value === "" ||
            enteredConfirmPassword.value === ""
          ) {
            alert("Please provide all fields!");
            return;
          }
          if (enteredPassword.value !== enteredConfirmPassword.value) {
            alert("Password not matched!");
            enteredPassword.value='';
            enteredConfirmPassword.value='';
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
            window.location.replace("${hostUrl}/login.html");
          } catch (error) {
            if (error.response) alert(error.response.data.error);
            else console.log(error);
          }
        });
      </script>
    </body>
  </html>  
  `);
};
