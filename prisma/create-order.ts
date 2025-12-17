import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if order exists
  const existing = await prisma.order.findUnique({
    where: { stripe_session_id: 'cs_live_b1gemBg5k7X47ZosXfs7QTpkJHwHfkpYBqJBhMTJ9W5S4De2bGEzIsnMiO' }
  });

  if (existing) {
    console.log('Order exists:', existing.order_number);
    console.log('QR Code:', existing.esim_qr_code);
    return;
  }

  // Create or get customer
  const customer = await prisma.customer.upsert({
    where: { email: 'jonochan@gmail.com' },
    update: {},
    create: { email: 'jonochan@gmail.com' },
  });

  console.log('Customer ID:', customer.id);

  // Create the order
  const order = await prisma.order.create({
    data: {
      order_number: 'TRV-20251217-003',
      stripe_session_id: 'cs_live_b1gemBg5k7X47ZosXfs7QTpkJHwHfkpYBqJBhMTJ9W5S4De2bGEzIsnMiO',
      stripe_payment_intent_id: null,
      customer_id: customer.id,
      destination_slug: 'france',
      destination_name: 'France',
      plan_name: 'Week Explorer',
      bundle_name: 'esim_ULE_7D_FR_V2',
      duration: 7,
      amount_cents: 0,
      currency: 'AUD',
      locale: 'en-au',
      status: 'paid',
      esim_order_ref: '9c54d513-2138-4509-adbc-f48885077145',
      esim_iccid: '8944422711110532283',
      esim_smdp_address: 'rsp-3104.idemia.io',
      esim_matching_id: 'EATRY-0EISD-HWXRC-LQISH',
      esim_qr_code: 'LPA:1$rsp-3104.idemia.io$EATRY-0EISD-HWXRC-LQISH',
      esim_status: 'delivered',
      esim_provisioned_at: new Date(),
      paidAt: new Date(),
    }
  });

  console.log('Order created:', order.order_number);
  console.log('QR Code:', order.esim_qr_code);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
