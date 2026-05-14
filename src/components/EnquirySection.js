import React, { useMemo, useState } from 'react';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  comments: '',
  company: '', // honeypot (must stay empty)
};

const WHATSAPP_NUMBER = '9188081324';

const buildWhatsappMessage = ({ name, phone, email, comments }) => {
  const lines = [
    'New website enquiry',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    '',
    'Message:',
    comments,
  ];
  return lines.join('\n');
};

const EnquirySection = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }

  const isValidEmail = useMemo(() => {
    const value = form.email.trim();
    if (!value) return false;
    // Practical email check; Firestore rules enforce type/size.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, [form.email]);

  const canSubmit = useMemo(() => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const comments = form.comments.trim();
    if (!name || !phone || !email || !comments) return false;
    if (!isValidEmail) return false;
    if (form.company.trim()) return false;
    return true;
  }, [form, isValidEmail]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setStatus(null);

    if (!canSubmit) {
      setStatus({ type: 'error', message: 'Please fill all fields with a valid email address.' });
      return;
    }

    setSubmitting(true);
    try {
      const message = buildWhatsappMessage({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        comments: form.comments.trim(),
      });
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setStatus({ type: 'success', message: 'WhatsApp opened in a new tab. Please tap Send to complete.' });
    } catch (error) {
      console.error('Unable to open WhatsApp:', error);
      setStatus({ type: 'error', message: 'Unable to open WhatsApp. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="enquiry" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-3 text-sapphire">Enquiry</h2>
          <p className="text-center text-gray-600 mb-10">
            Send us your details and message. We will get back to you as soon as possible.
          </p>

          <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="enquiry-name">
                    Name
                  </label>
                  <input
                    id="enquiry-name"
                    type="text"
                    value={form.name}
                    onChange={onChange('name')}
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="enquiry-phone">
                    Phone number
                  </label>
                  <input
                    id="enquiry-phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange('phone')}
                    required
                    autoComplete="tel"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                    placeholder="Your number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="enquiry-email">
                  Email
                </label>
                <input
                  id="enquiry-email"
                  type="email"
                  value={form.email}
                  onChange={onChange('email')}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder="yourname@example.com"
                />
                {!isValidEmail && form.email.trim() ? (
                  <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="enquiry-comments">
                  Comments
                </label>
                <textarea
                  id="enquiry-comments"
                  value={form.comments}
                  onChange={onChange('comments')}
                  required
                  rows={5}
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
                  placeholder="Write your message..."
                />
              </div>

              {/* Honeypot: bots may fill this; humans won't see it */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="enquiry-company">Company</label>
                <input id="enquiry-company" type="text" value={form.company} onChange={onChange('company')} tabIndex={-1} />
              </div>

              {status ? (
                <div
                  className={`rounded-xl px-4 py-3 text-sm ${
                    status.type === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border border-red-200 bg-red-50 text-red-800'
                  }`}
                  role="status"
                >
                  {status.message}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  By submitting, you agree to share this information with St. Sebastian Church Parish Council.
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-sapphire px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sapphire/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Opening…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnquirySection;
