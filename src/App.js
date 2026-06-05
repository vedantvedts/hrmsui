import logo from './logo.svg';
import './App.css';
import './fonts.css';
import './static/buttons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AppRoutes from './common/navigateUrl';
import { RoleAccessProvider } from './common/RoleAccessContext';
import IdleTimeoutHandler from './common/IdleTimeoutHandler';

function App() {
  return (
    <div className="App hrms-font">
      <IdleTimeoutHandler timeout={300000} warningTime={30000}>
        <RoleAccessProvider>
          <AppRoutes />
        </RoleAccessProvider>
      </IdleTimeoutHandler>
    </div>
  );
}

export default App;
