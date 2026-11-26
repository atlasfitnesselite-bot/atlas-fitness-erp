import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  /**
   * Generates a tax invoice PDF buffer with GST/CGST/SGST breakdown and payment summary.
   */
  async generateInvoicePdf(invoice: any, companySettings?: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 45, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const companyName = companySettings?.companyName || 'Atlas Fitness';
        const companyAddress = companySettings?.address || '';
        const companyContact = companySettings?.companyContact || '';
        const companyEmail = companySettings?.email || '';
        const companyGst = companySettings?.gstNumber || '';

        // Header
        doc.fontSize(20).fillColor('#DC2626').text(companyName, { align: 'left' });
        doc.fontSize(9).fillColor('#475569');
        if (companyAddress) doc.text(companyAddress);
        if (companyContact || companyEmail) {
          doc.text([companyContact, companyEmail].filter(Boolean).join(' | '));
        }
        if (companyGst) doc.text(`GSTIN: ${companyGst}`);

        doc.moveUp(2.5);
        doc.fontSize(18).fillColor('#0F172A').text('TAX INVOICE', { align: 'right' });
        doc
          .fontSize(10)
          .fillColor('#334155')
          .text(`Invoice #: ${invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}`, {
            align: 'right',
          })
          .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, {
            align: 'right',
          })
          .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, {
            align: 'right',
          })
          .text(`Status: ${invoice.status}`, { align: 'right' });

        doc.moveDown(1.5);
        doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').stroke();
        doc.moveDown(1);

        // Bill To
        const memberName = invoice.member
          ? `${invoice.member.firstName} ${invoice.member.lastName}`.trim()
          : 'Member';
        doc.fontSize(11).fillColor('#0F172A').text('Bill To:', { underline: true });
        doc.fontSize(10).fillColor('#334155').text(memberName);
        if (invoice.member?.memberId) doc.text(`Member ID: ${invoice.member.memberId}`);
        if (invoice.member?.mobile) doc.text(`Phone: ${invoice.member.mobile}`);
        if (invoice.member?.email) doc.text(`Email: ${invoice.member.email}`);
        if (invoice.memberAddress) doc.text(`Address: ${invoice.memberAddress}`);
        if (invoice.memberGstNumber) doc.text(`Member GSTIN: ${invoice.memberGstNumber}`);
        if (invoice.memberPanNumber) doc.text(`PAN: ${invoice.memberPanNumber}`);

        doc.moveDown(1.2);

        // Line Items Table Header
        const tableTop = doc.y;
        doc.rect(45, tableTop, 505, 22).fill('#F1F5F9');
        doc.fillColor('#0F172A').fontSize(9.5);
        doc.text('Description', 55, tableTop + 6);
        doc.text('Amount (INR)', 440, tableTop + 6, { width: 100, align: 'right' });

        const itemY = tableTop + 30;
        const planTitle = invoice.plan?.name
          ? `Membership Plan - ${invoice.plan.name}`
          : 'Fitness Membership / Services';
        doc.fillColor('#334155').fontSize(10).text(planTitle, 55, itemY);
        doc.text(`₹${Number(invoice.amount || 0).toFixed(2)}`, 440, itemY, {
          width: 100,
          align: 'right',
        });

        doc.y = itemY + 28;
        doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#E2E8F0').stroke();
        doc.moveDown(0.8);

        // Totals Breakdown
        const addSummaryRow = (label: string, value: string, bold = false) => {
          const y = doc.y;
          doc.fontSize(bold ? 11 : 9.5).fillColor(bold ? '#0F172A' : '#475569');
          doc.text(label, 310, y, { width: 130, align: 'right' });
          doc.text(value, 445, y, { width: 95, align: 'right' });
          doc.moveDown(0.5);
        };

        if (invoice.discount > 0) {
          const discountLabel =
            invoice.discountType === 'PERCENTAGE'
              ? `Discount (${invoice.discount}%):`
              : 'Discount:';
          const discountAmt =
            invoice.discountType === 'PERCENTAGE'
              ? (invoice.amount * invoice.discount) / 100
              : invoice.discount;
          addSummaryRow(discountLabel, `-₹${discountAmt.toFixed(2)}`);
        }

        const gstRate = invoice.gstRate ?? 18;
        addSummaryRow(`CGST (${(gstRate / 2).toFixed(1)}%):`, `₹${Number(invoice.cgst || 0).toFixed(2)}`);
        addSummaryRow(`SGST (${(gstRate / 2).toFixed(1)}%):`, `₹${Number(invoice.sgst || 0).toFixed(2)}`);
        if (invoice.lateFee > 0) {
          addSummaryRow('Late Fee:', `₹${Number(invoice.lateFee).toFixed(2)}`);
        }

        const total = invoice.totalAmount > 0 ? invoice.totalAmount : invoice.amount;
        const paid = invoice.paidAmount || 0;
        const balance = Math.max(0, total - paid);

        doc.moveDown(0.3);
        addSummaryRow('Total Amount:', `₹${Number(total).toFixed(2)}`, true);
        addSummaryRow('Paid Amount:', `₹${Number(paid).toFixed(2)}`);
        addSummaryRow('Balance Due:', `₹${balance.toFixed(2)}`, true);

        if (invoice.paymentMethod) {
          doc.moveDown(1);
          doc.fontSize(9).fillColor('#475569').text(`Payment Method: ${invoice.paymentMethod}`);
          if (invoice.transactionReference || invoice.razorpayPaymentId) {
            doc.text(
              `Transaction Ref: ${invoice.razorpayPaymentId || invoice.transactionReference}`,
            );
          }
        }

        doc.moveDown(2);
        doc.fontSize(8.5).fillColor('#94A3B8').text('Thank you for training with us!', {
          align: 'center',
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
