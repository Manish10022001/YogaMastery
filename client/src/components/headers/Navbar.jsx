import React from 'react'
import { NavLink } from 'react-router-dom'
//1.1: give nav links
const navLinks = [
    {name:"Home", route:"/"},
    {name:"Instructor", route:"/instructors"},
    {name:"Classes", route:"/classes"}
]
const Navbar = () => {
  return (
    <nav>
        <div className='lg:w-[95%] mx-auto sm:px-6 lg:px-6'>
            {/* logo */}
            <div className='px-4 py-4 flex items-center justify-center'>
                <h1 className='text-2xl inline-flex items-center font-bold gap-3'>
                    YogaMastery 
                    <img  src='/yoga-svgrepo-com.svg' alt='logo' className='w-9 h-9'/>
                </h1>

                {/* mobile menu icons */}

            {/* Navigation Links */}
            <div className='hidden md:block text-black dark:text-white'>
                <div className='flex'>
                    <ul className='ml-10 flex items-center space-x-4 pr-4'>
                        {
                            navLinks.map((link)=>(
                                <li key={link.route}>
                                    <NavLink 
                                        to={link.route} 
                                        className={({ isActive, isPending }) =>
                                            isActive
                                                ? "active"
                                                : isPending
                                                ? "pending"
                                                : ""
                                        }
                                    >
                                    {link.name}</NavLink>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
            </div>
            
        </div>
    </nav>
  )
}

export default Navbar
