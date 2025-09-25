import { NextResponse } from 'next/server'

// Mock Stripe test purchase
export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  try {
    const { flightId, amount, currency } = await request.json()
    
    console.log('💸 Stripe: Processing test purchase...')
    console.log('Flight ID:', flightId)
    console.log('Amount:', amount, currency.toUpperCase())
    
    // Simulate Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock successful payment intent
    const paymentIntent = {
      id: 'pi_test_' + Date.now(),
      amount: amount,
      currency: currency,
      status: 'succeeded',
      charges: {
        data: [{
          id: 'ch_test_' + Date.now(),
          receipt_url: 'https://pay.stripe.com/receipts/test_receipt_' + Date.now()
        }]
      }
    }
    
    // In production, this would:
    // 1. Create PaymentIntent with customer's saved payment method
    // 2. Confirm the payment
    // 3. Handle 3D Secure if required
    // 4. Create booking with airline/booking system
    // 5. Send confirmation email
    
    console.log('✅ Stripe: Test purchase successful')
    console.log('Payment Intent ID:', paymentIntent.id)
    console.log('Receipt URL:', paymentIntent.charges.data[0].receipt_url)
    
    return NextResponse.json({
      success: true,
      message: 'Test purchase completed successfully',
      transactionId: paymentIntent.id,
      chargeId: paymentIntent.charges.data[0].id,
      receiptUrl: paymentIntent.charges.data[0].receipt_url,
      amount: amount / 100, // Convert cents to dollars
      currency: currency.toUpperCase(),
      flightId: flightId,
      timestamp: new Date().toISOString(),
      testMode: true
    }, { headers })
    
  } catch (error) {
    console.error('Stripe test purchase error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Test purchase failed',
      details: error.message
    }, { status: 500, headers })
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}