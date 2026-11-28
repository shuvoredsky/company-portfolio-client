'use client';

import { useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { checkApplication } from '@/lib/api/applications';
import {
  ApiError,
  type ApplicationCheckResult,
  type ApplicationStatus,
} from '@/lib/api/types';
import { formatDate } from '@/lib/i18n/format';
import { useDictionary, useLang } from '@/lib/i18n/LanguageContext';

const SERIAL_REGEX = /^[A-Z0-9][A-Z0-9-]{4,29}$/;

function StatusBadge({
  status,
  label,
}: {
  status: ApplicationStatus;
  label: string;
}) {
  if (status === 'approved') {
    return (
      <Badge variant="success" className="px-3.5 py-1 text-sm font-semibold">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge variant="destructive" className="px-3.5 py-1 text-sm font-semibold">
        <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </Badge>
    );
  }
  return (
    <Badge variant="warning" className="px-3.5 py-1 text-sm font-semibold">
      <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  );
}

export function ApplicationStatusForm() {
  const lang = useLang();
  const dict = useDictionary();
  const t = dict.applicationStatus;

  const [result, setResult] = useState<ApplicationCheckResult | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        serialNumber: z
          .string()
          .trim()
          .transform((val) => val.toUpperCase())
          .refine((val) => SERIAL_REGEX.test(val), {
            message: t.errors.invalidSerial,
          }),
      }),
    [t.errors.invalidSerial],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    shouldFocusError: true,
    defaultValues: {
      serialNumber: '',
    },
  });

  const serialRegister = register('serialNumber');

  const mutation = useMutation({
    mutationFn: (serialNumber: string) => checkApplication(serialNumber),
    retry: false,
    onSuccess: (response) => {
      setInlineError(null);
      setResult(response.data);
    },
    onError: (err: unknown) => {
      setResult(null);
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setInlineError(t.errors.notFound);
          inputRef.current?.focus();
          return;
        }
        if (err.status === 400) {
          setInlineError(null);
          setError('serialNumber', {
            type: 'server',
            message: t.errors.invalidSerial,
          });
          inputRef.current?.focus();
          return;
        }
        if (err.status === 429) {
          setInlineError(t.errors.rateLimit);
          inputRef.current?.focus();
          return;
        }
        if (err.status === 0) {
          setInlineError(t.errors.network);
          inputRef.current?.focus();
          return;
        }
      }
      setInlineError(t.errors.generic);
      inputRef.current?.focus();
    },
  });

  const onSubmit = (values: FormValues) => {
    if (mutation.isPending) return;
    setInlineError(null);
    mutation.mutate(values.serialNumber);
  };

  const handleCloseModal = () => {
    setResult(null);
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleCheckAnother = () => {
    setResult(null);
    setInlineError(null);
    reset({ serialNumber: '' });
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const activeStatusCopy = result ? t.statuses[result.status] : null;
  const hasNote = Boolean(result?.note && result.note.trim().length > 0);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="application-serial-input" required>
            {t.serialLabel}
          </Label>
          <Input
            id="application-serial-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={t.serialPlaceholder}
            maxLength={30}
            hasError={Boolean(errors.serialNumber)}
            aria-describedby={
              errors.serialNumber
                ? 'application-serial-error'
                : 'application-serial-hint'
            }
            className="font-mono uppercase"
            {...serialRegister}
            ref={(el) => {
              serialRegister.ref(el);
              inputRef.current = el;
            }}
          />
          <p
            id="application-serial-hint"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            {t.serialHint}
          </p>
          {errors.serialNumber ? (
            <p
              id="application-serial-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.serialNumber.message}
            </p>
          ) : null}
        </div>

        <div aria-live="polite">
          {inlineError ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p className="min-w-0 break-words">{inlineError}</p>
            </div>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {!mutation.isPending ? (
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : null}
          <span>{mutation.isPending ? t.checking : t.submit}</span>
        </Button>
      </form>

      <Modal
        open={Boolean(result)}
        onClose={handleCloseModal}
        title={t.modalTitle}
        closeLabel={dict.common.close}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCheckAnother}
            >
              {t.checkAnother}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCloseModal}
            >
              {dict.common.close}
            </Button>
          </>
        }
      >
        {result && activeStatusCopy ? (
          <div className="space-y-5">
            {/* Status header */}
            <div className="space-y-2.5 rounded-xl border border-border bg-secondary/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {t.statusLabel}
                </span>
                <StatusBadge
                  status={result.status}
                  label={activeStatusCopy.label}
                />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {activeStatusCopy.explanation}
              </p>
            </div>

            {/* Metadata grid */}
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-3.5">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t.serialDisplayLabel}
                </dt>
                <dd className="mt-1 break-all font-mono text-sm font-semibold text-foreground">
                  {result.serialNumber}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t.applicantLabel}
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold text-foreground">
                  {result.maskedName}
                </dd>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">
                  {t.lastUpdatedLabel}
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  <time dateTime={result.updatedAt}>
                    {formatDate(result.updatedAt, lang)}
                  </time>
                </dd>
              </div>
            </dl>

            {/* Next steps (shown only when admin note exists) */}
            {hasNote ? (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-secondary/40 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {t.nextStepsTitle}
                </h3>
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-foreground">
                  {result.note}
                </p>
              </div>
            ) : null}

            {/* Privacy line */}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t.privacyNotice}</span>
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

