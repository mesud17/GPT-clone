
import Sidebar from "./components/Sidebar/Sidebar"
import Header from "./components/Header/Header"

function App() {
  return (
    <div className="app">
    <Sidebar />
    <main className="chat">
      <Header />
      {/* chat messages */}
      {/* chat input */}
    </main>
    </div>
  )
}

export default App