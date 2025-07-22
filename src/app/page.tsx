import AdminLayout from '@/components/AdminLayout';
import CountriesList from '@/components/CountriesList';

export default function Home() {
  return (
    <AdminLayout>
      <CountriesList />
    </AdminLayout>
  );
}
