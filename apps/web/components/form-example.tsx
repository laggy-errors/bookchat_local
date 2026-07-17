'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Define the validation schema using Zod
export const feedbackFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  comments: z.string().min(10, 'Comments must be at least 10 characters long'),
});

// 2. Derive the TypeScript type from the Zod schema
export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FormExampleProps {
  onSubmitSuccess?: (values: FeedbackFormValues) => void;
}

/**
 * An architectural reference component demonstrating the React Hook Form + Zod validation pattern.
 * This pattern satisfies section-level form validation specifications.
 */
export function FormExample({ onSubmitSuccess }: FormExampleProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: '',
      email: '',
      rating: 5,
      comments: '',
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSubmitSuccess?.(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md p-6 border-double border-4 border-accent-gold/40 rounded-xl bg-paper-surface shadow-book relative overflow-hidden">
      {/* Soft overlay representing aged paper watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,128,33,0.02)_0%,transparent_80%)] pointer-events-none" />
      
      {/* Decorative Header */}
      <div className="text-center select-none space-y-1">
        <div className="flex items-center justify-center gap-1 text-[9px] font-serif text-accent-gold tracking-widest font-bold uppercase">
          ⚜ ❦ Circulating Guest Registry ❦ ⚜
        </div>
        <h3 className="text-lg font-playfair font-black text-ink-primary tracking-tight">The Scribe Presence Inscription</h3>
        <p className="text-[10px] text-ink-muted font-serif italic max-w-xs mx-auto">
          Inscribe your credentials to log your presence in this master archival ledger.
        </p>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-paper-border/60 to-transparent my-1" />
      
      {/* Name Input */}
      <div className="relative">
        <label className="block text-[9px] uppercase font-bold tracking-widest text-ink-muted mb-0.5">Scribe Signature Name</label>
        <input
          {...register('name')}
          type="text"
          placeholder="e.g. Scribe Arthur"
          className="w-full px-1 py-1 border-b border-paper-border/80 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-accent-red transition-all font-serif italic text-sm text-ink-primary placeholder:text-ink-muted/30"
        />
        {errors.name && (
          <p className="text-[10px] text-accent-red font-serif italic mt-1">✦ {errors.name.message}</p>
        )}
      </div>

      {/* Email Input */}
      <div className="relative">
        <label className="block text-[9px] uppercase font-bold tracking-widest text-ink-muted mb-0.5">Inscribed Dispatch Email</label>
        <input
          {...register('email')}
          type="email"
          placeholder="scribe@circulating.org"
          className="w-full px-1 py-1 border-b border-paper-border/80 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-accent-red transition-all font-serif text-sm text-ink-primary placeholder:text-ink-muted/30"
        />
        {errors.email && (
          <p className="text-[10px] text-accent-red font-serif italic mt-1">✦ {errors.email.message}</p>
        )}
      </div>

      {/* Rating Selection */}
      <div className="relative">
        <label className="block text-[9px] uppercase font-bold tracking-widest text-ink-muted mb-0.5">Archival Appraisal Rating</label>
        <select
          {...register('rating', { valueAsNumber: true })}
          className="w-full px-1 py-1 border-b border-paper-border/80 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent focus:outline-none focus:ring-0 focus:border-accent-red transition-all font-serif text-sm text-ink-primary cursor-pointer"
        >
          <option className="bg-paper-surface text-ink-primary" value="5">V - Pristine Masterpiece</option>
          <option className="bg-paper-surface text-ink-primary" value="4">IV - High Quality Folio</option>
          <option className="bg-paper-surface text-ink-primary" value="3">III - Standard Archive</option>
          <option className="bg-paper-surface text-ink-primary" value="2">II - Room for Amendment</option>
          <option className="bg-paper-surface text-ink-primary" value="1">I - Deficient Binding</option>
        </select>
        {errors.rating && (
          <p className="text-[10px] text-accent-red font-serif italic mt-1">✦ {errors.rating.message}</p>
        )}
      </div>

      {/* Comments Area */}
      <div className="relative">
        <label className="block text-[9px] uppercase font-bold tracking-widest text-ink-muted mb-0.5">Marginal Reader Comments</label>
        <textarea
          {...register('comments')}
          rows={3}
          placeholder="Pen down your archival notes or initial queries..."
          className="w-full px-1.5 py-1.5 border border-paper-border/50 rounded-md bg-paper-surface-dim/40 focus:outline-none focus:border-accent-red transition-all font-serif text-xs text-ink-primary placeholder:text-ink-muted/30"
        />
        {errors.comments && (
          <p className="text-[10px] text-accent-red font-serif italic mt-1">✦ {errors.comments.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#9e1b32] text-paper-surface font-semibold py-2 rounded shadow-md hover:bg-[#b2223a] transition-all border border-[#fbf9f4]/15 flex items-center justify-center gap-1.5 cursor-pointer uppercase text-[10px] tracking-wider focus:ring-2 focus:ring-accent-gold focus:outline-none"
      >
        <span>{isSubmitting ? 'Inscribing Ledger...' : 'Sign Ledger Signature 🖋'}</span>
      </button>
    </form>
  );
}
