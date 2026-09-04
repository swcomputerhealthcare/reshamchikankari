export interface DeliveryCompletedEmailData {
  orderNumber: string;
  customerName: string;
  deliveredDateStr: string;
  reviewUrl: string;
}

export function renderDeliveryCompletedEmailHtml(data: DeliveryCompletedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Been Delivered #${data.orderNumber} — Resham Chikankari</title>
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
                Delivered With Care
              </span>
            </td>
          </tr>

          <!-- Delivery Body -->
          <tr>
            <td style="padding: 40px 40px 24px 40px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #7C7A5A; display: block; margin-bottom: 8px;">
                Order Completed
              </span>
              <h1 style="font-family: Georgia, serif; font-size: 26px; color: #161616; margin: 0 0 12px 0; font-weight: normal;">
                Delivered to your doorstep, ${data.customerName}!
              </h1>
              <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 24px 0;">
                Your luxury Chikankari ensemble for order <strong>#${data.orderNumber}</strong> was delivered on <strong>${data.deliveredDateStr}</strong>. We hope you treasure the delicate handcrafting and intricate stitches of Lucknow.
              </p>
            </td>
          </tr>

          <!-- Review Invitation Box -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F2EC; border-radius: 6px; padding: 28px; text-align: center;">
                <tr>
                  <td>
                    <div style="font-family: Georgia, serif; font-size: 18px; color: #161616; margin-bottom: 8px;">
                      Share Your Patron Story
                    </div>
                    <p style="font-size: 12px; color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                      Your experience helps preserve Lucknow's living heritage. Leave a patron review and share how your Chikankari garment feels.
                    </p>
                    <a href="${data.reviewUrl}" target="_blank" style="background-color: #161616; color: #F8F2EC; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 28px; border-radius: 4px; display: inline-block;">
                      Write a Patron Review &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F2EC; padding: 24px 40px; text-align: center; border-top: 1px solid #ECE9E2; font-size: 11px; color: #888888; line-height: 1.5;">
              Resham Chikankari &copy; ${new Date().getFullYear()} — Lucknow Artisanal Heritage.<br>
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
