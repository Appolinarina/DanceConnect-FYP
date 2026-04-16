import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' //navigate to redirect user
import { useAuthContext } from './hooks/useAuthContext'
import Toast from "./components/Toast"

//pages & components
import Home from './pages/home' 
import Login from './pages/login'
import Signup from './pages/signup'
import Navbar from './components/Navbar'
import Browse from './pages/browse'
import EditClass from './pages/editclass'
import MyProfile from './pages/myprofile'
import Footer from './components/Footer'

function App() {
  const {user, authIsReady} = useAuthContext()

  if (!authIsReady) { //do not render routes until auth is ready
    return null
  }

  return (  //all link components need to be inside BrowserRouter
    <div className="App"> 
      <BrowserRouter> 
      <Navbar />
      <div className='pages'> 
        <Routes>
          <Route
            path="/" //home page
            //element to render for route
            element={<Browse />}
          />
          <Route
            path="/my-classes"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <MyProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/classes/:id/edit"
            element={user ? <EditClass /> : <Navigate to="/login" />}
          />
          <Route
            path="/login" //login page
            element={!user ? <Login /> : <Navigate to="/"/>} 
          />
          <Route
            path="/signup" //signup page
            element={!user ? <Signup /> : <Navigate to="/"/>} 
          />
          <Route
            path="/browse"
            element={<Navigate to="/" />}
          />
        </Routes>
      </div>
      <Footer />
      <Toast />
      </BrowserRouter>
    </div>
  );
}

export default App;