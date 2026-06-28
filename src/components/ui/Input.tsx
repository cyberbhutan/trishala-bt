'use client'

import { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Local classes
   ═══════════════════════════════════════════════════════════════════ */

const baseInputClasses = [
  'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-navy',
  'placeholder:text-gray-400',
  'transition-all duration-200',
  'border-gray-200',
  'hover:border-gray-300',
  'focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15 focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  'file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700',
  'file:cursor-pointer file:transition-colors hover:file:bg-brand-700/20',
].join(' ')

const errorInputClasses = [
  'border-red-400',
  'hover:border-red-500',
  'focus:border-red-500 focus:ring-2 focus:ring-red-500/15',
].join(' ')

const labelClasses = 'block text-sm font-medium text-navy mb-1.5'

/* ═══════════════════════════════════════════════════════════════════
   Input
   ═══════════════════════════════════════════════════════════════════ */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const autoId = useId()
    const inputId = id ?? autoId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && errorInputClasses,
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

/* ═══════════════════════════════════════════════════════════════════
   Textarea
   ═══════════════════════════════════════════════════════════════════ */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, rows = 4, ...props }, ref) => {
    const autoId = useId()
    const textareaId = id ?? autoId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className={labelClasses}>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(baseInputClasses, 'resize-y min-h-[80px]', error && errorInputClasses, className)}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />

        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Input, Textarea }
