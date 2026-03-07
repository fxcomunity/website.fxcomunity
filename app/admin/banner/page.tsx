import { redirect } from 'next/navigation'

export default function AdminBannerRedirectPage() {
  redirect('/admin/banners-manage')
}
