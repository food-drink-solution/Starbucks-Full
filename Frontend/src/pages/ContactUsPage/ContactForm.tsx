import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components';
import { apiClient } from '@/lib/api/client';
import type { ContactUsData as ContactData } from '@/types/pages';

interface ContactFormProps {
  data: ContactData;
  isRTL: boolean;
  textAlignClass: string;
}

export function ContactForm({ data, isRTL, textAlignClass }: ContactFormProps) {
  const { t } = useTranslation(['pages']);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Swagger: POST /api/v1/Contact — Submit a contact form / feedback
      await apiClient.post('/api/v1/Contact', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setSubmitted(true);
    } catch {
      setError(t('pages:contact.form.error', 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-50 dark:bg-white/5 rounded-[3rem] p-8 lg:p-16 shadow-sm border border-gray-100 dark:border-white/10"
    >
      <div className={`mb-12 ${textAlignClass}`}>
        <h2 className="text-4xl font-black text-starbucks-dark dark:text-white mb-4">
          {t('pages:contact.form.title')}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
          {t('pages:contact.form.subtitle')}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2rem] bg-starbucks-green/5 border border-starbucks-green/20 p-12 text-center"
          >
            <div className="bg-starbucks-green text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-starbucks-dark dark:text-white mb-3">
              {t('pages:contact.form.success.title')}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('pages:contact.form.success.message')}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-red-700 dark:text-red-300 text-center" role="alert">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <div className="space-y-4">
                <label className={`block text-lg font-black text-starbucks-dark dark:text-white px-2 ${textAlignClass}`}>
                  {t('pages:contact.form.fields.name.label')}
                </label>
                <Input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('pages:contact.form.fields.name.placeholder')}
                  className="h-16 text-lg rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
                />
              </div>
              <div className="space-y-4">
                <label className={`block text-lg font-black text-starbucks-dark dark:text-white px-2 ${textAlignClass}`}>
                  {t('pages:contact.form.fields.email.label')}
                </label>
                <Input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('pages:contact.form.fields.email.placeholder')}
                  dir="ltr"
                  className="h-16 text-lg rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <div className="space-y-4">
                <label className={`block text-lg font-black text-starbucks-dark dark:text-white px-2 ${textAlignClass}`}>
                  {t('pages:contact.form.fields.phone.label')}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('pages:contact.form.fields.phone.placeholder')}
                  dir="ltr"
                  className="h-16 text-lg rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
                />
              </div>
              <div className="space-y-4">
                <label className={`block text-lg font-black text-starbucks-dark dark:text-white px-2 ${textAlignClass}`}>
                  {t('pages:contact.form.fields.subject.label')}
                </label>
                <Select
                  isRTL={isRTL}
                  options={(data.form.subjects as string[]).map((sId) => ({
                    id: sId,
                    label: t(`pages:contact.form.subjects.${sId}`),
                  }))}
                  value={form.subject}
                  onChange={(val) => setForm((prev) => ({ ...prev, subject: val }))}
                  placeholder={t('pages:contact.form.fields.subject.placeholder')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className={`block text-lg font-black text-starbucks-dark dark:text-white px-2 ${textAlignClass}`}>
                {t('pages:contact.form.fields.message.label')}
              </label>
              <Textarea
                required
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                placeholder={t('pages:contact.form.fields.message.placeholder')}
                className="text-lg rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
              />
            </div>

            <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <Button
                type="submit"
                loading={loading}
                className="h-16 px-16 text-xl font-black rounded-full bg-starbucks-green hover:bg-starbucks-dark text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>{t('pages:contact.form.fields.submit')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Send className={`h-6 w-6 ${isRTL ? 'rotate-180' : ''}`} />
                    <span>{t('pages:contact.form.fields.submit')}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
