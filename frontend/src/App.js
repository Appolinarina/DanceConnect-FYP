import { BrowserRouter, Routes, Route } from 'react-router-dom'

//pages & components
import Home from './pages/home' 
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
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
