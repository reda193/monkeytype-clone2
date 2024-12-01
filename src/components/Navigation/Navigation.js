import React, { useState } from 'react';
import styles from './Navigation.module.css';
import { FaRegUser, FaCrown, FaInfo } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

const Navigation = ({ 
  onTimeChange, 
  onModeChange, 
  onWordCountChange, 
  onOptionsChange, 
  selected,
  currentTime,
  currentWordCount,
  gameMode
}) => {
  const handleTimeOption = (time) => {
      onTimeChange(time);
  };

  const handleWordOption = (word) => {
      onWordCountChange(word);
  };

  const handleSelect = (option) => {
      if (option === 'sentences') {
          const newSelected = {
              words: false,
              punctuation: false,
              numbers: false,
              sentences: true
          };
          onOptionsChange(newSelected);
      } else {
          const newSelected = {
              ...selected,
              [option]: !selected[option],
              sentences: false
          };
          onOptionsChange(newSelected);
      }
  };

  return (
      <div className={styles.navigation}>
          <div className={styles.dropdown}>
              <button 
                  className={`${styles.dropbtn} ${gameMode === 'time' ? styles.selected : ''}`}
              >
                  {`time: ${currentTime}`}
              </button>
              <div className={styles.dropdownContent}>
                  {['15', '30', '60'].map((time) => (
                      <button 
                          key={time} 
                          onClick={() => handleTimeOption(time)}
                          className={currentTime === time ? styles.selected : ''}
                      >
                          {time}
                      </button>
                  ))}
              </div>
          </div>

          <div className={styles.dropdown}>
              <button 
                  className={`${styles.dropbtn} ${gameMode === 'words' ? styles.selected : ''}`}
              >
                  {`words: ${currentWordCount}`}
              </button>
              <div className={styles.dropdownContent}>
                  {['10', '25', '50', '100'].map((word) => (
                      <button 
                          key={word} 
                          onClick={() => handleWordOption(word)}
                          className={currentWordCount.toString() === word ? styles.selected : ''}
                      >
                          {word}
                      </button>
                  ))}
              </div>
          </div>

          <div className={styles.modeButtons}>
              <button
                  className={`${styles.modeBtn} ${selected.numbers ? styles.selected : ''}`}
                  onClick={() => handleSelect('numbers')}
              >
                  123
              </button>
              <button
                  className={`${styles.modeBtn} ${selected.punctuation ? styles.selected : ''}`}
                  onClick={() => handleSelect('punctuation')}
              >
                  !@#
              </button>
              <button
                  className={`${styles.modeBtn} ${selected.sentences ? styles.selected : ''}`}
                  onClick={() => handleSelect('sentences')}
              >
                  ABC
              </button>
          </div>
      </div>
  );
};

export default Navigation;