import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import Navigation from "../../components/Navigation/Navigation";
import Typing from "../../components/Typing/Typing";
import { useRef, useState, React } from "react";

const TypingScreen = () => {
    const [selectedTime, setSelectedTime] = useState('30');
    const typingScreenRef = useRef(null);
    const [gameMode, setGameMode] = useState('time');
    const [targetWordCount, setTargetWordCount] = useState(10);
    const [selected, setSelected] = useState({
      words: false,
      punctuation: false,
      numbers: false,
      sentences: false
  });

    const handleTimeChange = (time) => {
        setSelectedTime(time);
        setGameMode('time');
        // Force refresh when time changes
        if (typingScreenRef.current) {
            const refreshButton = typingScreenRef.current.querySelector('.refreshButton');
            if (refreshButton) {
                refreshButton.click();
            }
        }
    };
    const handleWordCountChange = (count) => {
        setTargetWordCount(parseInt(count));
        setGameMode('words');
        // Force refresh when word count changes
        if (typingScreenRef.current) {
            const refreshButton = typingScreenRef.current.querySelector('.refreshButton');
            if (refreshButton) {
                refreshButton.click();
            }
        }
    };
  
    const handleModeChange = (mode) => {
        setGameMode(mode);
    };
  
    const handleOptionsChange = (newOptions) => {
        setSelected(newOptions);
        // Force refresh when options change
        if (typingScreenRef.current) {
            const refreshButton = typingScreenRef.current.querySelector('.refreshButton');
            if (refreshButton) {
                refreshButton.click();
            }
        }
    };

    return (
        <div>
            <Header />
            <Navigation
                      onTimeChange={handleTimeChange}
                      onModeChange={handleModeChange}
                      onWordCountChange={handleWordCountChange}
                      onOptionsChange={handleOptionsChange}
                      selected={selected}
                      currentTime={selectedTime}
                      currentWordCount={targetWordCount}
                      gameMode={gameMode}
                  />    
            <Typing
                  ref={typingScreenRef}
                  initialTime={parseInt(selectedTime)}
                  gameMode={gameMode}
                  targetWordCount={targetWordCount}
                  selected={selected}
              />       
        </div>
    );
}

  export default TypingScreen;
  