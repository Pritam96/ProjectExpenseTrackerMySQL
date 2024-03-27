const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res, next) => {
  try {
    const amount = 1000; // Amount in paise
    const currency = "INR";

    const options = {
      amount,
      currency,
      receipt: "order_receipt#1",
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const payment = await req.user.createPayment({ orderId: order.id });

    res.status(200).json({
      key_id: process.env.RAZORPAY_KEY_ID,
      ...order,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorResponse("Internal Server Error", 500));
  }
};

exports.capturePayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // Verify the payment signature
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid Signature" });
    }

    const payment = await Payment.findOne({
      where: { orderId: razorpay_order_id },
    });
    payment.paymentId = razorpay_payment_id;
    payment.status = "complete";
    const updatedPayment = await payment.save();

    req.user = await User.update(
      { isPremium: true },
      { where: { _id: req.user._id }, returning: true, plain: true }
    );

    // Send a success response to the client
    res.status(200).json({ success: true, data: updatedPayment });
  } catch (error) {
    console.error("Error capturing payment:", error);
    next(new ErrorResponse("Internal Server Error", 500));
  }
};
