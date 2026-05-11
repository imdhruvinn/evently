import nodemailer from 'nodemailer';

// ─── Shared HTML helpers ────────────────────────────────────────────────────

const LOGO_SVG = `
  <div style="display:inline-flex;align-items:center;gap:10px;">
    <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#3b82f6);border-radius:10px;display:flex;align-items:center;justify-content:center;">
      <span style="color:white;font-weight:900;font-size:18px;font-family:sans-serif;">E</span>
    </div>
    <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;font-family:'Segoe UI',sans-serif;">Evently</span>
  </div>`;

function baseTemplate(params: {
  headerTitle: string;
  headerSubtitle: string;
  accentColor?: string;
  body: string;
}): string {
  const accent = params.accentColor || '#6366f1';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Evently</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a8a 100%);padding:36px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
            ${LOGO_SVG}
            <div style="margin-top:20px;">
              <div style="display:inline-block;padding:6px 16px;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.4);border-radius:100px;margin-bottom:12px;">
                <span style="color:#a5b4fc;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${params.headerSubtitle}</span>
              </div>
              <h1 style="margin:0;color:#f1f5f9;font-size:26px;font-weight:800;line-height:1.2;">${params.headerTitle}</h1>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#111827;padding:40px;">
            ${params.body}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d1424;padding:28px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0 0 8px;color:#6366f1;font-weight:700;font-size:14px;">Evently</p>
            <p style="margin:0 0 12px;color:#475569;font-size:12px;line-height:1.6;">
              Enterprise-Grade Event Management Platform<br/>
              Questions? Contact us at <a href="mailto:support@evently.app" style="color:#6366f1;text-decoration:none;">support@evently.app</a>
            </p>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;color:#334155;font-size:11px;">
                &copy; ${new Date().getFullYear()} Evently. All rights reserved.<br/>
                This email was sent because you have an account on Evently.
              </p>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(icon: string, label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="32" style="color:#6366f1;font-size:16px;vertical-align:middle;">${icon}</td>
          <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:middle;">${label}</td>
          <td style="color:#f1f5f9;font-size:14px;font-weight:500;text-align:right;vertical-align:middle;">${value}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function eventCard(rows: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;margin:20px 0;">
    ${rows}
  </table>`;
}

function ctaButton(href: string, text: string, color = '#6366f1'): string {
  return `
  <div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,${color},#3b82f6);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.02em;box-shadow:0 8px 20px rgba(99,102,241,0.35);">${text}</a>
  </div>`;
}

function infoBox(icon: string, text: string, color = '#f59e0b'): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;margin:16px 0;">
    <tr>
      <td style="padding:16px 20px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:20px;vertical-align:top;padding-right:12px;">${icon}</td>
            <td style="color:#cbd5e1;font-size:13px;line-height:1.6;">${text}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ─── Email Service ──────────────────────────────────────────────────────────

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter() {
    if (!this.transporter) {
      if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
        });
      } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
      } else {
        this.transporter = nodemailer.createTransport({ streamTransport: true, newline: 'windows' });
      }
    }
    return this.transporter;
  }

  // ── Verification Email ────────────────────────────────────────────────────
  static async sendVerificationEmail(to: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        Welcome to <strong style="color:#f1f5f9;">Evently</strong>! You're almost ready to start discovering and booking amazing events. 
        Please verify your email address to activate your account.
      </p>
      ${ctaButton(verifyLink, 'Verify My Email Address', '#6366f1')}
      ${infoBox('&#9888;', 'This verification link will expire in <strong>24 hours</strong>. If you did not create an Evently account, you can safely ignore this email.')}
      <p style="color:#475569;font-size:12px;text-align:center;margin-top:20px;">
        Or copy this link:<br/>
        <a href="${verifyLink}" style="color:#6366f1;word-break:break-all;font-size:11px;">${verifyLink}</a>
      </p>`;

    const html = baseTemplate({
      headerTitle: 'Verify Your Email Address',
      headerSubtitle: 'Account Activation',
      body
    });

    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to,
      subject: 'Verify your Evently Account',
      html,
    });

    console.log(`\n==========================================`);
    console.log(`Verification email sent to: ${to}`);
    console.log(`Link: ${verifyLink}`);
    console.log(`==========================================\n`);
    return info;
  }

  // ── Password Reset Email ──────────────────────────────────────────────────
  static async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        We received a request to reset your Evently account password. 
        Click the button below to create a new password. This link is valid for <strong style="color:#f1f5f9;">1 hour</strong>.
      </p>
      ${ctaButton(resetLink, 'Reset My Password', '#ef4444')}
      ${infoBox('&#128274;', '<strong>Security Notice:</strong> If you did not request a password reset, your account may be at risk. Please contact us immediately at support@evently.app. This link expires in 1 hour.')}
      <p style="color:#475569;font-size:12px;text-align:center;margin-top:20px;">
        Or copy this link:<br/>
        <a href="${resetLink}" style="color:#6366f1;word-break:break-all;font-size:11px;">${resetLink}</a>
      </p>`;

    const html = baseTemplate({
      headerTitle: 'Reset Your Password',
      headerSubtitle: 'Password Recovery',
      accentColor: '#ef4444',
      body
    });

    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to,
      subject: 'Reset your Evently Password',
      html,
    });

    console.log(`\n==========================================`);
    console.log(`Password reset email sent to: ${to}`);
    console.log(`Link: ${resetLink}`);
    console.log(`==========================================\n`);
    return info;
  }

  // ── Booking Confirmation Email ─────────────────────────────────────────────
  static async sendBookingConfirmation(data: {
    to: string; userName: string; eventName: string; venue: string;
    eventDate: string; eventTime: string; ticketQuantity: number;
    totalPrice: number; bookingId: string;
  }) {
    const rows =
      detailRow('&#128197;', 'Date', data.eventDate) +
      detailRow('&#128336;', 'Time', data.eventTime) +
      detailRow('&#128205;', 'Venue', data.venue) +
      detailRow('&#127903;', 'Tickets', `${data.ticketQuantity} ticket${data.ticketQuantity > 1 ? 's' : ''}`) +
      detailRow('&#8377;',   'Amount Paid', `Rs. ${Number(data.totalPrice).toFixed(2)}`) +
      detailRow('&#128278;', 'Booking ID', `#${data.bookingId.slice(-10).toUpperCase()}`);

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 6px;line-height:1.7;">Hi <strong style="color:#f1f5f9;">${data.userName}</strong>,</p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        Your booking for <strong style="color:#f1f5f9;">${data.eventName}</strong> has been confirmed! Here are your event details:
      </p>
      ${eventCard(rows)}
      ${infoBox('&#128241;', 'Download your ticket PDF from your <strong>Bookings</strong> page. The QR code in your ticket is your entry pass — scan it at the venue entrance for instant check-in.')}
      <p style="color:#64748b;font-size:13px;text-align:center;margin-top:24px;">
        We will send you a reminder 24 hours before the event.<br/>
        <span style="color:#6366f1;">See you there!</span>
      </p>`;

    const html = baseTemplate({
      headerTitle: 'Booking Confirmed!',
      headerSubtitle: 'Booking Confirmation',
      accentColor: '#10b981',
      body
    });

    const transporter = await this.getTransporter();
    return transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to: data.to,
      subject: `Booking Confirmed: ${data.eventName}`,
      html,
    });
  }

  // ── Booking Cancellation Email ─────────────────────────────────────────────
  static async sendBookingCancellation(data: {
    to: string; userName: string; eventName: string; venue: string;
    eventDate: string; eventTime: string; ticketQuantity: number;
    refundAmount: number; bookingId: string;
  }) {
    const rows =
      detailRow('&#128197;', 'Date', data.eventDate) +
      detailRow('&#128336;', 'Time', data.eventTime) +
      detailRow('&#128205;', 'Venue', data.venue) +
      detailRow('&#127903;', 'Tickets', `${data.ticketQuantity} ticket${data.ticketQuantity > 1 ? 's' : ''}`) +
      detailRow('&#8377;',   'Refund Amount', `Rs. ${Number(data.refundAmount).toFixed(2)}`) +
      detailRow('&#128278;', 'Booking ID', `#${data.bookingId.slice(-10).toUpperCase()}`);

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 6px;line-height:1.7;">Hi <strong style="color:#f1f5f9;">${data.userName}</strong>,</p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        Your booking for <strong style="color:#f1f5f9;">${data.eventName}</strong> has been <strong style="color:#fca5a5;">cancelled</strong>. Here is a summary:
      </p>
      ${eventCard(rows)}
      ${infoBox('&#8377;', `<strong>Refund of Rs. ${Number(data.refundAmount).toFixed(2)}</strong> will be processed within <strong>5–7 business days</strong> to your original payment method.`, '#ef4444')}
      <p style="color:#64748b;font-size:13px;text-align:center;margin-top:24px;">
        If you did not request this cancellation, please contact us immediately at <a href="mailto:support@evently.app" style="color:#6366f1;">support@evently.app</a>
      </p>`;

    const html = baseTemplate({
      headerTitle: 'Booking Cancelled',
      headerSubtitle: 'Cancellation Confirmation',
      accentColor: '#ef4444',
      body
    });

    const transporter = await this.getTransporter();
    return transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to: data.to,
      subject: `Booking Cancelled: ${data.eventName}`,
      html,
    });
  }

  // ── Event Reminder Email ───────────────────────────────────────────────────
  static async sendEventReminder(data: {
    to: string; userName: string; eventName: string; venue: string;
    eventDate: string; eventTime: string; address?: string; specialInstructions?: string;
  }) {
    const rows =
      detailRow('&#128197;', 'Date', data.eventDate) +
      detailRow('&#128336;', 'Time', data.eventTime) +
      detailRow('&#128205;', 'Venue', data.venue) +
      (data.address ? detailRow('&#128506;', 'Address', data.address) : '');

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 6px;">Hi <strong style="color:#f1f5f9;">${data.userName}</strong>,</p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        Your event <strong style="color:#f1f5f9;">${data.eventName}</strong> is happening <strong style="color:#f59e0b;">tomorrow</strong>! Here is a quick reminder:
      </p>
      ${eventCard(rows)}
      ${data.specialInstructions ? infoBox('&#128203;', `<strong>Special Instructions:</strong><br/>${data.specialInstructions}`) : ''}
      ${infoBox('&#10024;', `<strong>Don't forget to:</strong><br/>
        &bull; Download your ticket from the Evently app or website<br/>
        &bull; Arrive at least <strong>15 minutes early</strong><br/>
        &bull; Bring a valid ID if required`)}`;

    const html = baseTemplate({
      headerTitle: 'Your Event is Tomorrow!',
      headerSubtitle: 'Event Reminder',
      accentColor: '#f59e0b',
      body
    });

    const transporter = await this.getTransporter();
    return transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to: data.to,
      subject: `Reminder: ${data.eventName} is Tomorrow!`,
      html,
    });
  }

  // ── Waitlist Confirmation ─────────────────────────────────────────────────
  static async sendWaitlistConfirmation(data: { to: string; userName: string; eventName: string; position: number }) {
    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 6px;">Hi <strong style="color:#f1f5f9;">${data.userName}</strong>,</p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        You've been added to the waitlist for <strong style="color:#f1f5f9;">${data.eventName}</strong>.
      </p>
      ${eventCard(
        detailRow('&#128203;', 'Event', data.eventName) +
        detailRow('&#128202;', 'Your Position', `#${data.position}`)
      )}
      ${infoBox('&#128276;', 'We will automatically notify you if a spot becomes available. You will have 24 hours to confirm your booking when promoted.')}`;

    const html = baseTemplate({
      headerTitle: "You're on the Waitlist",
      headerSubtitle: 'Waitlist Confirmation',
      body
    });

    const transporter = await this.getTransporter();
    return transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to: data.to,
      subject: `Waitlist Confirmation: ${data.eventName}`,
      html,
    });
  }

  // ── Waitlist Promotion ────────────────────────────────────────────────────
  static async sendWaitlistPromotion(data: {
    to: string; userName: string; eventName: string; venue: string;
    eventDate: string; eventTime: string; confirmationLink: string; timeToRespond?: string;
  }) {
    const rows =
      detailRow('&#127903;', 'Event', data.eventName) +
      detailRow('&#128197;', 'Date', data.eventDate) +
      detailRow('&#128205;', 'Venue', data.venue);

    const body = `
      <p style="color:#94a3b8;font-size:15px;margin:0 0 6px;">Hi <strong style="color:#f1f5f9;">${data.userName}</strong>,</p>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;line-height:1.7;">
        Great news! A spot has opened up for <strong style="color:#f1f5f9;">${data.eventName}</strong> and you've been promoted from the waitlist!
      </p>
      ${eventCard(rows)}
      ${ctaButton(data.confirmationLink, 'Confirm My Spot Now', '#10b981')}
      ${infoBox('&#9888;', `<strong>Act fast!</strong> You have <strong>${data.timeToRespond || '24 hours'}</strong> to confirm your booking. If you don't confirm within this window, your spot will be offered to the next person on the waitlist.`)}`;

    const html = baseTemplate({
      headerTitle: "You're In — Spot Available!",
      headerSubtitle: 'Waitlist Promotion',
      accentColor: '#10b981',
      body
    });

    const transporter = await this.getTransporter();
    return transporter.sendMail({
      from: `"Evently" <${process.env.EMAIL_USER || 'noreply@evently.app'}>`,
      to: data.to,
      subject: `You're In! Spot Available: ${data.eventName}`,
      html,
    });
  }
}

export default EmailService;
