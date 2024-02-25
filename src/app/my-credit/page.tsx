'use client';

import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Loading from '@/app/components/Loading';
import HeaderUser from '@/app/components/Users/HeaderUser';
import UserLoanList from '../components/Users/UserLoanList';
import CurrentLoanInfo from '../components/Users/CurrentLoanInfo';
import Layout from './layout';

export default function MyCredit() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

 
  // Verifica si el usuario es administrador
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;


  if (isAdmin) {
    
    redirect('/admin');
        return null;
    }

    return (
      <Layout>
        <HeaderUser />
        <div className="container mx-auto mt-5 flex flex-col md:flex-row">
          <div className="mb-4 md:mr-4 md:mb-0 w-full md:w-7/12 lg:w-7/12"> 
            <CurrentLoanInfo />
          </div>
          <div className="w-full md:w-5/12 lg:w-5/12"> 
            <UserLoanList />
          </div>
        </div>
      </Layout>
    );
  };
  
  MyCredit.requireAuth = true;