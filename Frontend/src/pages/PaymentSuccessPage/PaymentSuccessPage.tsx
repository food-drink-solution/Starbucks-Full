import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { paymentService } from '@/services/api/paymentService';
import { SEO } from '@/components';
import { useLanguage } from '@/hooks';

export function PaymentSuccessPage() {
  const { t, i18n } = useTranslation(['pages']);
  const { isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const orderId = searchParams.get('orderId') || searchParams.get('merchant_order_id');
  const externalTxId = searchParams.get('payment_intent') || searchParams.get('id'); // Stripe / Paymob

  useEffect(() => {
    async function verify() {
      if (!orderId) {
        setIsVerifying(false);
        setIsSuccess(false);
        return;
      }

      try {
        const confirmed = await paymentService.confirmPayment(orderId, externalTxId);
        setIsSuccess(confirmed);
      } catch (err) {
        console.error('Confirmation failed', err);
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    }

    verify();
  }, [orderId, externalTxId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO title={t('pages:checkout.paymentSuccess', { defaultValue: 'Payment Success' })} />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center space-y-6">
        {isVerifying ? (
          <div className="space-y-4 py-8">
            <Loader2 className="h-16 w-16 animate-spin text-emerald-800 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">
              {isRTL ? 'جاري التحقق من الدفع...' : 'Verifying your payment...'}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL ? 'من فضلك انتظر ثانية واحدة بينما نقوم بتحديث طلبك.' : 'Please wait a moment while we update your order status.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 text-emerald-800">
              {isSuccess ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {isRTL ? (isSuccess ? 'تم الدفع بنجاح!' : 'تعذر تأكيد الدفع') : (isSuccess ? 'Payment Successful!' : 'Payment Could Not Be Confirmed')}
              </h2>
              <p className="text-sm text-gray-500">
                {isSuccess
                  ? isRTL
                    ? 'شكراً لطلبك من ستاربكس. تم استلام دفعتك وتأكيد طلبك.'
                    : 'Thank you for your order! Your payment was received and confirmed.'
                  : isRTL
                    ? 'لم نتمكن من تأكيد دفعتك. يمكنك العودة إلى صفحة الدفع والمحاولة مرة أخرى.'
                    : 'We could not confirm your payment. Return to checkout to try again.'}
              </p>
            </div>

            {orderId && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{isRTL ? 'رقم المعاملة' : 'Transaction ID'}</span>
                  <span className="font-mono text-xs">{externalTxId || 'N/A'}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(isSuccess && orderId ? `/${i18n.language}/order/${orderId}` : `/${i18n.language}/checkout`)}
              className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <span>{isSuccess ? (isRTL ? 'عرض تفاصيل الطلب' : 'View Order Details') : (isRTL ? 'العودة إلى الدفع' : 'Return to Checkout')}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
