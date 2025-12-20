import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { resend } from '@/lib/resend';
import { isTestMode } from '@/lib/stripe';
import {
  createEsimOrder,
  generateQrCodeString,
  EsimGoOrderResponse,
} from '@/lib/esimgo';

const emailFrom = 'Jonathan from Trvel <noreply@e.trvel.co>';
const logoUrl = 'https://www.trvel.co/android-chrome-192x192.png';

function getPlanName(duration: number): string {
  switch (duration) {
    case 5:
      return 'Quick Trip';
    case 7:
      return 'Week Explorer';
    case 15:
      return 'Extended Stay';
    default:
      return `${duration}-Day Plan`;
  }
}

export async function POST(request: NextRequest) {
  // Verify admin session
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { session_id, action } = body;

  if (!session_id || !action) {
    return NextResponse.json({ error: 'session_id and action required' }, { status: 400 });
  }

  // Find the order
  const order = await prisma.order.findUnique({
    where: { stripe_session_id: session_id },
    include: { customer: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Handle different actions
  if (action === 'retry') {
    // Provision eSIM
    if (order.esim_qr_code) {
      return NextResponse.json({ error: 'eSIM already provisioned', message: 'eSIM already provisioned' }, { status: 400 });
    }

    if (!order.bundle_name) {
      return NextResponse.json({ error: 'No bundle name for this order' }, { status: 400 });
    }

    try {
      console.log(`Admin: Provisioning eSIM for ${order.order_number}`);

      let esimData: {
        iccid: string;
        smdpAddress: string;
        matchingId: string;
        qrCodeString: string;
      };

      if (isTestMode) {
        const mockIccid = `TEST-${Date.now()}`;
        const mockSmdpAddress = 'rsp.test.esim-go.io';
        const mockMatchingId = `TEST-${order.order_number}-${Math.random().toString(36).substring(7)}`;

        esimData = {
          iccid: mockIccid,
          smdpAddress: mockSmdpAddress,
          matchingId: mockMatchingId,
          qrCodeString: generateQrCodeString(mockSmdpAddress, mockMatchingId),
        };
      } else {
        const esimResponse: EsimGoOrderResponse = await createEsimOrder(
          order.bundle_name,
          order.order_number
        );

        const orderItem = esimResponse.order?.[0];
        const esimDetails = orderItem?.esims?.[0];

        if (!esimDetails?.iccid || !esimDetails?.smdpAddress || !esimDetails?.matchingId) {
          return NextResponse.json({ error: 'Failed to get eSIM details from provider' }, { status: 500 });
        }

        esimData = {
          iccid: esimDetails.iccid,
          smdpAddress: esimDetails.smdpAddress,
          matchingId: esimDetails.matchingId,
          qrCodeString: generateQrCodeString(esimDetails.smdpAddress, esimDetails.matchingId),
        };
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          esim_iccid: esimData.iccid,
          esim_smdp_address: esimData.smdpAddress,
          esim_matching_id: esimData.matchingId,
          esim_qr_code: esimData.qrCodeString,
          esim_provisioned_at: new Date(),
          esim_status: 'ordered',
        },
      });

      // Also send email
      const customerEmail = order.customer.email;
      const firstName = order.customer.name?.split(' ')[0] || 'there';
      const planName = getPlanName(order.duration);
      const amountPaid = `${(order.amount_cents / 100).toFixed(2)} ${order.currency}`;

      await resend.emails.send({
        from: emailFrom,
        to: customerEmail,
        subject: `Your ${order.destination_name} eSIM is ready! ✈️`,
        html: generateEmailHtml(
          firstName,
          esimData.qrCodeString,
          order.order_number,
          order.destination_name,
          planName,
          order.duration,
          amountPaid
        ),
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { confirmation_email_sent: true },
      });

      return NextResponse.json({
        success: true,
        message: `eSIM provisioned and email sent to ${customerEmail}`
      });
    } catch (error) {
      console.error('Failed to provision eSIM:', error);
      return NextResponse.json({
        error: 'Failed to provision eSIM',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  if (action === 'resend') {
    // Resend email
    if (!order.esim_qr_code) {
      return NextResponse.json({ error: 'No QR code to send - provision eSIM first' }, { status: 400 });
    }

    try {
      const customerEmail = order.customer.email;
      const firstName = order.customer.name?.split(' ')[0] || 'there';
      const planName = getPlanName(order.duration);
      const amountPaid = `${(order.amount_cents / 100).toFixed(2)} ${order.currency}`;

      await resend.emails.send({
        from: emailFrom,
        to: customerEmail,
        subject: `Your ${order.destination_name} eSIM is ready! ✈️`,
        html: generateEmailHtml(
          firstName,
          order.esim_qr_code,
          order.order_number,
          order.destination_name,
          planName,
          order.duration,
          amountPaid
        ),
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { confirmation_email_sent: true },
      });

      return NextResponse.json({
        success: true,
        message: `Email resent to ${customerEmail}`
      });
    } catch (error) {
      console.error('Failed to resend email:', error);
      return NextResponse.json({
        error: 'Failed to resend email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

function generateEmailHtml(
  firstName: string,
  qrCodeString: string | null,
  orderNumber: string,
  destinationName: string,
  planName: string,
  duration: number,
  amountPaid: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #010326; margin: 0; padding: 0; background-color: #fdfbf8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${logoUrl}" alt="Trvel" width="48" height="48" style="border-radius: 12px; margin-bottom: 8px;">
      <h1 style="color: #63BFBF; font-size: 28px; margin: 0; font-weight: 700;">trvel</h1>
    </div>

    <div style="background: white; border-radius: 24px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(99, 191, 191, 0.15);">
      <p style="font-size: 18px; color: #010326; margin: 0 0 24px;">Hey ${firstName}! 👋</p>

      <div style="background: linear-gradient(135deg, #63BFBF 0%, #75cfcf 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <p style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 8px;">${qrCodeString ? 'Your eSIM is ready!' : 'Payment confirmed!'}</p>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px;">${qrCodeString ? 'Scan the QR code below to install' : 'Your eSIM for ' + destinationName + ' is on its way'}</p>
      </div>

      <div style="text-align: center; margin-bottom: 32px;">
        <span style="display: inline-block; background: #e8f7f7; border: 2px solid #63BFBF; color: #4fa9a9; padding: 8px 20px; border-radius: 100px; font-weight: 600; font-size: 14px;">
          Order ${orderNumber}
        </span>
      </div>

      ${qrCodeString ? `
      <div style="background: #fdfbf8; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <h3 style="font-size: 16px; color: #010326; margin: 0 0 16px; font-weight: 600;">📱 Your eSIM QR Code</h3>
        <div style="background: white; border-radius: 12px; padding: 16px; display: inline-block; border: 2px solid #F2E2CE;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}" alt="eSIM QR Code" width="200" height="200" style="display: block;">
        </div>
        <p style="margin: 16px 0 8px; color: #585b76; font-size: 13px;">Scan this code from another device</p>
      </div>

      <div style="background: white; border: 2px solid #63BFBF; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="font-size: 16px; color: #010326; margin: 0 0 20px; font-weight: 600;">📲 Installation</h3>
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #010326; font-weight: 600; font-size: 14px;">iPhone:</p>
          <p style="margin: 0; color: #585b76; font-size: 14px;">Settings → Mobile Data → Add eSIM → Use QR Code</p>
        </div>
        <div>
          <p style="margin: 0 0 12px; color: #010326; font-weight: 600; font-size: 14px;">Android:</p>
          <p style="margin: 0; color: #585b76; font-size: 14px;">Settings → Network → SIMs → Add eSIM</p>
        </div>
      </div>
      ` : ''}

      <div style="background: #fdfbf8; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE;">Destination</td>
            <td style="font-weight: 600; color: #010326; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE;">🌏 ${destinationName}</td>
          </tr>
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE;">Plan</td>
            <td style="font-weight: 600; color: #010326; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE;">${planName} (${duration} days)</td>
          </tr>
          <tr>
            <td style="color: #010326; font-weight: 600; padding: 16px 0 0;">Total</td>
            <td style="font-weight: 700; color: #63BFBF; font-size: 20px; text-align: right; padding: 16px 0 0;">${amountPaid}</td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #F2E2CE 0%, #f7efe4 100%); border-radius: 16px; padding: 20px; text-align: center;">
        <p style="margin: 0 0 4px; color: #010326; font-weight: 600;">Questions?</p>
        <p style="margin: 0; color: #585b76; font-size: 14px;">Reply to this email or call +61 3 4052 7555</p>
      </div>
    </div>

    <div style="margin-top: 32px; padding: 0 8px;">
      <p style="color: #010326; margin: 0; font-weight: 500;">
        Safe travels! ✈️<br>
        <span style="color: #63BFBF; font-weight: 600;">Jonathan</span>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
