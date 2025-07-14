// controllers/paymentsController.js
const { db, auth, admin } = require('../config/firebaseAdmin');
const {
  getContractorByUid,
  updateContractorCredits,
  addContractorTransaction,
  updateContractorTransaction
} = require('../models/contractorModel');

/**
 * Create Stripe checkout session for credit purchase
 */
exports.createCreditCheckoutSession = async (req, res, next) => {
  let transactionId; // Declare outside try block for error handling
  
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

    // Create initial transaction record
    transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionData = {
      id: transactionId,
      type: 'credit_purchase',
      amount: amount,
      description: `Credit purchase attempt - ${amount} CAD`,
      status: 'pending',
      timestamp: new Date(),
      metadata: {
        stripePaymentStatus: 'pending',
        currency: 'CAD',
        paymentMethod: 'card'
      }
    };
    
    await addContractorTransaction(contractorUid, transactionData);

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
        transactionId: transactionId, // Include our transaction ID
        type: 'credit_purchase'
      },
      success_url: `${process.env.FRONTEND_URL}/contractor?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/contractor/credits/purchase`,
    });

    // Update transaction with Stripe session info
    await updateContractorTransaction(contractorUid, transactionId, {
      metadata: {
        ...transactionData.metadata,
        stripeSessionId: session.id
      }
    });
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
    
    // Update transaction to failed status if we have the transaction ID
    if (transactionId) {
      try {
        await updateContractorTransaction(req.user.uid, transactionId, {
          status: 'failed',
          description: `Failed credit purchase attempt - ${req.body.amount || 0} CAD`,
          failedAt: new Date(),
          metadata: {
            error: error.message,
            failureReason: 'checkout_session_creation_failed'
          }
        });
      } catch (txnError) {
        console.error('Error updating transaction to failed status:', txnError);
      }
    } else {
      // Fallback: create new failed transaction if we don't have transactionId
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


    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`📝 Unhandled event type: ${event.type}`);
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
    const transactionId = session.metadata.transactionId;
    
    console.log(`Processing successful payment for contractor ${contractorUid}, amount: ${creditAmount}`);

    // Add credits to contractor account (without creating a transaction)
    await updateContractorCredits(contractorUid, creditAmount);

    // Update the existing transaction to completed status
    if (transactionId) {
      await updateContractorTransaction(contractorUid, transactionId, {
        status: 'completed',
        description: `Successful credit purchase - ${creditAmount} CAD`,
        completedAt: new Date(),
        metadata: {
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          stripePaymentStatus: 'paid',
          currency: 'CAD',
          paymentMethod: 'card',
          amountReceived: session.amount_total / 100 // Convert from cents
        }
      });
      console.log(`✅ Updated transaction ${transactionId} to completed status`);
    } else {
      // Fallback: create new transaction if transactionId is missing (for backward compatibility)
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
          amountReceived: session.amount_total / 100
        }
      };
      await addContractorTransaction(contractorUid, transactionData);
      console.log(`⚠️ Created new transaction as fallback (missing transactionId)`);
    }
    
    console.log(`Successfully processed payment for contractor ${contractorUid}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    
    // Update transaction to failed status if possible
    try {
      const transactionId = session.metadata?.transactionId;
      if (transactionId) {
        await updateContractorTransaction(session.metadata.contractorUid, transactionId, {
          status: 'failed',
          description: `Payment processing failed - ${session.metadata.creditAmount} CAD`,
          failedAt: new Date(),
          metadata: {
            stripeSessionId: session.id,
            error: error.message,
            failureReason: 'credit_addition_failed'
          }
        });
      }
    } catch (txnError) {
      console.error('Error updating transaction to failed status:', txnError);
    }
  }
}

/**
 * Handle successful charge event
 */
async function handleChargeSucceeded(charge) {
  try {
    console.log('Processing charge.succeeded event:', charge.id);
    console.log('Charge metadata:', charge.metadata);
    
    // For testing purposes, let's see what data we have
    console.log('Charge amount:', charge.amount / 100, charge.currency);
    
    // If this charge doesn't have our custom metadata, it might not be from our system
    if (!charge.metadata || Object.keys(charge.metadata).length === 0) {
      console.log('⚠️ Charge has no metadata, likely not from our credit purchase system');
      return;
    }

    const contractorUid = charge.metadata.contractorUid;
    const creditAmount = parseInt(charge.metadata.creditAmount);
    const transactionId = charge.metadata.transactionId;
    
    if (!contractorUid || !creditAmount) {
      console.log('⚠️ Missing contractor UID or credit amount in charge metadata');
      return;
    }

    console.log(`Processing successful charge for contractor ${contractorUid}, amount: ${creditAmount}`);

    // Add credits to contractor account (without creating a transaction)
    await updateContractorCredits(contractorUid, creditAmount);

    // Update existing transaction if transactionId is available
    if (transactionId) {
      await updateContractorTransaction(contractorUid, transactionId, {
        status: 'completed',
        description: `Successful credit purchase via charge - ${creditAmount} CAD`,
        completedAt: new Date(),
        metadata: {
          stripeChargeId: charge.id,
          stripePaymentStatus: 'paid',
          currency: charge.currency.toUpperCase(),
          paymentMethod: 'card',
          amountReceived: charge.amount / 100
        }
      });
      console.log(`✅ Updated transaction ${transactionId} from charge event`);
    } else {
      // Fallback: create new transaction (for backward compatibility or direct charge events)
      const transactionData = {
        type: 'credit_purchase',
        amount: creditAmount,
        description: `Successful credit purchase via charge - ${creditAmount} CAD`,
        status: 'completed',
        metadata: {
          stripeChargeId: charge.id,
          stripePaymentStatus: 'paid',
          currency: charge.currency.toUpperCase(),
          paymentMethod: 'card',
          amountReceived: charge.amount / 100
        }
      };
      await addContractorTransaction(contractorUid, transactionData);
      console.log(`⚠️ Created new transaction from charge event (no transactionId)`);
    }
    
    console.log(`✅ Successfully processed charge for contractor ${contractorUid}`);
  } catch (error) {
    console.error('❌ Error processing successful charge:', error);
  }
}

/**
 * Handle successful payment intent event
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Processing payment_intent.succeeded event:', paymentIntent.id);
    console.log('PaymentIntent metadata:', paymentIntent.metadata);
    
    // For testing purposes, let's see what data we have
    console.log('PaymentIntent amount:', paymentIntent.amount / 100, paymentIntent.currency);
    
    // If this payment intent doesn't have our custom metadata, it might not be from our system
    if (!paymentIntent.metadata || Object.keys(paymentIntent.metadata).length === 0) {
      console.log('⚠️ PaymentIntent has no metadata, likely not from our credit purchase system');
      return;
    }

    const contractorUid = paymentIntent.metadata.contractorUid;
    const creditAmount = parseInt(paymentIntent.metadata.creditAmount);
    const transactionId = paymentIntent.metadata.transactionId;
    
    if (!contractorUid || !creditAmount) {
      console.log('⚠️ Missing contractor UID or credit amount in payment intent metadata');
      return;
    }

    console.log(`Processing successful payment intent for contractor ${contractorUid}, amount: ${creditAmount}`);

    // Add credits to contractor account (without creating a transaction)
    await updateContractorCredits(contractorUid, creditAmount);

    // Update existing transaction if transactionId is available
    if (transactionId) {
      await updateContractorTransaction(contractorUid, transactionId, {
        status: 'completed',
        description: `Successful credit purchase via payment intent - ${creditAmount} CAD`,
        completedAt: new Date(),
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentStatus: 'succeeded',
          currency: paymentIntent.currency.toUpperCase(),
          paymentMethod: 'card',
          amountReceived: paymentIntent.amount / 100
        }
      });
      console.log(`✅ Updated transaction ${transactionId} from payment intent event`);
    } else {
      // Fallback: create new transaction (for backward compatibility)
      const transactionData = {
        type: 'credit_purchase',
        amount: creditAmount,
        description: `Successful credit purchase via payment intent - ${creditAmount} CAD`,
        status: 'completed',
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentStatus: 'succeeded',
          currency: paymentIntent.currency.toUpperCase(),
          paymentMethod: 'card',
          amountReceived: paymentIntent.amount / 100
        }
      };
      await addContractorTransaction(contractorUid, transactionData);
      console.log(`⚠️ Created new transaction from payment intent event (no transactionId)`);
    }
    
    console.log(`✅ Successfully processed payment intent for contractor ${contractorUid}`);
  } catch (error) {
    console.error('❌ Error processing successful payment intent:', error);
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    // Extract contractor UID from payment intent metadata (if available)
    const contractorUid = paymentIntent.metadata?.contractorUid;
    const transactionId = paymentIntent.metadata?.transactionId;
    
    if (!contractorUid) {
      console.warn('Payment failed but no contractor UID found in metadata');
      return;
    }

    // Update existing transaction to failed status if transactionId is available
    if (transactionId) {
      await updateContractorTransaction(contractorUid, transactionId, {
        status: 'failed',
        description: `Failed credit purchase - ${paymentIntent.amount / 100} CAD`,
        failedAt: new Date(),
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentStatus: 'failed',
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
          currency: paymentIntent.currency.toUpperCase()
        }
      });
      console.log(`✅ Updated transaction ${transactionId} to failed status`);
    } else {
      // Fallback: create new failed transaction (for backward compatibility)
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
      console.log(`⚠️ Created new failed transaction (no transactionId)`);
    }
    
    console.log(`Recorded failed payment for contractor ${contractorUid}`);
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}
