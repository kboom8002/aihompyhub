import { redirect } from 'next/navigation';

export default function TenantGateway() {
   // Redirect to default tenant (Dr.O Skincare) MVP
   redirect('/tenant/00000000-0000-0000-0000-000000000001/home');
}
