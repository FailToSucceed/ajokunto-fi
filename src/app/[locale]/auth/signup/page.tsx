import { useTranslations } from 'next-intl'
import AuthForm from '@/components/auth/AuthForm'

export default function SignUpPage() {
  const t = useTranslations()

  return (
    <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm mode="signup" />
    </div>
  )
}