import React from 'react'
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Home from '../pages/Home';
const router = createBrowserRouter([
  {
    //site will have 2 root layout, without login and with login
    path: "/",
    element: <MainLayout />,
    children:[
        {
            path:"/",
            element:<Home />
        }
    ]
  },
]);

export default router
