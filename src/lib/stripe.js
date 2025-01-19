"use server";

import Order from "@/models/Order";
import connect from "./database";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const PaymentMethod = async (body) => {
  console.log(body)
  try {
    await connect();
    const newOrder = await Order.create(body);

    const transformedItem = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: body.title,
          },
          unit_amount: body.price * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: transformedItem,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/success/${newOrder._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/cancel`,
    });
    console.log(session)

    if (session) {
      const newOrder = await Order.create(body);
      if(newOrder) return session.url
    
    };
  } catch (error) {
    console.log("something went wrong");
  }
};
