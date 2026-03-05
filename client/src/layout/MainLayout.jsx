import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/headers/Navbar'

const MainLayout = () => {
  return (
    <main className='dark:bg-white overflow-hidden'>
        <Navbar />
        {/* need to give outlet so get the children routes / path */}
        <Outlet />
        <footer>Footer</footer>
    </main>
  )
}

export default MainLayout
