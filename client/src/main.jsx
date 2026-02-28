import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Aos from 'aos';
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import router from './routes/router.jsx'
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <RouterProvider router={router} />,
  // </StrictMode>,
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router}/>
  </QueryClientProvider>
)
