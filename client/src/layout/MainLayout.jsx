import React from 'react'
import { Outlet } from 'react-router'

const MainLayout = () => {
  return (
    <main className='dark:bg-black overflow-hidden'>
        <nav>Navbar</nav>
        {/* need to give outlet so get the children routes / path */}
        <Outlet />
        <footer>Footer</footer>
    </main>
  )
}

export default MainLayout
