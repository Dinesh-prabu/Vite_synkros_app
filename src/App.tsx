import { BrowserRouter } from 'react-router-dom'

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
