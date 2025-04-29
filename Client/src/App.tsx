
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// קומפוננטות

import LoginPage from './components/Pages/Login/Login'; // הניח שיש קובץ כזה
import DashBoard from './components/Pages/DashBoard/Dash';
import LironLanding from './components/Pages/LironLandig/Index';
import ProtectedRoute from "./components/Pages/Protections";
import AdminRoute from './components/Pages/AdminRoute'
import Archive from './components/Pages/Archive/Index';

import Users from "./components/Pages/Setting/Comp/Users/Users"
import SLA from './components/Pages/Setting/Comp/SLA/SLA';
import Depcat from './components/Pages/Setting/Comp/Depcat/SLA';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LironLanding />} /> {/* דף הבית הוא LandingPage */}
        <Route path="/login" element={<LoginPage />} /> {/* ניתוב לדף ההתחברות */}
        <Route path="*" element={<Navigate to="/" replace />} /> {/* כל נתיב לא מוגדר מפנה לדף הבית */}
        
        <Route element={<ProtectedRoute />}>
          <Route path="/archive" element={<Archive/>}/>
          <Route path="/dashboard" element={<DashBoard/>} />
          <Route element ={<AdminRoute/>}>
              <Route path="/setting/sla" element={<SLA/>}/>
              <Route path="/setting/depcat" element={<Depcat/>}/>
              <Route path="/setting/users" element={<Users/>}/>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
