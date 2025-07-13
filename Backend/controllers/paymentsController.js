// controllers/paymentsController.js
const { db, auth, admin } = require('../config/firebaseAdmin');
const {
  getContractorByUid,
  addContractorCredits,
  addContractorTransaction
} = require('../models/contractorModel');

/**
 * Create Stripe checkout session for credit purchase
 */
exports.createCreditCheckoutSession = async (req, res, next) => {
  try {

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const contractorUid = req.user.uid;
    const { amount } = req.body; // Amount in CAD
    console.log(`Creating checkout session for contractor ${contractorUid} with amount: ${amount}`);

    // Validation
    if (!amount || typeof amount !== 'number' || amount < 20 || amount > 500) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be between $20 and $500 CAD'
      });
    }

    // Get contractor details
    const contractor = await getContractorByUid(contractorUid);
    if (!contractor) {
      return res.status(404).json({
        success: false,
        error: 'Contractor profile not found'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'cad',
      customer_email: contractor.email,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${amount} Credits Purchase`,
              description: `Purchase ${amount} credits for lead marketplace (1 CAD = 1 Credit)`,
            },
            unit_amount: amount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        contractorUid: contractorUid,
        creditAmount: amount.toString(),
        type: 'credit_purchase'
      },
      success_url: `${process.env.FRONTEND_URL}/contractor/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/contractor/credits/purchase`,
    });

    // Record the pending transaction
    const transactionData = {
      type: 'credit_purchase',
      amount: amount,
      description: `Credit purchase attempt - ${amount} CAD`,
      status: 'pending',
      metadata: {
        stripeSessionId: session.id,
        stripePaymentStatus: 'pending',
        currency: 'CAD',
        paymentMethod: 'card'
      }
    };
    
    await addContractorTransaction(contractorUid, transactionData);
    console.log(`Checkout session created successfully for contractor ${contractorUid}, session ID: ${session.id}`);

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: amount,
      currency: 'CAD',
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    
    // Record failed transaction attempt
    try {
      const transactionData = {
        type: 'credit_purchase',
        amount: req.body.amount || 0,
        description: `Failed credit purchase attempt - ${req.body.amount || 0} CAD`,
        status: 'failed',
        metadata: {
          error: error.message,
          failureReason: 'checkout_session_creation_failed'
        }
      };
      await addContractorTransaction(req.user.uid, transactionData);
    } catch (txnError) {
      console.error('Error recording failed transaction:', txnError);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create payment session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handle Stripe webhook for payment confirmations
 */
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    console.log('=== STRIPE WEBHOOK DEBUG ===');
    console.log('Headers:', req.headers['stripe-signature'] ? 'Present' : 'Missing');
    console.log('Body type:', typeof req.body);
    console.log('Body is Buffer:', Buffer.isBuffer(req.body));
    console.log('Body length:', req.body ? req.body.length : 'undefined');
    console.log('============================');

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('✅ Webhook signature verified successfully');
      console.log('Event type:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful payment completion
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    const contractorUid = session.metadata.contractorUid;
    const creditAmount = parseInt(session.metadata.creditAmount);
    
    console.log(`Processing successful payment for contractor ${contractorUid}, amount: ${creditAmount}`);

    // Add credits to contractor account
    await addContractorCredits(contractorUid, creditAmount);

    // Record successful transaction
    const transactionData = {
      type: 'credit_purchase',
      amount: creditAmount,
      description: `Successful credit purchase - ${creditAmount} CAD`,
      status: 'completed',
      metadata: {
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        stripePaymentStatus: 'paid',
        currency: 'CAD',
        paymentMethod: 'card',
        amountReceived: session.amount_total / 100 // Convert from cents
      }
    };
    
    await addContractorTransaction(contractorUid, transactionData);
    
    console.log(`Successfully processed payment for contractor ${contractorUid}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    
    // Record the processing failure
    try {
      const transactionData = {
        type: 'credit_purchase',
        amount: parseInt(session.metadata.creditAmount),
        description: `Payment processing failed - ${session.metadata.creditAmount} CAD`,
        status: 'failed',
        metadata: {
          stripeSessionId: session.id,
          error: error.message,
          failureReason: 'credit_addition_failed'
        }
      };
      await addContractorTransaction(session.metadata.contractorUid, transactionData);
    } catch (txnError) {
      console.error('Error recording processing failure:', txnError);
    }
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    // Extract contractor UID from payment intent metadata (if available)
    const contractorUid = paymentIntent.metadata?.contractorUid;
    if (!contractorUid) {
      console.warn('Payment failed but no contractor UID found in metadata');
      return;
    }

    // Record failed transaction
    const transactionData = {
      type: 'credit_purchase',
      amount: paymentIntent.amount / 100, // Convert from cents
      description: `Failed credit purchase - ${paymentIntent.amount / 100} CAD`,
      status: 'failed',
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
        stripePaymentStatus: 'failed',
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        currency: paymentIntent.currency.toUpperCase()
      }
    };
    
    await addContractorTransaction(contractorUid, transactionData);
    
    console.log(`Recorded failed payment for contractor ${contractorUid}`);
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}
