// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { GoogleOAuthProvider } from '@react-oauth/google';

// // -------------------------------------------------------------------
// // !! CRITICAL: REPLACE THIS WITH YOUR REAL GOOGLE CLIENT ID !!
// // The project will NOT work without this.
// // -------------------------------------------------------------------
// const GOOGLE_CLIENT_ID = "308211748497-eitqqaneg64i35vrolc1r77589u3oev1.apps.googleusercontent.com";

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <App />
//     </GoogleOAuthProvider>
//   </React.StrictMode>,
// )

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// -------------------------------------------------------------------
// !! CRITICAL: REPLACE THIS WITH YOUR REAL GOOGLE CLIENT ID !!
// The project will NOT work without this.
// -------------------------------------------------------------------
const GOOGLE_CLIENT_ID = "308211748497-eitqqaneg64i35vrolc1r77589u3oev1.apps.googleusercontent.com"; // <-- PUT YOUR ID HERE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)