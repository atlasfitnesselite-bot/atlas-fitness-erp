import React from 'react';

export default function InvoiceLivePreview({
  companySettings = null,
  invoiceNumber = 'INV-PREVIEW',
  billType = 'MEMBERSHIP',
  member = null,
  planName = '',
  ptPackageName = '',
  trainerName = '',
  amount = 0,
  discount = 0,
  discountType = 'AMOUNT',
  gstRate = 5,
  lateFee = 0,
  paidAmount = 0,
  dueDate = '',
  createdAt = '',
  status = 'PENDING',
  paymentMethod = '',
  memberGstNumber = '',
  memberPanNumber = '',
  memberAddress = '',
  notes = '',
}) {
  const base = parseFloat(amount) || 0;
  const discInput = parseFloat(discount) || 0;
  const discVal = discountType === 'PERCENTAGE' ? (base * discInput) / 100 : discInput;
  const taxable = Math.max(0, base - discVal);
  const rate = parseFloat(gstRate) || 0;
  const gstAmount = (taxable * rate) / 100;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const late = parseFloat(lateFee) || 0;
  const grandTotal = taxable + gstAmount + late;
  const paid = status === 'PAID' && !paidAmount ? grandTotal : parseFloat(paidAmount) || 0;
  const balance = Math.max(0, grandTotal - paid);

  const memberFullName = member
    ? `${member.firstName || ''} ${member.lastName && member.lastName !== '-' ? member.lastName : ''}`.trim() || 'Select Member'
    : 'Select Member';

  const itemTitle =
    billType === 'PT'
      ? ptPackageName
        ? `Personal Training - ${ptPackageName}${trainerName ? ` (${trainerName})` : ''}`
        : notes || `Personal Training Fee${trainerName ? ` (${trainerName})` : ''}`
      : planName
        ? `Membership Plan - ${planName}`
        : notes || 'Fitness Membership / Services';

  const formatDate = (d) => {
    if (!d) return new Date().toLocaleDateString('en-IN');
    const parsed = new Date(d);
    return Number.isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('en-IN');
  };

  const companyName = companySettings?.companyName || 'Atlas Fitness Elite';
  const companyAddress = companySettings?.address || '123 Fitness Ave, Gym City';
  const companyContact = companySettings?.companyContact || '9876543210';
  const companyEmail = companySettings?.email || 'info@atlasfitness.com';
  const companyGst = companySettings?.gstNumber || '29ABCDE1234F1Z5';
  const apiBase = import.meta.env.VITE_API_URL || '';
  const logoSrc = companySettings?.companyLogo
    ? companySettings.companyLogo.startsWith('http')
      ? companySettings.companyLogo
      : `${apiBase}${companySettings.companyLogo}`
    : '/atlas-logo.png';

  return (
    <div className="bg-white text-slate-900 rounded-md border border-slate-200 shadow-sm p-5 text-xs leading-relaxed">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-start gap-2.5">
          <img
            src={logoSrc}
            alt={companyName}
            className="h-10 w-auto max-w-[120px] object-contain shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h3 className="text-base font-bold text-red-600 tracking-tight">{companyName}</h3>
            {companyAddress && <p className="text-[11px] text-slate-600">{companyAddress}</p>}
            {(companyContact || companyEmail) && (
              <p className="text-[10.5px] text-slate-500">
                {[companyContact, companyEmail].filter(Boolean).join(' | ')}
              </p>
            )}
            {companyGst && (
              <p className="text-[10.5px] text-slate-600 font-mono">GSTIN: {companyGst}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">
            {rate > 0 ? 'TAX INVOICE' : 'PAYMENT RECEIPT'}
          </p>
          <p className="text-[11px] text-slate-600 font-mono">{invoiceNumber}</p>
          <p className="text-[11px] text-slate-500">Date: {formatDate(createdAt)}</p>
          <p className="text-[11px] text-slate-500">Due: {formatDate(dueDate)}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
              status === 'PAID'
                ? 'bg-emerald-100 text-emerald-700'
                : status === 'OVERDUE'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Bill To */}
      <div className="py-3 border-b border-slate-200">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
          Bill To
        </p>
        <p className="font-semibold text-slate-900 text-sm">{memberFullName}</p>
        {member?.memberId && (
          <p className="text-[11px] text-slate-600 font-mono">Member ID: {member.memberId}</p>
        )}
        {member?.mobile && <p className="text-[11px] text-slate-600">Phone: {member.mobile}</p>}
        {member?.email && <p className="text-[11px] text-slate-600">Email: {member.email}</p>}
        {memberAddress && <p className="text-[11px] text-slate-600">Address: {memberAddress}</p>}
        {memberGstNumber && (
          <p className="text-[11px] text-slate-600 font-mono">GSTIN: {memberGstNumber}</p>
        )}
        {memberPanNumber && (
          <p className="text-[11px] text-slate-600 font-mono">PAN: {memberPanNumber}</p>
        )}
      </div>

      {/* Line Items Table */}
      <div className="py-3">
        <div className="grid grid-cols-12 bg-slate-100 px-2.5 py-1.5 rounded font-semibold text-slate-700 text-[11px]">
          <div className="col-span-8">Description</div>
          <div className="col-span-4 text-right">Amount (INR)</div>
        </div>
        <div className="grid grid-cols-12 px-2.5 py-2.5 border-b border-slate-100 items-center">
          <div className="col-span-8 font-medium text-slate-800">{itemTitle}</div>
          <div className="col-span-4 text-right font-semibold text-slate-900">
            ₹{base.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end pt-1">
        <div className="w-60 space-y-1 text-[11px]">
          {discVal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>
                Discount{discountType === 'PERCENTAGE' ? ` (${discInput}%)` : ''}:
              </span>
              <span>-₹{discVal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount:</span>
            <span>₹{taxable.toFixed(2)}</span>
          </div>
          {rate > 0 ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>CGST ({(rate / 2).toFixed(1)}%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({(rate / 2).toFixed(1)}%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-500">
              <span>GST:</span>
              <span>0% (Exempt / No GST)</span>
            </div>
          )}
          {late > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Late Fee:</span>
              <span>₹{late.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-1.5 mt-1">
            <span>Grand Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Paid Amount:</span>
            <span>₹{paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-800">
            <span>Balance Due:</span>
            <span>₹{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {paymentMethod && status === 'PAID' && (
        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          Payment Method: <span className="font-medium text-slate-700">{paymentMethod}</span>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-400 mt-5 pt-2 border-t border-slate-100">
        Thank you for training with Atlas Fitness!
      </p>
    </div>
  );
}
