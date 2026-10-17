import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const FLOUCI_APP_TOKEN = Deno.env.get('FLOUCI_APP_TOKEN') ?? ''
const FLOUCI_APP_SECRET = Deno.env.get('FLOUCI_APP_SECRET') ?? ''
const FLOUCI_VERIFY_URL = Deno.env.get('FLOUCI_VERIFY_URL') ?? 'https://developers.flouci.com/api/checkout/v2/payment/status'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  try {
    const { booking_id, payment_id } = await req.json()

    if (!booking_id || !payment_id) {
      return new Response(JSON.stringify({ error: 'booking_id and payment_id are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: payment, error: paymentError } = await supabase.from('payments').select('*').eq('payment_id', payment_id).single()

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: 'Payment record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    const response = await fetch(FLOUCI_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_token: FLOUCI_APP_TOKEN,
        app_secret: FLOUCI_APP_SECRET,
        payment_id,
      }),
    })

    const result = await response.json()
    const isPaid = result?.result?.status === 'paid' || result?.result?.payment_status === 'paid'
    const status = isPaid ? 'paid' : 'failed'

    await supabase.from('payments').update({
      status,
      flouci_ref: result?.result?.payment_id ?? payment.flouci_ref,
    }).eq('id', payment.id)

    if (isPaid) {
      await supabase.from('bookings').update({ status: 'approved' }).eq('id', booking_id)
    }

    return new Response(JSON.stringify({ ok: true, message: isPaid ? 'Paiement confirmé' : 'Paiement échoué', status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }
})
