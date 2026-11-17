import React, { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { AdminEditButton } from '../components/AdminEditButton';
import { calculateInvoiceEstimate, validateBookingForm } from '../lib/domain';
import type { BookServiceItem } from '../types/site';

export function BookABrainPage() {
  const { siteContent } = useSite();
  const bb = siteContent?.bookABrain;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bestTime, setBestTime] = useState<'Morning 8–12' | 'Afternoon 12–5' | 'Evening 5–8'>('Afternoon 12–5');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [paymentOption, setPaymentOption] = useState<'Pay As You Go' | 'Flat Rate' | 'Payment Plan'>('Pay As You Go');
  const [budgetRange, setBudgetRange] = useState<'Under $100' | '$100–$300' | '$300–$750' | '$750+'>('$100–$300');
  const [communityRate, setCommunityRate] = useState(false);
  const [communityGroup, setCommunityGroup] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  const services = bb?.services || [];
  const groupedServices = useMemo(() => {
    const map = new Map<string, BookServiceItem[]>();
    for (const s of services) {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    }
    return Array.from(map.entries());
  }, [services]);

  const selectedServices = useMemo(
    () => services.filter((s) => serviceIds.includes(s.id)),
    [services, serviceIds]
  );

  const estimate = useMemo(
    () =>
      calculateInvoiceEstimate(
        selectedServices,
        communityRate,
        bb?.communityDiscountPercent ?? 20,
        paymentOption
      ),
    [selectedServices, communityRate, bb?.communityDiscountPercent, paymentOption]
  );

  function toggleService(id: string) {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    const fieldErrors = validateBookingForm({
      fullName,
      phone,
      email,
      bestTime,
      serviceIds,
      communityRate,
      communityGroup,
      message,
    });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          bestTime,
          serviceIds,
          paymentOption,
          budgetRange,
          communityRate,
          communityGroup,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Could not send your request. Please check your details.');
        if (data.errors) setErrors(data.errors);
        return;
      }
      setSubmittedMessage(data.message || "Thank you! I'll reach out within 1–2 business days.");
      setFullName('');
      setPhone('');
      setEmail('');
      setServiceIds([]);
      setCommunityRate(false);
      setCommunityGroup('');
      setMessage('');
      setErrors({});
    } catch {
      setSubmitError('Network hiccup. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (siteContent && !siteContent.pagesEnabled.bookABrain) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Bookings are paused right now.</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-12">
      <SeoHead
        pageKey="bookABrain"
        fallbackTitle="Book a Brain – Tech Help, Websites & Tutoring | Bits & Brains"
        fallbackDescription="Book 1-on-1 tech tutoring, website building, creative editing, or office organization with clear prices and community discounts."
      />

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0E1033]">
            {bb?.heading || 'Book a Brain'}
          </h1>
          <AdminEditButton pageKey="bookABrain" label="Book a Brain" />
        </div>
        <p className="max-w-3xl text-lg text-[#0E1033]/85">
          {bb?.intro}
        </p>
      </header>

      {/* Payment Options */}
      {(bb?.sectionsEnabled?.paymentOptions ?? true) && (
        <section aria-labelledby="payment-options-heading">
          <h2 id="payment-options-heading" className="font-display text-2xl font-bold text-[#0E1033]">
            Simple Payment Options
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(bb?.paymentOptions || []).map((opt, idx) => (
              <div
                key={opt.id}
                className={`rounded-2xl border-2 border-[#0E1033] p-5 ${
                  opt.id === 'community_rate'
                    ? 'bg-[#D1006F] text-white'
                    : idx % 2 === 0
                    ? 'bg-white text-[#0E1033]'
                    : 'bg-[#1F4BFF] text-white'
                }`}
              >
                <h3 className="font-display text-lg font-bold">{opt.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed opacity-95">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Services Grouped by Category */}
      {(bb?.sectionsEnabled?.services ?? true) && (
        <section aria-labelledby="services-heading" className="space-y-8">
          <div>
            <h2 id="services-heading" className="font-display text-3xl font-bold text-[#0E1033]">
              Services & Prices
            </h2>
            <p className="mt-1 text-base font-semibold text-[#1F4BFF]">
              {bb?.priceNote || 'Prices are starting points. Every project gets a free quote first.'}
            </p>
          </div>

          {groupedServices.map(([category, list]) => (
            <div key={category} className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-[#0E1033] border-b-2 border-[#D8DDF5] pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {list.map((srv) => {
                  const selected = serviceIds.includes(srv.id);
                  return (
                    <article
                      key={srv.id}
                      className={`rounded-2xl border-2 p-5 transition-colors flex flex-col justify-between ${
                        selected
                          ? 'border-[#1F4BFF] bg-white shadow-[0_4px_0_#1F4BFF]'
                          : 'border-[#0E1033] bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-display text-xl font-bold text-[#0E1033]">
                          {srv.name}
                        </h4>
                        <p className="mt-1 text-sm font-bold text-[#D1006F] tabular-nums">
                          {srv.priceLabel}
                        </p>
                        <p className="mt-2 text-base text-[#0E1033]">{srv.description}</p>
                        <p className="mt-2 text-sm text-[#0E1033]/80">
                          <span className="font-semibold">What is included: </span>
                          {srv.included}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#D8DDF5]">
                        <button
                          type="button"
                          onClick={() => toggleService(srv.id)}
                          aria-pressed={selected}
                          className={`rounded-xl border-2 border-[#0E1033] px-4 py-2 text-sm font-bold transition-colors ${
                            selected
                              ? 'bg-[#1F4BFF] text-white'
                              : 'bg-[#F7F8FF] text-[#0E1033] hover:bg-white'
                          }`}
                        >
                          {selected ? 'Added to Request' : 'Select This Service'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Booking Form */}
      {(bb?.sectionsEnabled?.bookingForm ?? true) && (
        <section
          id="booking-form"
          aria-labelledby="booking-form-heading"
          className="rounded-2xl border-2 border-[#0E1033] bg-white p-6 sm:p-8 shadow-[0_6px_0_#0E1033]"
        >
          <h2 id="booking-form-heading" className="font-display text-3xl font-bold text-[#0E1033]">
            Request a Free Quote
          </h2>
          <p className="mt-1 text-base text-[#0E1033]/80">
            Pick the services you want below and tell me a little about your goal.
          </p>

          {submittedMessage ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl border-2 border-[#1F4BFF] bg-[#F7F8FF] p-6"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-7 w-7 shrink-0 text-[#1F4BFF]" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#0E1033]">Request Sent!</h3>
                  <p className="mt-1 text-base font-medium text-[#0E1033]">{submittedMessage}</p>
                  <button
                    type="button"
                    onClick={() => setSubmittedMessage('')}
                    className="mt-4 rounded-xl border-2 border-[#0E1033] bg-white px-4 py-2 text-sm font-bold"
                  >
                    Send Another Request
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bb-name" className="block text-sm font-bold text-[#0E1033] mb-1">
                    Full name (required)
                  </label>
                  <input
                    id="bb-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'err-bb-name' : undefined}
                    className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                  />
                  {errors.fullName && (
                    <p id="err-bb-name" role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="bb-phone" className="block text-sm font-bold text-[#0E1033] mb-1">
                    Phone number (required)
                  </label>
                  <input
                    id="bb-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'err-bb-phone' : undefined}
                    className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                  />
                  {errors.phone && (
                    <p id="err-bb-phone" role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="bb-email" className="block text-sm font-bold text-[#0E1033] mb-1">
                    Email address (required)
                  </label>
                  <input
                    id="bb-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'err-bb-email' : undefined}
                    className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                  />
                  {errors.email && (
                    <p id="err-bb-email" role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="bb-time" className="block text-sm font-bold text-[#0E1033] mb-1">
                    Best time to contact you (required)
                  </label>
                  <select
                    id="bb-time"
                    value={bestTime}
                    onChange={(e) => setBestTime(e.target.value as typeof bestTime)}
                    className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                  >
                    <option value="Morning 8–12">Morning 8–12</option>
                    <option value="Afternoon 12–5">Afternoon 12–5</option>
                    <option value="Evening 5–8">Evening 5–8</option>
                  </select>
                </div>
              </div>

              {/* Service checkboxes */}
              <fieldset>
                <legend className="text-sm font-bold text-[#0E1033] mb-2">
                  Which service(s) do you want? (pick at least one)
                </legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((srv) => (
                    <label
                      key={srv.id}
                      className="flex items-start gap-2.5 rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-3 cursor-pointer hover:border-[#1F4BFF]"
                    >
                      <input
                        type="checkbox"
                        checked={serviceIds.includes(srv.id)}
                        onChange={() => toggleService(srv.id)}
                        className="mt-1 h-4 w-4 accent-[#1F4BFF]"
                      />
                      <span className="text-sm">
                        <span className="font-semibold text-[#0E1033] block">{srv.name}</span>
                        <span className="text-[#D1006F] font-medium">{srv.priceLabel}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.serviceIds && (
                  <p role="alert" className="mt-1.5 text-sm font-semibold text-[#D1006F]">
                    {errors.serviceIds}
                  </p>
                )}
              </fieldset>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bb-payopt" className="block text-sm font-bold text-[#0E1033] mb-1">
                    Payment option
                  </label>
                  <select
                    id="bb-payopt"
                    value={paymentOption}
                    onChange={(e) => setPaymentOption(e.target.value as typeof paymentOption)}
                    className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                  >
                    <option value="Pay As You Go">Pay As You Go</option>
                    <option value="Flat Rate">Flat Rate</option>
                    <option value="Payment Plan">Payment Plan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bb-budget" className="block text-sm font-bold text-[#0E1033] mb-1">
                    Budget range
                  </label>
                  <select
                    id="bb-budget"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value as typeof budgetRange)}
                    className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                  >
                    <option value="Under $100">Under $100</option>
                    <option value="$100–$300">$100–$300</option>
                    <option value="$300–$750">$300–$750</option>
                    <option value="$750+">$750+</option>
                  </select>
                </div>
              </div>

              {/* Community Rate */}
              <div className="rounded-xl border border-[#D8DDF5] bg-[#F7F8FF] p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-bold text-[#0E1033]">
                    Do you qualify for the Community Rate ({bb?.communityDiscountPercent ?? 20}% off for nonprofits, students, and current/former foster youth)?
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 text-sm font-semibold">
                      <input
                        type="radio"
                        name="communityRate"
                        checked={!communityRate}
                        onChange={() => setCommunityRate(false)}
                        className="accent-[#1F4BFF]"
                      />
                      No
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-sm font-semibold">
                      <input
                        type="radio"
                        name="communityRate"
                        checked={communityRate}
                        onChange={() => setCommunityRate(true)}
                        className="accent-[#1F4BFF]"
                      />
                      Yes
                    </label>
                  </div>
                </div>

                {communityRate && (
                  <div>
                    <label htmlFor="bb-cgroup" className="block text-sm font-bold text-[#0E1033] mb-1">
                      Which group applies? (Nonprofit, Student, or Foster Youth)
                    </label>
                    <input
                      id="bb-cgroup"
                      type="text"
                      value={communityGroup}
                      onChange={(e) => setCommunityGroup(e.target.value)}
                      placeholder="e.g., Student or 501(c)(3) Nonprofit"
                      className="w-full rounded-xl border-2 border-[#0E1033] bg-white px-3.5 py-2"
                    />
                    {errors.communityGroup && (
                      <p role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                        {errors.communityGroup}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="bb-message" className="block text-sm font-bold text-[#0E1033] mb-1">
                  Tell me what you need help with (required)
                </label>
                <textarea
                  id="bb-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a quick description of your project or question..."
                  aria-invalid={Boolean(errors.message)}
                  className="w-full rounded-xl border-2 border-[#0E1033] bg-[#F7F8FF] px-3.5 py-2.5"
                />
                {errors.message && (
                  <p role="alert" className="mt-1 text-sm font-semibold text-[#D1006F]">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Estimated Breakdown Preview */}
              {selectedServices.length > 0 && (
                <div className="rounded-xl border-2 border-[#1F4BFF] bg-[#F7F8FF] p-4 space-y-1.5">
                  <p className="font-display text-lg font-bold text-[#0E1033]">
                    Starting Estimate Breakdown
                  </p>
                  <p className="text-sm text-[#0E1033]/85 tabular-nums">
                    Starting subtotal: ${estimate.subtotal.toFixed(2)}
                  </p>
                  {estimate.discountAmount > 0 && (
                    <p className="text-sm font-semibold text-[#D1006F] tabular-nums">
                      Community discount ({estimate.discountPercent}%): -${estimate.discountAmount.toFixed(2)}
                    </p>
                  )}
                  <p className="text-base font-bold text-[#0E1033] tabular-nums">
                    Estimated starting total: ${estimate.estimatedTotal.toFixed(2)}
                  </p>
                  {estimate.paymentPlanInstallments && (
                    <p className="text-sm text-[#1F4BFF] font-medium tabular-nums">
                      Payment plan split: {estimate.paymentPlanInstallments.map((n) => `$${n.toFixed(2)}`).join(' / ')}
                    </p>
                  )}
                </div>
              )}

              <div aria-live="polite">
                {submitError && (
                  <p role="alert" className="text-sm font-bold text-[#D1006F]">
                    {submitError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl border-2 border-[#0E1033] bg-[#D1006F] px-7 py-3.5 font-display text-lg font-bold text-white shadow-[0_4px_0_#0E1033] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? 'Sending Your Request...' : 'Send My Request'}
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
