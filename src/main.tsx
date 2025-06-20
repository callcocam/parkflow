import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Root } from './pages/Root.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Volunteers } from './pages/Volunteers.tsx'
import { Shifts } from './pages/Shifts.tsx'
import { Allocation } from './pages/Allocation.tsx'
import { Captains } from "./pages/Captains.tsx";
import { Reports } from "./pages/Reports.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/volunteers",
        element: <Volunteers />,
      },
      {
        path: "/shifts",
        element: <Shifts />,
      },
      {
        path: "/allocation",
        element: <Allocation />,
      },
      {
        path: "/captains",
        element: <Captains />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
