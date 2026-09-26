import { useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { TimeProvider } from '@/app/store/TimeStore';
import { Toaster } from 'sonner';
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { AutoPunch } from "./components/AutoPunch";
import { Login } from "./components/Login";

function App() {
  const router = useMemo(() => createBrowserRouter([
    {
      path: "/login",
      Component: Login,
    },
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: Dashboard },
        { path: "auto-punch", Component: AutoPunch },
        { path: "auto-punch/:key", Component: AutoPunch },
      ],
    },
  ]), []);

  return (
    <TimeProvider>
      <Toaster theme="dark" position="top-center" richColors />
      <RouterProvider router={router} />
    </TimeProvider>
  );
}

export default App;
