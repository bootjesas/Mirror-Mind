import Link from "next/link"
import "../styles/global.css"

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <div className="footer">
        <p>made by Bo And Jarne 
        </p>
      </div>
    </>
  )
}
