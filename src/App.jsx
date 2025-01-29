import { Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";  
import Dashboard from "@/pages/Dashboard/dashboard";  
import Tasks from "@/pages/Tasks/tasks";  
import Posts from "@/pages/Posts/posts";  
import Contact from "@/pages/Contact/contact";  
import Login from "@/pages/Login/login";  
import SignUp from "@/pages/Signup/signup";  
import Settings from "@/pages/Settings/settings";  
import AuthRoute from "@/routes/AuthRoute";  
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Archive from "@/pages/Archive/archive.jsx"; 
import Test from "@/pages/test/test";  
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <Routes>
          {/* Redirect root path to /login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/test" element={<Test />} />
          <Route
            path="/dashboard"
            element={<AuthRoute element={NavigationBar} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="posts" element={<Posts />} />
            <Route path="contact" element={<Contact />} />
            <Route path="tasks/archive" element={<Archive />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </>
  );
}

export default App;
