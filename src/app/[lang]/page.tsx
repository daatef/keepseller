import { auth } from '@/auth'
import IndexWebsiteClient from './(web)/index'

export default async function IndexPage() {
  const session = await auth()
  return <IndexWebsiteClient session={session} />
}