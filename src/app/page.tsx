import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en'); // or detect user language
}
