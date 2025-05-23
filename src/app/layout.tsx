'use client'

import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { ReactQueryProvider } from "./query-provider";
import Header from "@/components/Header";
import {  Provider} from "react-redux";
import AppWalletProvider from "@/components/AppWalletProvider";
import {  store } from "@/store";



const metadata = {
  title: 'Crowd funding',
  description: 'Crowd funding by Solana app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <ReactQueryProvider>
         
      <Provider store={store} >
        <AppWalletProvider>
          <Header />
          <main className='max-w-6xl mx-auto min-h-screen bg-white'>
            <div className='h-24'/>
            {children}
            <div className='h-24'/>
          </main>
          <ToastContainer 
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='dark'
          />
        </AppWalletProvider>
      </Provider>

        </ReactQueryProvider> 
       <div>
        {children}
       </div>
      </body>
    </html>
  )
}
