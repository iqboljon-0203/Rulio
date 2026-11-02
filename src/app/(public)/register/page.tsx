import { redirect } from 'next/navigation';

// Registration happens automatically on the first Telegram login.
export default function RegisterPage() {
  redirect('/login');
}
