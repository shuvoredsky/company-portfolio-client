'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import countries from 'i18n-iso-countries';
import enCountries from 'i18n-iso-countries/langs/en.json';
import itCountries from 'i18n-iso-countries/langs/it.json';
import { AlertCircle, Briefcase, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { submitContact } from '@/lib/api/contacts';
import { ApiError, type ContactPayload } from '@/lib/api/types';
import { interpolate } from '@/lib/i18n/format';
import { useDictionary, useLang } from '@/lib/i18n/LanguageContext';

countries.registerLocale(enCountries);
countries.registerLocale(itCountries);

const PHONE_REGEX = /^[0-9+\-\s()]+$/;
const MAX_MESSAGE_LENGTH = 2000;
const FIELD_NAMES = ['name', 'country', 'phone', 'email', 'message'] as const;
type ContactFieldName = (typeof FIELD_NAMES)[number];

interface CountryOption {
  code: string;
  displayName: string;
  englishName: string;
}

function sanitizePosition(raw: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

export function ContactForm() {
  const lang = useLang();
  const dict = useDictionary();
  const formDict = dict.contact.form;
  const valDict = formDict.validation;
  const searchParams = useSearchParams();

  const positionTitle = useMemo(
    () => sanitizePosition(searchParams.get('position')),
    [searchParams],
  );

  const countryOptions = useMemo<CountryOption[]>(() => {
    const englishMap = countries.getNames('en', { select: 'official' });
    const localizedMap = countries.getNames(lang, { select: 'official' });
    const collator = new Intl.Collator(lang, { sensitivity: 'base' });

    return Object.entries(englishMap)
      .map(([code, englishName]) => ({
        code,
        englishName,
        displayName: localizedMap[code] ?? englishName,
      }))
      .sort((a, b) => collator.compare(a.displayName, b.displayName));
  }, [lang]);

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(2, valDict.nameMin)
          .max(100, valDict.nameMax),
        country: z.string().trim().min(1, valDict.countryRequired),
        phone: z
          .string()
          .trim()
          .min(6, valDict.phoneInvalid)
          .max(20, valDict.phoneInvalid)
          .regex(PHONE_REGEX, valDict.phonePattern),
        email: z.string().trim().email(valDict.emailInvalid),
        message: z
          .string()
          .trim()
          .min(10, valDict.messageMin)
          .max(MAX_MESSAGE_LENGTH, valDict.messageMax),
        website: z.string().optional(),
      }),
    [valDict],
  );

  type ContactFormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    shouldFocusError: true,
    defaultValues: {
      name: '',
      country: '',
      phone: '',
      email: '',
      message: '',
      website: '',
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const hasPrefilledRef = useRef(false);
  const successRef = useRef<HTMLDivElement | null>(null);

  // Prefill message once from ?position= without overwriting user input
  useEffect(() => {
    if (!positionTitle || hasPrefilledRef.current) return;
    if (getValues('message').trim().length > 0) {
      hasPrefilledRef.current = true;
      return;
    }
    const prefill = interpolate(dict.contact.prefillMessage, {
      title: positionTitle,
    });
    setValue('message', prefill, { shouldDirty: false, shouldValidate: false });
    hasPrefilledRef.current = true;
  }, [dict.contact.prefillMessage, getValues, positionTitle, setValue]);

  // Move focus to the thank-you panel when submission succeeds
  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  const messageValue = useWatch({ control, name: 'message' }) ?? '';

  const mutation = useMutation({
    mutationFn: (payload: ContactPayload) => submitContact(payload),
    onSuccess: () => {
      setFormError(null);
      reset({
        name: '',
        country: '',
        phone: '',
        email: '',
        message: '',
        website: '',
      });
      setSubmitted(true);
      toast.success(formDict.successMessage);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setFormError(formDict.rateLimitError);
          toast.error(formDict.rateLimitError);
          return;
        }
        if (err.status === 0) {
          setFormError(formDict.networkError);
          toast.error(formDict.networkError);
          return;
        }
        if (err.status === 400 && err.errorSources.length > 0) {
          let mappedField = false;
          for (const source of err.errorSources) {
            const pathKey = String(source.path) as ContactFieldName;
            if (FIELD_NAMES.includes(pathKey)) {
              setError(pathKey, { type: 'server', message: source.message });
              mappedField = true;
            }
          }
          if (mappedField) {
            setFormError(null);
            return;
          }
        }
      }
      setFormError(formDict.genericError);
      toast.error(formDict.genericError);
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    if (mutation.isPending) return;
    setFormError(null);
    mutation.mutate({
      name: values.name,
      country: values.country,
      phone: values.phone,
      email: values.email,
      message: values.message,
      website: values.website ?? '',
    });
  };

  if (submitted) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center gap-4 py-8 text-center focus:outline-none"
      >
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-card-foreground">
            {formDict.thankYouTitle}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {formDict.successMessage}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => {
            setSubmitted(false);
            setFormError(null);
          }}
        >
          {formDict.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {positionTitle ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/25 bg-secondary/70 px-4 py-3 text-sm text-secondary-foreground">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="min-w-0 break-words font-medium">
            {interpolate(dict.contact.applyingFor, { title: positionTitle })}
          </p>
        </div>
      ) : null}

      {formError ? (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{formError}</p>
        </div>
      ) : null}

      {/* Hidden honeypot field (never visible or focusable to real users) */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name" required>
            {formDict.nameLabel}
          </Label>
          <Input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder={formDict.namePlaceholder}
            hasError={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            {...register('name')}
          />
          {errors.name ? (
            <p
              id="contact-name-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-country" required>
            {formDict.countryLabel}
          </Label>
          <Select
            id="contact-country"
            autoComplete="country-name"
            hasError={Boolean(errors.country)}
            aria-describedby={errors.country ? 'contact-country-error' : undefined}
            {...register('country')}
          >
            <option value="">{formDict.countryPlaceholder}</option>
            {countryOptions.map((option) => (
              <option key={option.code} value={option.englishName}>
                {option.displayName}
              </option>
            ))}
          </Select>
          {errors.country ? (
            <p
              id="contact-country-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.country.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-phone" required>
            {formDict.phoneLabel}
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={formDict.phonePlaceholder}
            hasError={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
            {...register('phone')}
          />
          {errors.phone ? (
            <p
              id="contact-phone-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email" required>
            {formDict.emailLabel}
          </Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder={formDict.emailPlaceholder}
            hasError={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <p
              id="contact-email-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="contact-message" required>
            {formDict.messageLabel}
          </Label>
          <span
            aria-live="off"
            className="text-xs tabular-nums text-muted-foreground"
          >
            {interpolate(formDict.messageCounter, {
              count: String(messageValue.length),
              max: String(MAX_MESSAGE_LENGTH),
            })}
          </span>
        </div>
        <Textarea
          id="contact-message"
          rows={5}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={formDict.messagePlaceholder}
          hasError={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          {...register('message')}
        />
        {errors.message ? (
          <p
            id="contact-message-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {!mutation.isPending ? (
            <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : null}
          <span>
            {mutation.isPending ? formDict.submitting : formDict.submit}
          </span>
        </Button>
      </div>
    </form>
  );
}

