import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { postJob } from '@/lib/actions/jobs'
import { BHUTAN_CITIES } from '@/lib/utils'
import type { JobCategory } from '@/lib/types'
import {
  Building2,
  Briefcase,
  MapPin,
  Banknote,
  Calendar,
  Mail,
  Globe,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react'

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
] as const

const WORK_TYPES = [
  { value: 'on-site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

const SALARY_PERIODS = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'yearly', label: 'Per Year' },
] as const

const CURRENCIES = [
  { value: 'BTN', label: 'Nu. (Bhutanese Ngultrum)' },
  { value: 'INR', label: '₹ (Indian Rupee)' },
  { value: 'USD', label: '$ (US Dollar)' },
] as const

export default async function NewJobPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: categories } = await supabase
    .from('job_categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Top bar */}
      <div className="border-b border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Jobs
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Post a Job</h1>
          <p className="mt-1 text-sm text-white/50">
            Reach top talent across Bhutan. Fill in the details below to publish your job listing.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-8 backdrop-blur-sm">
          <form action={postJob} className="space-y-8">
            {/* ─── Basic Info ─── */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Building2 className="h-4 w-4 text-[#FF8A00]" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-white/70">
                      Job Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      required
                      className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                      placeholder="e.g. Senior Chef"
                    />
                  </div>
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-white/70">
                      Company Name *
                    </label>
                    <input
                      id="company_name"
                      name="company_name"
                      required
                      className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                      placeholder="e.g. Mountain Cafe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white/70">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                  />
                </div>
              </div>
            </div>

            {/* ─── Category & Type ─── */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Briefcase className="h-4 w-4 text-[#FF8A00]" />
                Category &amp; Employment Details
              </h2>
              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-white/70">
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                  >
                    <option value="">Select a category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Employment Type */}
                  <div>
                    <label htmlFor="employment_type" className="block text-sm font-medium text-white/70">
                      Employment Type *
                    </label>
                    <select
                      id="employment_type"
                      name="employment_type"
                      required
                      className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    >
                      <option value="">Select type</option>
                      {EMPLOYMENT_TYPES.map((et) => (
                        <option key={et.value} value={et.value}>
                          {et.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Work Type */}
                  <div>
                    <label htmlFor="work_type" className="block text-sm font-medium text-white/70">
                      Work Type *
                    </label>
                    <select
                      id="work_type"
                      name="work_type"
                      required
                      className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    >
                      <option value="">Select work type</option>
                      {WORK_TYPES.map((wt) => (
                        <option key={wt.value} value={wt.value}>
                          {wt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Requirements & Responsibilities */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-white/70">
                      Requirements
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      rows={4}
                      className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                      placeholder="One requirement per line&#10;e.g.&#10;3+ years of experience&#10;Degree in relevant field&#10;Excellent communication skills"
                    />
                  </div>
                  <div>
                    <label htmlFor="responsibilities" className="block text-sm font-medium text-white/70">
                      Responsibilities
                    </label>
                    <textarea
                      id="responsibilities"
                      name="responsibilities"
                      rows={4}
                      className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                      placeholder="One responsibility per line&#10;e.g.&#10;Manage daily operations&#10;Train new staff&#10;Prepare reports"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Salary ─── */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Banknote className="h-4 w-4 text-[#FF8A00]" />
                Salary &amp; Compensation
              </h2>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label htmlFor="salary_min" className="block text-sm font-medium text-white/70">
                    Min Salary
                  </label>
                  <input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    min={0}
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="salary_max" className="block text-sm font-medium text-white/70">
                    Max Salary
                  </label>
                  <input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    min={0}
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="salary_currency" className="block text-sm font-medium text-white/70">
                    Currency
                  </label>
                  <select
                    id="salary_currency"
                    name="salary_currency"
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="salary_period" className="block text-sm font-medium text-white/70">
                    Period
                  </label>
                  <select
                    id="salary_period"
                    name="salary_period"
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                  >
                    {SALARY_PERIODS.map((sp) => (
                      <option key={sp.value} value={sp.value}>
                        {sp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ─── Location ─── */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <MapPin className="h-4 w-4 text-[#FF8A00]" />
                Location
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-white/70">
                    City *
                  </label>
                  <select
                    id="city"
                    name="city"
                    required
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                  >
                    <option value="">Select city</option>
                    {BHUTAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-white/70">
                    Full Address / Area
                  </label>
                  <input
                    id="location"
                    name="location"
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    placeholder="e.g. Norzin Lam, Thimphu"
                  />
                </div>
              </div>
            </div>

            {/* ─── Application ─── */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Mail className="h-4 w-4 text-[#FF8A00]" />
                How to Apply
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="application_email" className="block text-sm font-medium text-white/70">
                    Application Email
                  </label>
                  <input
                    id="application_email"
                    name="application_email"
                    type="email"
                    className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                    placeholder="hr@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="application_url" className="block text-sm font-medium text-white/70">
                    External Application URL
                  </label>
                  <div className="relative mt-1">
                    <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <input
                      id="application_url"
                      name="application_url"
                      type="url"
                      className="block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                      placeholder="https://company.careers.com/apply"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-white/30">
                Leave both blank if you want applicants to apply directly through the form on your listing.
              </p>
            </div>

            {/* ─── Deadline ─── */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Calendar className="h-4 w-4 text-[#FF8A00]" />
                Application Deadline
              </h2>
              <div className="max-w-xs">
                <input
                  id="application_deadline"
                  name="application_deadline"
                  type="date"
                  className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                />
              </div>
            </div>

            {/* ─── Submit ─── */}
            <div className="border-t border-white/[0.04] pt-6">
              <div className="flex items-start gap-3 rounded-xl border border-[#FF8A00]/10 bg-[#FF8A00]/[0.03] p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8A00]" />
                <p className="text-xs text-white/40">
                  Your job listing will be published immediately and visible to all job seekers. 
                  You can manage your listings from your dashboard.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF8A00] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-all hover:bg-[#E67A00]"
                >
                  <Building2 className="h-4 w-4" /> Publish Job
                </button>
                <Link
                  href="/jobs"
                  className="text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
