'use client';

import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Loading from '@/app/components/Loading';
import HeaderUser from '@/app/components/Users/HeaderUser';
import LoanCalculator from '../components/Users/LoanCalculator';
import Userdata from '@/app//components/Users/Userdata';

export default function RequestCredit() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }



  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;


  if (isAdmin) {
    
    redirect('/admin');
    return null; 
  }

  return (
    <div>
    <HeaderUser />
    <LoanCalculator />
    

    
  </div>

    
  );
}

RequestCredit.requireAuth = true;
