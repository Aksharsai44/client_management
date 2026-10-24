import React, { useState } from 'react';
import { PaymentRecord, CompanyAdminMetric } from '../../../types';
import {
  CreditCard,
  QrCode,
  Landmark,
  Building2,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Receipt,
  Download,
  Printer,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ClientPaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  receivingCompany: CompanyAdminMetric | null;
  onPaymentComplete: (
    paymentId: string,
    details: {
      paidDate: string;
      paymentMethod: string;
      transactionReference: string;
      notes?: string;
    }
  ) => void;
}

export const ClientPaymentGatewayModal: React.FC<ClientPaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  payment,
  receivingCompany,
  onPaymentComplete,
}) => {
  // Tabs: 'upi_qr' | 'card' | 'netbanking' | 'bank_transfer'
  const [selectedMethod, setSelectedMethod] = useState<'upi_qr' | 'card' | 'netbanking' | 'bank_transfer'>('upi_qr');

  // Copy indicator
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('Sarah Jenkins');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('842');

  // UPI State
  const [upiRefId, setUpiRefId] = useState('');

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Bank Transfer State
  const [transferUtr, setTransferUtr] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('482910');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    ref: string;
    method: string;
    date: string;
  } | null>(null);

  if (!isOpen || !payment) return null;

  // Account details from the receiving company
  const companyName = receivingCompany?.companyName || 'Corporate Service Provider';
  const bankName = receivingCompany?.bankName || 'HDFC Bank';
  const accountHolder = receivingCompany?.accountHolderName || companyName;
  const accountNumber = receivingCompany?.accountNumber || '50200084920192';
  const ifscCode = receivingCompany?.ifscCode || 'HDFC0001234';
  const accountType = receivingCompany?.accountType || 'Current Account';
  const upiId =
    receivingCompany?.upiId ||
    `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@hdfcbank`;

  const copyToClipboard = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Process UPI Payment
  const handleUpiPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const genRef = upiRefId.trim() || `UPI-${Date.now().toString().slice(-8)}`;
      const methodLabel = `UPI / QR (${upiId})`;
      const todayStr = new Date().toISOString().split('T')[0];

      onPaymentComplete(payment.id, {
        paidDate: todayStr,
        paymentMethod: methodLabel,
        transactionReference: genRef,
        notes: `Settled via UPI to ${companyName} (${upiId})`,
      });

      setIsProcessing(false);
      setReceiptData({ ref: genRef, method: methodLabel, date: todayStr });
      setPaymentSuccess(true);
    }, 1800);
  };

  // 2. Process Card Payment
  const handleCardPay = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOtpModal(true);
  };

  const handleVerifyOtp = () => {
    setShowOtpModal(false);
    setIsProcessing(true);
    setTimeout(() => {
      const genRef = `CARD-AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
      const masked = cardNumber.slice(-4) || '8821';
      const methodLabel = `Corporate Credit Card (ending in ${masked})`;
      const todayStr = new Date().toISOString().split('T')[0];

      onPaymentComplete(payment.id, {
        paidDate: todayStr,
        paymentMethod: methodLabel,
        transactionReference: genRef,
        notes: `Settled via Card ending in ${masked} to ${companyName}`,
      });

      setIsProcessing(false);
      setReceiptData({ ref: genRef, method: methodLabel, date: todayStr });
      setPaymentSuccess(true);
    }, 1500);
  };

  // 3. Process NetBanking Payment
  const handleNetBankingPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const bankCode = selectedBank.split(' ')[0].toUpperCase();
      const genRef = `NB-${bankCode}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const methodLabel = `NetBanking (${selectedBank})`;
      const todayStr = new Date().toISOString().split('T')[0];

      onPaymentComplete(payment.id, {
        paidDate: todayStr,
        paymentMethod: methodLabel,
        transactionReference: genRef,
        notes: `Settled via ${selectedBank} Corporate NetBanking to ${companyName}`,
      });

      setIsProcessing(false);
      setReceiptData({ ref: genRef, method: methodLabel, date: todayStr });
      setPaymentSuccess(true);
    }, 1600);
  };

  // 4. Process Direct Bank Transfer
  const handleBankTransferPay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const genRef = transferUtr.trim() || `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const methodLabel = `Bank Transfer (NEFT/RTGS to ${bankName})`;
      const todayStr = transferDate || new Date().toISOString().split('T')[0];

      onPaymentComplete(payment.id, {
        paidDate: todayStr,
        paymentMethod: methodLabel,
        transactionReference: genRef,
        notes: `NEFT/RTGS Transfer to ${bankName} A/C ${accountNumber.slice(-4)} (${accountHolder})`,
      });

      setIsProcessing(false);
      setReceiptData({ ref: genRef, method: methodLabel, date: todayStr });
      setPaymentSuccess(true);
    }, 1400);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-6 animate-in fade-in zoom-in-95 space-y-5 relative">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h4 className="font-extrabold text-slate-900 text-sm">
                Securing & Authorizing Payment...
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Connecting to {companyName} verified merchant desk
              </p>
            </div>
          </div>
        )}

        {/* 3D-Secure OTP Simulation Modal */}
        {showOtpModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-xs rounded-3xl flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-xs text-slate-900">Bank 3D-Secure 2.0</span>
                </div>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  A 6-digit verification code has been sent to your registered mobile number{' '}
                  <strong className="text-slate-900">•••• •••• 99</strong>.
                </p>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] font-bold">
                  Amount: {payment.currencySymbol}{payment.amount.toLocaleString()} &bull; Merchant: {companyName}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Enter 6-Digit OTP:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center text-lg tracking-widest font-mono font-black py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
              >
                Confirm & Authorize Payment
              </button>
            </div>
          </div>
        )}

        {/* Payment Success View */}
        {paymentSuccess ? (
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Payment Completed & Verified
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                {payment.currencySymbol}{payment.amount.toLocaleString()} Settled Successfully!
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Funds deposited to <strong className="text-slate-800">{companyName}</strong> receiving account. Status updated in real-time.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900">{payment.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Payment Reference / UTR:</span>
                <span className="font-mono font-bold text-blue-700">{receiptData?.ref}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-semibold text-slate-800">{receiptData?.method}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Settled To Account:</span>
                <span className="font-semibold text-slate-800">{bankName} (A/C: •••• {accountNumber.slice(-4)})</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 font-medium">Timestamp:</span>
                <span className="font-mono text-slate-700">{receiptData?.date} (Real-Time Cleared)</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print / Download Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Done &bull; Return to Portal
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold shadow-2xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Invoice Checkout & Settlement
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invoice #{payment.invoiceNumber} &bull; {payment.billingMonth}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Merchant & Amount Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4.5 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">
                  Paying Verified Organization
                </span>
                <h4 className="text-base font-black text-white mt-0.5">{companyName}</h4>
                <div className="text-[11px] text-blue-100 flex items-center space-x-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Verified Receiving Account: {bankName}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">
                  Total Payable
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {payment.currencySymbol}{payment.amount.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">
                  0% Gateway Fee &bull; Immediate
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi_qr')}
                className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'upi_qr'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'netbanking'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('bank_transfer')}
                className={`py-2 px-1 rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  selectedMethod === 'bank_transfer'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-amber-600" />
                <span>NEFT/RTGS</span>
              </button>
            </div>

            {/* ============================================================= */}
            {/* 1. UPI & DYNAMIC QR CODE METHOD                               */}
            {/* ============================================================= */}
            {selectedMethod === 'upi_qr' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  {/* Dynamic Visual QR Code */}
                  <div className="w-32 h-32 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md shrink-0 flex items-center justify-center relative group">
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="0" y="0" width="30" height="30" rx="3" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />
                      <rect x="70" y="0" width="30" height="30" rx="3" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />
                      <rect x="0" y="70" width="30" height="30" rx="3" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />
                      <rect x="36" y="8" width="12" height="12" />
                      <rect x="52" y="8" width="12" height="12" />
                      <rect x="36" y="24" width="28" height="14" />
                      <rect x="8" y="36" width="14" height="28" />
                      <rect x="70" y="36" width="22" height="14" />
                      <rect x="70" y="54" width="12" height="12" />
                      <rect x="36" y="44" width="28" height="28" />
                      <rect x="42" y="50" width="16" height="16" fill="white" />
                      <rect x="46" y="54" width="8" height="8" />
                      <rect x="36" y="78" width="12" height="14" />
                      <rect x="52" y="78" width="14" height="14" />
                      <rect x="70" y="72" width="22" height="20" />
                    </svg>
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-[10px] font-bold text-blue-900 backdrop-blur-2xs">
                      Scan to Pay
                    </div>
                  </div>

                  {/* UPI Details & Copy */}
                  <div className="space-y-2 text-left w-full">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Merchant UPI ID (VPA)
                      </span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-blue-800 bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 select-all grow truncate">
                          {upiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('upi', upiId)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
                        >
                          {copiedField === 'upi' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Supported:</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        Google Pay
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        PhonePe
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        Paytm
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        BHIM UPI
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Scan with any UPI app on your phone, or click below for instant gateway settlement.
                    </p>
                  </div>
                </div>

                {/* Instant Verification Simulation Action */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleUpiPay}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Confirm & Verify UPI Payment ({payment.currencySymbol}{payment.amount.toLocaleString()})</span>
                  </button>

                  <div className="text-center text-[10px] text-slate-400">
                    Direct integration with {companyName} merchant VPA
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 2. CREDIT / DEBIT CARDS METHOD                                */}
            {/* ============================================================= */}
            {selectedMethod === 'card' && (
              <form onSubmit={handleCardPay} className="space-y-3.5">
                {/* Visual Card Preview */}
                <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white rounded-2xl p-4 shadow-md border border-slate-700 flex flex-col justify-between h-36 relative overflow-hidden">
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      Corporate Debit / Credit
                    </span>
                    <span className="text-xs font-black tracking-widest text-amber-300">
                      VISA / MasterCard
                    </span>
                  </div>

                  <div className="font-mono text-base font-black tracking-widest z-10 text-slate-100">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex items-center justify-between z-10 text-[10px] pt-1 border-t border-white/10">
                    <div>
                      <span className="text-slate-400 block uppercase text-[8px] font-semibold">
                        Cardholder
                      </span>
                      <span className="font-bold text-slate-100 truncate block">
                        {cardHolder || 'Client Representative'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block uppercase text-[8px] font-semibold">
                        Expires
                      </span>
                      <span className="font-mono font-bold text-slate-100">{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Card Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="16-digit card number"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Expiry *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl font-mono text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl font-mono text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {payment.currencySymbol}{payment.amount.toLocaleString()} via Card</span>
                </button>
              </form>
            )}

            {/* ============================================================= */}
            {/* 3. NETBANKING METHOD                                          */}
            {/* ============================================================= */}
            {selectedMethod === 'netbanking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Your Corporate Bank:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'HDFC Bank', code: 'HDFC' },
                      { name: 'ICICI Bank', code: 'ICICI' },
                      { name: 'State Bank of India', code: 'SBI' },
                      { name: 'Axis Bank', code: 'AXIS' },
                      { name: 'Kotak Mahindra', code: 'KOTAK' },
                      { name: 'Punjab National Bank', code: 'PNB' },
                    ].map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => setSelectedBank(b.name)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                          selectedBank === b.name
                            ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Or Choose from Other Banks:
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Yes Bank">Yes Bank</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Secured 256-bit encrypted gateway directly connecting to {selectedBank}.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNetBankingPay}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Proceed to {selectedBank} NetBanking ({payment.currencySymbol}{payment.amount.toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* ============================================================= */}
            {/* 4. DIRECT BANK TRANSFER (NEFT / RTGS / IMPS)                  */}
            {/* ============================================================= */}
            {selectedMethod === 'bank_transfer' && (
              <form onSubmit={handleBankTransferPay} className="space-y-4">
                {/* Admin Bank Details Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Beneficiary Name:</span>
                    <div className="flex items-center space-x-1 font-bold text-slate-900">
                      <span>{accountHolder}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('holder', accountHolder)}
                        className="text-slate-400 hover:text-blue-600 ml-1"
                        title="Copy"
                      >
                        {copiedField === 'holder' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Bank Name:</span>
                    <span className="font-bold text-slate-900">{bankName}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Account Number:</span>
                    <div className="flex items-center space-x-1 font-mono font-bold text-blue-800">
                      <span>{accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('acct', accountNumber)}
                        className="text-slate-400 hover:text-blue-600 ml-1"
                        title="Copy Account Number"
                      >
                        {copiedField === 'acct' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">IFSC Code:</span>
                    <div className="flex items-center space-x-1 font-mono font-bold text-slate-900">
                      <span>{ifscCode}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('ifsc', ifscCode)}
                        className="text-slate-400 hover:text-blue-600 ml-1"
                        title="Copy IFSC"
                      >
                        {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Account Type:</span>
                    <span className="font-semibold text-slate-800">{accountType}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Transfer Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Bank Transfer Reference (UTR) *
                    </label>
                    <input
                      type="text"
                      required
                      value={transferUtr}
                      onChange={(e) => setTransferUtr(e.target.value)}
                      placeholder="e.g. UTR-9823481234"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Transfer Reference & Clear Dues</span>
                </button>
              </form>
            )}

            {/* Security Footer Notice */}
            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>TLS 1.3 End-to-End Encrypted Settlement &bull; Auto-Reconciled</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
