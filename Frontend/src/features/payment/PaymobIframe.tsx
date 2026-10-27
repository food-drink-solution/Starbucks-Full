import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { usePayment } from '@/hooks/business/usePayment';

interface PaymobIframeProps {
  iframeUrl: string;
  orderId: string;
  onPaymentSuccess: () => void;
  onPaymentFailed: (errorMsg?: string) => void;
}

export const PaymobIframe: React.FC<PaymobIframeProps> = ({
  iframeUrl,
  orderId,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const { i18n } = useTranslation(['pages']);
  const isRTL = i18n.language === 'ar';
  
  const { paymentStatus } = usePayment(orderId);

  // Poll database status or check postMessage from Paymob iframe
  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus.status === 2) {
      // Completed
      onPaymentSuccess();
    } else if (paymentStatus.status === 3 || paymentStatus.status === 4) {
      // Failed or Cancelled
      onPaymentFailed(paymentStatus.message || 'Payment failed');
    }
  }, [paymentStatus, onPaymentSuccess, onPaymentFailed]);

  // Optionally listen to iframe postMessage events if supported by gateway config
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Paymob postMessage format or success redirects
      if (event.data && typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.success === true) {
            onPaymentSuccess();
          } else if (data.success === false) {
            onPaymentFailed(data.error_message || 'Payment unsuccessful');
          }
        } catch {
          // Ignore non-json messages
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPaymentSuccess, onPaymentFailed]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-xl text-center space-y-2 border border-gray-100">
        <h4 className="font-semibold text-gray-900">
          {isRTL ? 'إكمال عملية الدفع' : 'Complete Your Payment'}
        </h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          {isRTL
            ? 'يرجى إدخال تفاصيل بطاقتك أدناه. لا تغلق هذه الصفحة حتى يكتمل الدفع.'
            : 'Please enter your card details below. Do not close this page until your payment is processed.'}
        </p>
      </div>

      <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white min-h-[500px]">
        {/* Loading overlay behind iframe */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 -z-10">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-800 mx-auto" />
            <p className="text-sm text-gray-500">
              {isRTL ? 'جاري تحميل بوابة الدفع الآمنة...' : 'Loading secure payment gateway...'}
            </p>
          </div>
        </div>

        <iframe
          src={iframeUrl}
          className="w-full min-h-[600px] border-0"
          title="Paymob Secure Checkout"
          allow="payment"
        />
      </div>
    </div>
  );
};
