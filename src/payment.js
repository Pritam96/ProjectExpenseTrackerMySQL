async function paymentHandler() {
  try {
    const token = localStorage.getItem("token");

    // Create order on the server
    const orderResponse = await axios.post(
      "http://localhost:5000/api/payment/createOrder",
      {},
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(orderResponse);

    // Extract data directly from the response
    const orderData = orderResponse.data;

    // Initialize Razorpay
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: "INR",
      name: "XYZ.io",
      description: "Payment for your service",
      order_id: orderData.id,
      handler: async function (response) {
        try {
          // Send the payment ID and other details to your server for verification
          const captureResponse = await axios.post(
            "http://localhost:5000/api/payment/capturePayment",
            response, // Send the response directly
            {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Extract data directly from the response
          // const captureData = captureResponse.data;

          // Handle the response from your server (e.g., show success message)
          // console.log(captureData);

          alert(
            "Payment successful! You can now view the LeaderBoard section."
          );

          location.reload(true);
        } catch (error) {
          console.error("Error:", error);
          alert("Payment failed! Please try again...");
        }
      },
      prefill: {
        name: "John Doe",
        email: "john.doe@example.com",
        contact: "+911234567890",
      },
      notes: {
        address: "Your Company Address",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  } catch (error) {
    console.error("Error:", error);
    alert("Unable to create order!");
  }
}
