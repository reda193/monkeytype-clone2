import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generate } from 'random-words';
import { RefreshCw } from 'lucide-react';
import styles from './Typing.module.css';
import Navigation from '../Navigation/Navigation';
import Quote, { getRandomQuote } from 'inspirational-quotes';

const WORDS_PER_LINE = 15;
const VISIBLE_LINES = 3;
const BUFFER_LINES = 2;


const generateNumberWord = () => {
    // Generate a number between 0 and 999
    return Math.floor(Math.random() * 1000).toString();
};

const generatePunctuatedWord = (word) => {
    const punctuation = ['.', ',', '!', '?', ';', ':'];
    const randomPunctuation = punctuation[Math.floor(Math.random() * punctuation.length)];
    return word + randomPunctuation;
};

const useTimer = (initialTime, isRunning, onReset) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const intervalRef = useRef(null);
    
    useEffect(() => {
      if (!isRunning) {
        clearInterval(intervalRef.current);
        return;
      }
  
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
  
      return () => clearInterval(intervalRef.current);
    }, [isRunning]);
  
    const resetTimer = useCallback(() => {
      setTimeLeft(initialTime);
      if (onReset) onReset();
    }, [initialTime, onReset]);
  
    return [timeLeft, resetTimer];
};

const TypingScreen = ({ initialTime, gameMode, targetWordCount, selected }) => {
    const [words, setWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [visibleWords, setVisibleWords] = useState(WORDS_PER_LINE);
    const [gameStarted, setGameStarted] = useState(false);
    const [totalWordsTyped, setTotalWordsTyped] = useState(0);
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [letterStates, setLetterStates] = useState([]);
    const [wordStates, setWordStates] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [typedWords, setTypedWords] = useState([]);
    const [wordModeTime, setWordModeTime] = useState(0);
    const [wordModeInterval, setWordModeInterval] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameStats, setGameStats] = useState({
        wpm: 0,
        accuracy: 0,
        totalWords: 0,
        correctWords: 0,
        incorrectWords: 0
    });
    const typingScreenRef = useRef(null);
    const cursorRef = useRef(null);
    const containerRef = useRef(null);

    const generateSentence = () => {
        // Get random quote using the Quote library
        const quote = Quote.getQuote();
        const words = quote.text.split(' ');
        
        // If we need more words, pad with random words
        if (words.length < visibleWords) {
            const extraWords = Array(visibleWords - words.length)
                .fill(null)
                .map(() => generate({ minLength: 3, maxLength: 8, exactly: 1 })[0]);
            return [...words, ...extraWords];
        }
        
        // If we have too many words, trim to visibleWords
        return words.slice(0, visibleWords);
    };

    useEffect(() => {
        const handleResize = () => {
            const currentWindowWidth = window.innerWidth;
            if (currentWindowWidth < 475) {
                setVisibleWords(3);
            } else if (currentWindowWidth < 575) {
                setVisibleWords(4);
            } else if (currentWindowWidth < 675) {
                setVisibleWords(5);
            } else if (currentWindowWidth < 775) {
                setVisibleWords(6);
            } else if (currentWindowWidth < 875) {
                setVisibleWords(7);
            } else if (currentWindowWidth < 975) {
                setVisibleWords(8);
            } else if (currentWindowWidth < 1075) {
                setVisibleWords(9);
            } else if (currentWindowWidth < 1175) {
                setVisibleWords(10);
            } else if (currentWindowWidth < 1275) {
                setVisibleWords(11)
            } else {
                setVisibleWords(WORDS_PER_LINE);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const generateWord = useCallback(() => {
        if (selected.numbers && Math.random() < 0.3) { // 30% chance for numbers
            return generateNumberWord();
        }
        
        let word = generate({ minLength: 3, maxLength: 8, exactly: 1 })[0];
        
        if (selected.punctuation && Math.random() < 0.3) { // 30% chance for punctuation
            word = generatePunctuatedWord(word);
        }
        
        return word;
    }, [selected]);

    const generateNewLine = useCallback(() => {
        if (selected.sentences) {  // This button should give us quotes
            const quote = Quote.getQuote();
            // Get just the quote text and split into words
            const words = quote.text.split(' ');
            
            if (words.length > visibleWords) {
                return words.slice(0, visibleWords);
            }
            // If the quote is too short, pad with random words
            if (words.length < visibleWords) {
                const extraWords = Array(visibleWords - words.length)
                    .fill(null)
                    .map(() => generate({ minLength: 3, maxLength: 8, exactly: 1 })[0]);
                return [...words, ...extraWords];
            }
            return words;
        }
    
        return Array(visibleWords).fill(null).map(() => generateWord());
    }, [selected, generateWord, visibleWords]);
    
    


    const loadWords = useCallback(() => {
        // Generate initial lines including buffer
        const generatedWords = Array(VISIBLE_LINES + BUFFER_LINES)
            .fill(null)
            .map(() => generateNewLine());
        
        setWords(generatedWords);
        setLetterStates(generatedWords.map(line => 
            line.map(word => Array(word.length).fill('default'))
        ));
        setWordStates(generatedWords.map(line => 
            line.map(() => 'default')
        ));
    }, [generateNewLine]);

    const shiftLinesUp = useCallback(() => {
        setWords(prevWords => {
            const newWords = [...prevWords.slice(1), generateNewLine()];
            
            setLetterStates(prev => [
                ...prev.slice(1),
                newWords[newWords.length - 1].map(word => Array(word.length).fill('default'))
            ]);
            setWordStates(prev => [
                ...prev.slice(1),
                newWords[newWords.length - 1].map(() => 'default')
            ]);
            
            return newWords;
        });
    }, [generateNewLine]);


    const [timeLeft, resetTimer] = useTimer(
        initialTime,
        gameMode === 'time' && gameStarted,
        null // Remove the resetGame callback to avoid unwanted resets
    );


    // 2. Update resetGame to be simpler
    const resetGame = useCallback((force = false) => {
        if (force || !gameStarted) {
            setGameStarted(false);
            setGameOver(false);
            setCurrentWordIndex(0);
            setCurrentLetterIndex(0);
            setCurrentLineIndex(0);
            setUserInput('');
            setTypedWords([]);
            setTotalWordsTyped(0);
            setWordModeTime(0);
            if (wordModeInterval) {
                clearInterval(wordModeInterval);
                setWordModeInterval(null);
            }
            loadWords();
            resetTimer();
            
            setGameStats({
                wpm: 0,
                accuracy: 0,
                totalWords: 0,
                correctWords: 0,
                incorrectWords: 0
            });
        }
    }, [loadWords, wordModeInterval, gameStarted, resetTimer]);
    

    const isInitialMount = useRef(true);
    const prevPropsRef = useRef({ gameMode, initialTime, targetWordCount, selected });

    // Remove the duplicate useEffect and combine the logic into one
    useEffect(() => {
        const prevProps = prevPropsRef.current;
        
        // Only reset if navigation props actually changed
        if (prevProps.gameMode !== gameMode ||
            prevProps.initialTime !== initialTime ||
            prevProps.targetWordCount !== targetWordCount ||
            JSON.stringify(prevProps.selected) !== JSON.stringify(selected)) {
            resetGame(true);
            if (typingScreenRef.current) {
                typingScreenRef.current.focus();
            }
        }
        
        // Update the ref
        prevPropsRef.current = { gameMode, initialTime, targetWordCount, selected };
    }, [gameMode, initialTime, targetWordCount, selected, resetGame]);


    useEffect(() => {
        loadWords();
    }, []);


    useEffect(() => {
        if (gameMode === 'words' && gameStarted && !wordModeInterval) {
            const interval = setInterval(() => {
                setWordModeTime(prev => prev + 1);
            }, 1000);
            setWordModeInterval(interval);
        }
        return () => {
            if (wordModeInterval) {
                clearInterval(wordModeInterval);
                setWordModeInterval(null);
            }
        };
    }, [gameMode, gameStarted]);

    useEffect(() => {
        if (gameMode === 'time' && timeLeft === 0) {
            setGameStarted(false);
            setGameOver(true);
            calculateGameStats();
        } else if (gameMode === 'words' && totalWordsTyped >= targetWordCount) {
            setGameStarted(false);
            setGameOver(true);
            clearInterval(wordModeInterval);
            calculateGameStats();
        }
    }, [timeLeft, totalWordsTyped, gameMode, targetWordCount, wordModeInterval]);
    const calculateGameStats = useCallback(() => {
        const totalWords = typedWords.length;
        const correctWords = typedWords.filter(word => word.correct).length;
        const incorrectWords = totalWords - correctWords;
        const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
        
        let wpm;
        if (gameMode === 'time') {
            wpm = (totalWords / (initialTime / 60));
        } else {
            // For word mode, calculate WPM based on actual time taken
            const minutesTaken = wordModeTime / 60;
            wpm = totalWords / Math.max(minutesTaken, 1/60);
        }
    
        setGameStats({
            wpm: Math.round(wpm),
            accuracy: accuracy.toFixed(2),
            totalWords,
            correctWords,
            incorrectWords,
            timeElapsed: gameMode === 'words' ? `${wordModeTime}s` : initialTime
        });
    }, [typedWords, initialTime, gameMode, wordModeTime]);


    const moveCursor = useCallback(() => {
        const currentWord = words[currentLineIndex]?.[currentWordIndex];
        if (!currentWord || !isFocused) return;

        const wordElement = document.querySelector(`.${styles['active-word']}`);
        const cursor = cursorRef.current;
        
        if (wordElement && cursor && typingScreenRef.current) {
            const letters = wordElement.querySelectorAll(`.${styles.letter}`);
            const letterElement = letters[currentLetterIndex] || letters[letters.length - 1];
            const rect = letterElement.getBoundingClientRect();
            const containerRect = typingScreenRef.current.getBoundingClientRect();
            
            cursor.style.left = `${rect.left - containerRect.left + (currentLetterIndex >= currentWord.length ? rect.width : 0)}px`;
            cursor.style.top = `${rect.top - containerRect.top}px`;
        }
    }, [currentWordIndex, currentLetterIndex, words, isFocused, currentLineIndex]);

    useEffect(() => {
        if (isFocused) {
            moveCursor();
        }
    }, [isFocused, moveCursor]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleKeyDown = useCallback((event) => {
        if (!gameStarted && !gameOver) {
            setGameStarted(true);
        }
                  
        const currentWord = words[currentLineIndex]?.[currentWordIndex];
        if (!currentWord) return;
        
        if (event.key === 'Backspace' && currentLetterIndex > 0) {
            setCurrentLetterIndex(prevIndex => prevIndex - 1);
            setUserInput(prevInput => prevInput.slice(0, -1));
            setLetterStates(prevStates => {
                const newStates = [...prevStates];
                newStates[currentLineIndex][currentWordIndex][currentLetterIndex - 1] = 'default';
                return newStates;
            });
            setWordStates(prevStates => {
                const newStates = [...prevStates];
                newStates[currentLineIndex][currentWordIndex] = 'default';
                return newStates;
            });
        }  else if (event.key === ' ') {
            if (currentLetterIndex > 0) {
                // For punctuated words, we need to match exactly
                const isWordCorrect = userInput === currentWord;
                setTotalWordsTyped(prev => prev + 1);
                setWordStates(prevStates => {
                    const newStates = [...prevStates];
                    newStates[currentLineIndex][currentWordIndex] = isWordCorrect ? 'correct-word' : 'incorrect-word';
                    return newStates;
                });

                setTypedWords(prevTypedWords => [...prevTypedWords, {
                    word: userInput,
                    correct: isWordCorrect
                }]);

                const nextWordIndex = currentWordIndex + 1;
                if (nextWordIndex >= words[currentLineIndex].length) {
                    // When reaching the end of a line
                    shiftLinesUp();
                    setCurrentWordIndex(0);
                } else {
                    setCurrentWordIndex(nextWordIndex);
                }
                setCurrentLetterIndex(0);
                setUserInput('');
            }
        } else if (event.key.length === 1) {
            // Handle typing of punctuation marks as well
            if (currentLetterIndex < currentWord.length) {
                const isCorrect = event.key === currentWord[currentLetterIndex];
                setLetterStates(prevStates => {
                    const newStates = [...prevStates];
                    newStates[currentLineIndex][currentWordIndex][currentLetterIndex] = isCorrect ? 'correct-letter' : 'incorrect-letter';
                    return newStates;
                });
                setCurrentLetterIndex(prevIndex => prevIndex + 1);
                setUserInput(prevInput => prevInput + event.key);

                if (!isCorrect) {
                    setWordStates(prevStates => {
                        const newStates = [...prevStates];
                        newStates[currentLineIndex][currentWordIndex] = 'incorrect-word';
                        return newStates;
                    });
                }
            }
        }
    }, [gameStarted, currentWordIndex, currentLetterIndex, words, userInput, currentLineIndex, shiftLinesUp]);

    useEffect(() => {
        if (isFocused) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFocused, handleKeyDown]);

    const renderWords = useCallback(() => {
        return words.slice(0, VISIBLE_LINES).map((line, lineIndex) => (
            <div key={lineIndex} className={`${styles.line} ${lineIndex === VISIBLE_LINES - 1 ? styles.lastLine : ''}`}>
                {line.map((word, wordIndex) => {
                    const wordState = wordStates[lineIndex]?.[wordIndex] || 'default';
                    return (
                        <span
                            key={wordIndex}
                            className={`${styles.word} 
                                ${lineIndex === currentLineIndex && wordIndex === currentWordIndex ? styles['active-word'] : ''}
                                ${styles[wordState]}`} // Apply the word state class
                        >
                            {word.split('').map((letter, letterIndex) => {
                                const letterState = letterStates[lineIndex]?.[wordIndex]?.[letterIndex] || 'default';
                                return (
                                    <span
                                        key={letterIndex}
                                        className={`${styles.letter} 
                                            ${lineIndex === currentLineIndex && 
                                              wordIndex === currentWordIndex && 
                                              letterIndex === currentLetterIndex ? styles['active-letter'] : ''}
                                            ${styles[letterState]}`}
                                    >
                                        {letter}
                                    </span>
                                );
                            })}
                            <span className={styles.space}>&nbsp;</span>
                        </span>
                    );
                })}
            </div>
        ));
    }, [words, currentWordIndex, currentLetterIndex, letterStates, wordStates, currentLineIndex]);

    const handleRefresh = useCallback(() => {
        resetGame(true);
        setGameOver(false);
        
        if (typingScreenRef.current) {
            typingScreenRef.current.focus();
        }
    }, [resetGame]);
    
    const renderGameStats = useCallback(() => (
        <div className={styles.gameStats}>
          <h2>Game Over! Here are your results:</h2>
          <ul>
            <li>WPM: {gameStats.wpm}</li>
            <li>Accuracy: {gameStats.accuracy}%</li>
            <li>Total Words: {gameStats.totalWords}</li>
            <li>Correct Words: {gameStats.correctWords}</li>
            <li>Incorrect Words: {gameStats.incorrectWords}</li>
          </ul>
        </div>
    ), [gameStats]);



    
    // Modified header rendering
    const renderHeader = useCallback(() => {
        return (
            <div className={styles.header}>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    <RefreshCw size={24} />
                </button>
                <div className={styles.gameInfo}>
                    {!gameOver && (
                        gameMode === 'time' ? (
                            <div className={styles.seconds}>{timeLeft}</div>
                        ) : (
                            <div className={styles.wordsProgress}>
                                <span className={styles.wordCount}>
                                    {totalWordsTyped}/{targetWordCount}
                                </span>
                                <span className={styles.timeLabel}>Time:</span>
                                <span className={styles.timeValue}>{wordModeTime}s</span>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }, [gameMode, timeLeft, totalWordsTyped, targetWordCount, wordModeTime, gameOver, handleRefresh]);

// Update the return JSX to always show the header
return (
    <div className={styles.typingScreen} 
         tabIndex="0"
         onFocus={handleFocus}
         onBlur={handleBlur}
         ref={typingScreenRef}>
        {renderHeader()}
        {!gameOver ? (
            <>
                <div className={styles.wordsContainer} ref={containerRef}>
                    {renderWords()}
                </div>
                {isFocused && <div className={styles.cursor} ref={cursorRef}></div>}
                {!isFocused && <div className={styles.focusError}>Click Here to Type</div>}
            </>
        ) : renderGameStats()}
    </div>
);
};

export default TypingScreen;