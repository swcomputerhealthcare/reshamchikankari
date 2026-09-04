export interface ShipmentDispatchedEmailData {
  orderNumber: string;
  customerName: string;
  courierName: string;
  awbCode: string;
  trackingUrl: string;
  destinationCity: string;
  itemsCount: number;
}

export function renderShipmentDispatchedEmailHtml(data: ShipmentDispatchedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Shipment Has Dispatched #${data.orderNumber} — Resham Chikankari</title>
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
                Shipment Dispatched
              </span>
            </td>
          </tr>

          <!-- Dispatched Body -->
          <tr>
            <td style="padding: 40px 40px 24px 40px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #7C7A5A; display: block; margin-bottom: 8px;">
                On Its Way To You
              </span>
              <h1 style="font-family: Georgia, serif; font-size: 26px; color: #161616; margin: 0 0 12px 0; font-weight: normal;">
                Great news, ${data.customerName}!
              </h1>
              <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 24px 0;">
                Your luxury Chikankari ensemble for order <strong>#${data.orderNumber}</strong> (${data.itemsCount} item${data.itemsCount > 1 ? 's' : ''}) has been handed over to our courier partner and is on its way to <strong>${data.destinationCity}</strong>.
              </p>
            </td>
          </tr>

          <!-- Courier Detail Box -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F2EC; border-radius: 6px; padding: 24px;">
                <tr>
                  <td style="font-size: 13px; color: #555555; line-height: 1.8;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #7C7A5A; margin-bottom: 8px;">
                      Shipment Details
                    </div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 4px 0; color: #666666;">Courier Partner:</td>
                        <td style="padding: 4px 0; font-weight: bold; color: #161616; text-align: right;">${data.courierName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #666666;">AWB Tracking No:</td>
                        <td style="padding: 4px 0; font-weight: bold; font-family: monospace; color: #161616; text-align: right;">${data.awbCode}</td>
                      </tr>
                    </table>

                    <!-- Tracking CTA Button -->
                    <div style="text-align: center; margin-top: 24px;">
                      <a href="${data.trackingUrl}" target="_blank" style="background-color: #7C7A5A; color: #FFFFFF; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; padding: 14px 28px; border-radius: 4px; display: inline-block;">
                        Track Live Shipment &rarr;
                      </a>
                    </div>
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
