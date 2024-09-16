import Header from "../Header/Header.jsx"
import Footer from "../Footer/Footer.jsx"
import Routing from "../Routing/Routing.jsx"
import "./Layout.css"

function Layout() {
  return (
    <div className="Layout">
      <header>
        <Header />
      </header>
      <main>
        <Routing />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default Layout
