import { BrowserRouter, Routes, Route } from 'react-router-dom'

//pages & components
import Home from './pages/home' 
import Login from './pages/login'
import Signup from './pages/signup'
import Navbar from './components/Navbar'

function App() {
  return (  //all link components need to be inside BrowserRouter
    <div className="App"> 
      <BrowserRouter> 
      <Navbar />
      <div className='pages'> 
        <Routes>
          <Route
            path="/" //home page
            element={<Home />} //element to render for route
          />
          <Route
            path="/login" //login page
            element={<Login />} 
          />
          <Route
            path="/signup" //signup page
            element={<Signup />} 
          />
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
