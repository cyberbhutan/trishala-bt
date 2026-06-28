'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Job, JobCategory } from '@/lib/types'

export async function postJob(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const title = formData.get('title') as string
  const companyName = formData.get('company_name') as string
  const description = formData.get('description') as string
  const requirements = formData.get('requirements') as string
  const responsibilities = formData.get('responsibilities') as string
  const categoryId = formData.get('category_id') ? Number(formData.get('category_id')) : null
  const employmentType = formData.get('employment_type') as Job['employment_type']
  const workType = formData.get('work_type') as Job['work_type']
  const location = formData.get('location') as string
  const city = formData.get('city') as string
  const salaryMin = formData.get('salary_min') ? Number(formData.get('salary_min')) : null
  const salaryMax = formData.get('salary_max') ? Number(formData.get('salary_max')) : null
  const salaryCurrency = (formData.get('salary_currency') as string) || 'BTN'
  const salaryPeriod = (formData.get('salary_period') as Job['salary_period']) || 'monthly'
  const applicationEmail = formData.get('application_email') as string
  const applicationUrl = formData.get('application_url') as string
  const applicationDeadline = formData.get('application_deadline') as string

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) + '-' + Date.now()

  await supabase.from('jobs').insert({
    employer_id: user.id,
    title,
    slug,
    company_name: companyName,
    description,
    requirements,
    responsibilities,
    category_id: categoryId,
    employment_type: employmentType,
    work_type: workType,
    location,
    city,
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: salaryCurrency,
    salary_period: salaryPeriod,
    application_email: applicationEmail,
    application_url: applicationUrl,
    application_deadline: applicationDeadline || null,
    status: 'active',
  })

  revalidatePath('/jobs')
  redirect('/jobs')
}

export async function getJobs(options?: {
  category?: string
  type?: string
  city?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{ jobs: Job[]; total: number; page: number; totalPages: number }> {
  const supabase = await createServerSupabase()
  const page = options?.page || 1
  const limit = options?.limit || 12
  const offset = (page - 1) * limit

  let query = supabase
    .from('jobs')
    .select('*, categories:job_categories(*)', { count: 'exact' })

  // Default filter: only active jobs for public browsing
  query = query.eq('status', 'active')

  if (options?.category) {
    const { data: cat } = await supabase
      .from('job_categories')
      .select('id')
      .eq('slug', options.category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (options?.type) {
    query = query.eq('employment_type', options.type)
  }

  if (options?.city) {
    query = query.eq('city', options.city)
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,description.ilike.%${options.search}%,company_name.ilike.%${options.search}%`
    )
  }

  query = query
    .order('is_featured', { ascending: false })
    .order('is_urgent', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, count } = await query

  return {
    jobs: (data || []) as unknown as Job[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getJob(id: number): Promise<Job | null> {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('jobs')
    .select('*, categories:job_categories(*)')
    .eq('id', id)
    .single()

  if (!data) return null

  // Increment view count asynchronously (fire-and-forget)
  supabase
    .from('jobs')
    .update({ views_count: (data as any).views_count + 1 })
    .eq('id', id)
    .then()

  return data as unknown as Job
}

export async function getJobCategories(): Promise<JobCategory[]> {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('job_categories')
    .select('*')
    .order('name')

  return (data || []) as JobCategory[]
}

export async function applyForJob(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const jobId = Number(formData.get('job_id'))
  const applicantName = formData.get('applicant_name') as string
  const applicantEmail = formData.get('applicant_email') as string
  const applicantPhone = formData.get('applicant_phone') as string
  const coverLetter = formData.get('cover_letter') as string
  const resumeUrl = formData.get('resume_url') as string

  if (!applicantName || !applicantEmail) return

  await supabase.from('job_applications').insert({
    job_id: jobId,
    applicant_id: user.id,
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    applicant_phone: applicantPhone || null,
    cover_letter: coverLetter || null,
    resume_url: resumeUrl || null,
    status: 'submitted',
  })

  // Increment application count
  await supabase.rpc('increment_job_applications', { id: jobId })

  revalidatePath(`/jobs/${jobId}`)
  revalidatePath('/jobs')
}

export async function getUserJobListings(): Promise<Job[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('jobs')
    .select('*, categories:job_categories(*)')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false })

  return (data || []) as unknown as Job[]
}
