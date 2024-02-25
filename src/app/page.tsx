'use client'

import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import Loading from './components/Loading';
import HeaderUser from './components/Users/HeaderUser';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Userdata from './components/Users/Userdata';

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [refreshHeader, setRefreshHeader] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      
      setRefreshHeader(prevRefresh => !prevRefresh);
    }, 15000); 

    
    return () => clearInterval(intervalId);
  }, []);

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
      <Head>
        <title>EasyCredit</title>
      </Head>
      <HeaderUser key={refreshHeader ? 'refreshed' : 'not-refreshed'} />
      <Userdata/>
    </div>
  );
}

Home.requireAuth = true;
