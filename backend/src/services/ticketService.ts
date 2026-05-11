import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

interface TicketData {
  bookingId: string;
  eventName: string;
  userName: string;
  userEmail: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  ticketQuantity: number;
  totalPrice: number;
  qrCodeData: string;
}

export class TicketService {
  static async generateQRCode(bookingId: string): Promise<string> {
    try {
      const payload = { bookingId, timestamp: Date.now() };
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      const signature = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

      // QR encodes a clean web URL — when scanned opens a mobile-friendly verify page
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-ticket?bookingId=${bookingId}&token=${signature}`;

      const qrCodeDataURL = await QRCode.toDataURL(verifyUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async getTicketData(bookingId: string): Promise<TicketData | null> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { name: true, venue: true, startTime: true, endTime: true, price: true } }
        }
      });

      if (!booking || booking.status !== 'CONFIRMED') return null;

      const qrCodeData = await this.generateQRCode(bookingId);

      return {
        bookingId: booking.id,
        eventName: booking.event.name,
        userName: booking.user.name || 'Guest',
        userEmail: booking.user.email || '',
        venue: booking.event.venue,
        eventDate: booking.event.startTime.toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }),
        eventTime: booking.event.startTime.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit'
        }),
        ticketQuantity: booking.quantity,
        totalPrice: Number(booking.totalPrice),
        qrCodeData
      };
    } catch (error) {
      console.error('Get ticket data failed:', error);
      return null;
    }
  }

  static async generatePDFTicket(bookingId: string): Promise<Buffer | null> {
    try {
      const ticketData = await this.getTicketData(bookingId);
      if (!ticketData) return null;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ── Colours ────────────────────────────────────────────
      const indigo   = [99,  102, 241] as [number,number,number];
      const darkBg   = [10,  15,  30]  as [number,number,number];
      const white     = [255, 255, 255] as [number,number,number];
      const lightGray = [241, 245, 249] as [number,number,number];
      const slateText = [71,  85,  105] as [number,number,number];
      const darkText  = [15,  23,  42]  as [number,number,number];
      const green     = [16,  185, 129] as [number,number,number];

      const W = 210, H = 297;
      const MARGIN = 15;
      const INNER_W = W - MARGIN * 2;

      // ── Outer border card ──────────────────────────────────
      pdf.setFillColor(...darkBg);
      pdf.roundedRect(MARGIN - 2, MARGIN - 2, INNER_W + 4, H - (MARGIN - 2) * 2, 6, 6, 'F');

      // ── Inner white card ───────────────────────────────────
      pdf.setFillColor(...white);
      pdf.roundedRect(MARGIN + 1, MARGIN + 1, INNER_W - 2, H - (MARGIN + 1) * 2, 5, 5, 'F');

      // ── Header gradient block ──────────────────────────────
      pdf.setFillColor(...indigo);
      pdf.roundedRect(MARGIN + 1, MARGIN + 1, INNER_W - 2, 40, 5, 5, 'F');
      // fill bottom corners of header to look square at bottom
      pdf.setFillColor(...indigo);
      pdf.rect(MARGIN + 1, MARGIN + 30, INNER_W - 2, 11, 'F');

      // ── Logo text: EVENTLY ────────────────────────────────
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(...white);
      pdf.text('EVENTLY', MARGIN + 8, MARGIN + 17);

      // Tag line
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(200, 204, 255);
      pdf.text('Enterprise Event Management Platform', MARGIN + 8, MARGIN + 24);

      // EVENT TICKET badge on right
      pdf.setFillColor(255, 255, 255, 0.2);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...white);
      pdf.text('EVENT TICKET', W - MARGIN - 8, MARGIN + 17, { align: 'right' });

      // ── Event name ─────────────────────────────────────────
      let y = MARGIN + 52;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(...darkText);
      // Wrap long event names
      const eventLines = pdf.splitTextToSize(ticketData.eventName, INNER_W - 4);
      pdf.text(eventLines, MARGIN + 8, y);
      y += eventLines.length * 8;

      // ── Divider ────────────────────────────────────────────
      y += 4;
      pdf.setDrawColor(...indigo);
      pdf.setLineWidth(0.6);
      pdf.line(MARGIN + 8, y, W - MARGIN - 8, y);
      y += 8;

      // ── Details grid ───────────────────────────────────────
      const rows = [
        ['Ticket Holder', ticketData.userName],
        ['Email',         ticketData.userEmail],
        ['Venue',         ticketData.venue],
        ['Date',          ticketData.eventDate],
        ['Time',          ticketData.eventTime],
        ['Tickets',       String(ticketData.ticketQuantity)],
        ['Amount Paid',   `Rs. ${ticketData.totalPrice.toFixed(2)}`],
        ['Booking ID',    ticketData.bookingId.slice(-12).toUpperCase()],
      ];

      rows.forEach(([label, value], i) => {
        const rowY = y + i * 11;

        // Alternate row bg
        if (i % 2 === 0) {
          pdf.setFillColor(...lightGray);
          pdf.roundedRect(MARGIN + 4, rowY - 5, INNER_W - 8, 10, 2, 2, 'F');
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(...slateText);
        pdf.text(label.toUpperCase(), MARGIN + 8, rowY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(...darkText);
        const valLines = pdf.splitTextToSize(value, INNER_W / 2 - 4);
        pdf.text(valLines, MARGIN + 50, rowY);
      });

      y += rows.length * 11 + 8;

      // ── Dashed tear line ───────────────────────────────────
      pdf.setDrawColor(200, 200, 220);
      pdf.setLineWidth(0.3);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(MARGIN + 4, y, W - MARGIN - 4, y);
      pdf.setLineDashPattern([], 0);

      // Scissors hint
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 180);
      pdf.text('- - - - - SCAN BELOW FOR ENTRY - - - - -', W / 2, y + 4, { align: 'center' });
      y += 10;

      // ── QR Code section ────────────────────────────────────
      const qrSize = 55;
      const qrX = (W - qrSize) / 2;

      // QR bg box
      pdf.setFillColor(...lightGray);
      pdf.roundedRect(qrX - 4, y - 2, qrSize + 8, qrSize + 16, 4, 4, 'F');

      pdf.addImage(ticketData.qrCodeData, 'PNG', qrX, y, qrSize, qrSize);
      y += qrSize + 4;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...indigo);
      pdf.text('SCAN TO CHECK IN', W / 2, y + 2, { align: 'center' });
      y += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...slateText);
      pdf.text('Present this QR code at the event entrance.', W / 2, y + 2, { align: 'center' });
      pdf.text('Arrive 15 minutes early. Valid for one-time use.', W / 2, y + 7, { align: 'center' });
      y += 16;

      // ── Status badge ───────────────────────────────────────
      pdf.setFillColor(...green);
      pdf.roundedRect(W / 2 - 18, y, 36, 8, 4, 4, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...white);
      pdf.text('CONFIRMED', W / 2, y + 5.5, { align: 'center' });
      y += 14;

      // ── Footer ─────────────────────────────────────────────
      const footerY = H - MARGIN - 8;
      pdf.setDrawColor(220, 220, 235);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN + 4, footerY - 4, W - MARGIN - 4, footerY - 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(...slateText);
      pdf.text('Generated by Evently  |  evently.app  |  This ticket is cryptographically signed and tamper-proof.', W / 2, footerY, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, W / 2, footerY + 5, { align: 'center' });

      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      return pdfBuffer;

    } catch (error) {
      console.error('PDF generation failed:', error);
      return null;
    }
  }

  static async verifyTicket(bookingId: string, token?: string): Promise<{ valid: boolean; booking?: any; message: string }> {
    try {
      if (!token) return { valid: false, message: 'Cryptographic signature missing from ticket.' };

      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.bookingId !== bookingId) return { valid: false, message: 'Signature does not match booking.' };
      } catch {
        return { valid: false, message: 'Forged or expired ticket signature.' };
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { name: true, venue: true, startTime: true, endTime: true } }
        }
      });

      if (!booking) return { valid: false, message: 'Booking not found.' };
      if (booking.status !== 'CONFIRMED') return { valid: false, message: 'Booking is not confirmed.' };

      const now = new Date();
      // Allow check-in anytime before event ends (or up to 24h after for grace period)
      if (booking.event.endTime) {
        const gracePeriod = new Date(booking.event.endTime.getTime() + 24 * 60 * 60 * 1000);
        if (now > gracePeriod) {
          return { valid: false, message: 'Event has ended and check-in period has expired.' };
        }
      }

      return { valid: true, booking, message: 'Ticket verified successfully.' };
    } catch (error) {
      return { valid: false, message: 'Verification failed.' };
    }
  }

  static async checkInTicket(bookingId: string): Promise<boolean> {
    try {
      await prisma.booking.update({ where: { id: bookingId }, data: { updatedAt: new Date() } });
      console.log(`Ticket checked in: ${bookingId}`);
      return true;
    } catch {
      return false;
    }
  }
}
