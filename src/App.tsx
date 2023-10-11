import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Login from './pages/login/Login.jsx'

import RouterNavigation from './routers/index.js'

function App() {

  return (
    <>
      <BrowserRouter>
					<RouterNavigation />
				</BrowserRouter>
    </>
  )
}

export default App
