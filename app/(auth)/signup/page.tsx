import { redirect } from "next/navigation";

// Public kayıt kapalı — ekip hesapları Supabase'den admin tarafından oluşturulur.
// Eski /signup linkleri girişe yönlensin.
export default function SignupPage() {
  redirect("/login");
}
