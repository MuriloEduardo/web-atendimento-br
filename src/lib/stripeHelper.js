import Stripe from 'stripe';

let stripeInstance = null;

const getStripeInstance = () => {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

/**
 * Cria um novo customer no Stripe para a empresa
 */
export async function createStripeCustomer(company) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const customer = await stripe.customers.create({
      email: company.email || company.name,
      name: company.name,
      metadata: {
        companyId: company.id,
        companyName: company.name,
        type: company.type
      }
    });

    return customer;
  } catch (error) {
    console.error('Erro ao criar customer no Stripe:', error);
    throw new Error(`Erro ao criar customer no Stripe: ${error.message}`);
  }
}

/**
 * Atualiza os dados do customer no Stripe
 */
export async function updateStripeCustomer(stripeCustomerId, updates) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const customer = await stripe.customers.update(stripeCustomerId, updates);
    return customer;
  } catch (error) {
    console.error('Erro ao atualizar customer no Stripe:', error);
    throw new Error(`Erro ao atualizar customer no Stripe: ${error.message}`);
  }
}

/**
 * Cria uma subscription no Stripe para a empresa
 */
export async function createStripeSubscription(stripeCustomerId, priceId) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    return subscription;
  } catch (error) {
    console.error('Erro ao criar subscription no Stripe:', error);
    throw new Error(`Erro ao criar subscription no Stripe: ${error.message}`);
  }
}

/**
 * Obtém uma subscription pelo ID
 */
export async function getStripeSubscription(subscriptionId) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Erro ao buscar subscription no Stripe:', error);
    throw new Error(`Erro ao buscar subscription no Stripe: ${error.message}`);
  }
}

/**
 * Cancela uma subscription
 */
export async function cancelStripeSubscription(subscriptionId) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Erro ao cancelar subscription no Stripe:', error);
    throw new Error(`Erro ao cancelar subscription no Stripe: ${error.message}`);
  }
}

/**
 * Atualiza uma subscription
 */
export async function updateStripeSubscription(subscriptionId, updates) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);
    return subscription;
  } catch (error) {
    console.error('Erro ao atualizar subscription no Stripe:', error);
    throw new Error(`Erro ao atualizar subscription no Stripe: ${error.message}`);
  }
}

/**
 * Obtém os preços disponíveis no Stripe
 */
export async function getStripePrices() {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const prices = await stripe.prices.list({ limit: 100 });
    return prices.data;
  } catch (error) {
    console.error('Erro ao buscar preços no Stripe:', error);
    throw new Error(`Erro ao buscar preços no Stripe: ${error.message}`);
  }
}

/**
 * Obtém um produto pelo ID
 */
export async function getStripeProduct(productId) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const product = await stripe.products.retrieve(productId);
    return product;
  } catch (error) {
    console.error('Erro ao buscar produto no Stripe:', error);
    throw new Error(`Erro ao buscar produto no Stripe: ${error.message}`);
  }
}

/**
 * Cria um invoice para pagamento
 */
export async function createStripeInvoice(stripeCustomerId, items) {
  try {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe não está configurado');
    }
    
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: 'charge_automatically'
    });

    // Adicionar items ao invoice
    for (const item of items) {
      await stripe.invoiceItems.create({
        invoice: invoice.id,
        customer: stripeCustomerId,
        amount: item.amount,
        currency: item.currency || 'brl',
        description: item.description
      });
    }

    // Finalizar o invoice
    const finalizedInvoice = await stripe.invoices.finalize(invoice.id);

    return finalizedInvoice;
  } catch (error) {
    console.error('Erro ao criar invoice no Stripe:', error);
    throw new Error(`Erro ao criar invoice no Stripe: ${error.message}`);
  }
}

/**
 * Obtém informações de um payment intent
 */
export async function getStripePaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erro ao buscar payment intent no Stripe:', error);
    throw new Error(`Erro ao buscar payment intent no Stripe: ${error.message}`);
  }
}
