import Stripe from "stripe";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16", // Version compatible with Stripe v14
});

export const createCustomer = async (email: string, name: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: "PayrollPro App",
      },
    });

    return customer;
  } catch (error: any) {
    console.error("Error creating Stripe customer:", error.message);
    throw new Error(`Failed to create Stripe customer: ${error.message}`);
  }
};

export const createPaymentIntent = async (
  amount: number,
  currency: string,
  customerId: string,
  metadata: any = {}
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents/paisa
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        ...metadata,
        source: "PayrollPro App",
      },
      payment_method_types: ["card"],
    });

    return paymentIntent;
  } catch (error: any) {
    console.error("Error creating payment intent:", error.message);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    console.error("Error retrieving payment intent:", error.message);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

export const createSubscription = async (
  customerId: string,
  priceId: string,
  metadata: any = {}
) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        ...metadata,
        source: "PayrollPro App",
      },
    });

    return subscription;
  } catch (error: any) {
    console.error("Error creating subscription:", error.message);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

export const createStripePrice = async (
  productId: string,
  amount: number,
  currency: string,
  nickname: string
) => {
  try {
    // For lifetime pricing, we'll create a one-time price
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100), // Stripe uses cents/paisa
      currency: currency.toLowerCase(),
      nickname,
    });

    return price;
  } catch (error: any) {
    console.error("Error creating price:", error.message);
    throw new Error(`Failed to create price: ${error.message}`);
  }
};

export const createStripeProduct = async (
  name: string,
  description: string
) => {
  try {
    const product = await stripe.products.create({
      name,
      description,
      metadata: {
        source: "PayrollPro App",
      },
    });

    return product;
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: any = {}
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment", // one-time payment
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        source: "PayrollPro App",
      },
    });

    return session;
  } catch (error: any) {
    console.error("Error creating checkout session:", error.message);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string
) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    return event;
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

export const refundPayment = async (paymentIntentId: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    return refund;
  } catch (error: any) {
    console.error("Error refunding payment:", error.message);
    throw new Error(`Failed to refund payment: ${error.message}`);
  }
};
