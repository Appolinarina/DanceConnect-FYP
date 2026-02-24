import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' //navigate to redirect user
import { useAuthContext } from './hooks/useAuthContext'

//pages & components
import Home from './pages/home' 
import Login from './pages/login'
import Signup from './pages/signup'
import Navbar from './components/Navbar'
import Browse from './pages/browse'

function App() {
  const {user} = useAuthContext()
  return (  //all link components need to be inside BrowserRouter
    <div className="App"> 
      <BrowserRouter> 
      <Navbar />
      <div className='pages'> 
        <Routes>
          <Route
            path="/" //home page
            //element to render for route
            element={user ? <Home /> : <Navigate to="/login"/>} //if user authenticated, send to home. if not, redirect to login
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
            element={user ? <Browse /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
