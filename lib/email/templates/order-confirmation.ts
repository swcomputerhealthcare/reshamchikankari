export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  dateStr: string;
  paymentMethod: string;
  subtotal: string;
  discount: string;
  shipping: string;
  walletPaid: string;
  total: string;
  items: Array<{
    name: string;
    sku: string;
    sizeName?: string;
    quantity: number;
    price: string;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

export function renderOrderConfirmationEmailHtml(data: OrderConfirmationEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EEEEEE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #161616;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 11px; color: #777777; margin-top: 2px;">
            ${item.sizeName ? `Size: ${item.sizeName} | ` : ''}SKU: ${item.sku} | Qty: ${item.quantity}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EEEEEE; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #161616; text-align: right; vertical-align: top;">
          ${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${data.orderNumber} — Resham Chikankari</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F2EC; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F2EC; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #ECE9E2; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #161616; padding: 32px 40px; text-align: center;">
              <span style="font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px; color: #F8F2EC; text-transform: uppercase; font-weight: normal; display: block;">
                RESHAM CHIKANKARI
              </span>
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #E694AA; margin-top: 6px; display: block;">
                Lucknow Artisanal Heritage
              </span>
            </td>
          </tr>

          <!-- Confirmation Body -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #7C7A5A; display: block; margin-bottom: 8px;">
                Official Digital Receipt
              </span>
              <h1 style="font-family: Georgia, serif; font-size: 26px; color: #161616; margin: 0 0 12px 0; font-weight: normal;">
                Thank you for your order, ${data.customerName}!
              </h1>
              <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 24px 0;">
                Your order <strong>#${data.orderNumber}</strong> has been confirmed. Our master artisans in Lucknow are carefully preparing your luxury hand-embroidered Chikankari ensemble for shipment.
              </p>
            </td>
          </tr>

          <!-- Order Summary Meta Box -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F2EC; border-radius: 6px; padding: 16px;">
                <tr>
                  <td width="50%" style="font-size: 12px; color: #666666;">
                    <strong style="color: #161616; display: block; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Date Placed:</strong>
                    ${data.dateStr}
                  </td>
                  <td width="50%" style="font-size: 12px; color: #666666; text-align: right;">
                    <strong style="color: #161616; display: block; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Payment Method:</strong>
                    ${data.paymentMethod}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #7C7A5A; border-bottom: 1px solid #ECE9E2; padding-bottom: 8px; margin: 0 0 8px 0;">
                Ordered Items (${data.items.length})
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Pricing Breakdown -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #555555; line-height: 1.8;">
                <tr>
                  <td>Subtotal</td>
                  <td style="text-align: right; color: #161616;">${data.subtotal}</td>
                </tr>
                ${
                  data.discount !== "₹0"
                    ? `
                <tr>
                  <td style="color: #E694AA; font-weight: 600;">Discount Applied</td>
                  <td style="text-align: right; color: #E694AA; font-weight: 600;">-${data.discount}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td>Shipping Fee</td>
                  <td style="text-align: right; color: #161616;">${data.shipping}</td>
                </tr>
                ${
                  data.walletPaid !== "₹0"
                    ? `
                <tr>
                  <td style="color: #7C7A5A; font-weight: 600;">Wallet Paid</td>
                  <td style="text-align: right; color: #7C7A5A; font-weight: 600;">-${data.walletPaid}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding-top: 12px; font-size: 15px; font-weight: bold; color: #161616; border-top: 1px solid #ECE9E2;">
                    Total Paid
                  </td>
                  <td style="padding-top: 12px; font-size: 15px; font-weight: bold; color: #161616; text-align: right; border-top: 1px solid #ECE9E2;">
                    ${data.total}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Destination -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F2EC; border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="font-size: 12px; color: #555555; line-height: 1.6;">
                    <strong style="color: #7C7A5A; text-transform: uppercase; font-size: 10px; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">
                      Delivery Destination
                    </strong>
                    <strong style="color: #161616; font-size: 13px;">${data.shippingAddress.fullName}</strong><br>
                    ${data.shippingAddress.street}<br>
                    ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}<br>
                    Phone: ${data.shippingAddress.phone}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F2EC; padding: 24px 40px; text-align: center; border-top: 1px solid #ECE9E2; font-size: 11px; color: #888888; line-height: 1.5;">
              Resham Chikankari &copy; ${new Date().getFullYear()} — Hazratganj, Lucknow, UP.<br>
              Need assistance? Email us at <a href="mailto:support@reshamchikankari.com" style="color: #7C7A5A; text-decoration: none;">support@reshamchikankari.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
