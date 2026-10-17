import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const FLOUCI_APP_TOKEN = Deno.env.get('FLOUCI_APP_TOKEN') ?? ''
const FLOUCI_APP_SECRET = Deno.env.get('FLOUCI_APP_SECRET') ?? ''
const FLOUCI_BASE_URL = Deno.env.get('FLOUCI_BASE_URL') ?? 'https://developers.flouci.com/api/checkout/v2/payment' 
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
    const { booking_id, amount } = await req.json()

    if (!booking_id || !amount) {
      return new Response(JSON.stringify({ error: 'booking_id and amount are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    if (!FLOUCI_APP_TOKEN || !FLOUCI_APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Flouci or Supabase configuration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: booking, error: bookingError } = await supabase.from('bookings').select('id, player_id').eq('id', booking_id).single()

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    const payload = {
      app_token: FLOUCI_APP_TOKEN,
      app_secret: FLOUCI_APP_SECRET,
      amount: Number(amount),
      accept_card: 'true',
      format: 'json',
      mode: 'payment',
      description: `Réservation court Msaken #${booking.id}`,
      success_link: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/payment/success`,
      fail_link: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/payment/failure`,
      webhook: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/api/flouci-webhook`,
    }

    const response = await fetch(FLOUCI_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const flouciData = await response.json()
    if (!response.ok || !flouciData?.result?.payment_url) {
      return new Response(JSON.stringify({ error: flouciData?.message || 'Flouci init failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    await supabase.from('payments').insert({
      booking_id: booking.id,
      player_id: booking.player_id,
      amount: Number(amount),
      status: 'pending',
      payment_id: flouciData.result.payment_id,
      flouci_ref: flouciData.result?.payment_id ?? null,
    })

    return new Response(JSON.stringify({
      payment_url: flouciData.result.payment_url,
      payment_id: flouciData.result.payment_id,
    }), {
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
