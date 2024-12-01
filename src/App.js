import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TypingScreen from './screens/TypingScreen/TypingScreen'
import RegisterScreen from './screens/RegisterScreen/RegisterScreen'

function App() {
  return (
    <BrowserRouter>
    <div>
      <Routes>
        <Route path="/" element={<TypingScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
