import { logout } from '@/actions/auth'

export default async function LogoutPage() {
  // Execute the server action securely on load
  await logout()
  return null
}