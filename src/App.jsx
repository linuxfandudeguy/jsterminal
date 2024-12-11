import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import './App.css'; // Import the external CSS file

const App = () => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#2e3436', // Dark gray background
        foreground: '#ffffff', // White text
        cursor: '#ffffff', // White cursor
        selectionBackground: '#b5d5ff', // Light blue selection background
      },
      convertEol: true,
    });

    term.open(terminalRef.current);

    const asciiArt = `
     __                                        .__        __   
    |__|____ ___  _______    ______ ___________|__|______/  |_ 
    |  \\__  \\\\  \\/ /\\__  \\  /  ___// ___\\_  __ \\  \\____ \\   __\\
    |  |/ __ \\\\   /  / __ \\\\___ \\\\  \\___|  | \\/  |  |_> >  |  
/\\__|  (____  /\\_/  (____  /____  >\\___  >__|  |__|   __/|__|  
\\______|    \\/           \\/     \\/     \\/         |__|          
    `;
    term.write(`\x1b[34m${asciiArt}\x1b[39m\n\n`);
    term.write('> ');

    let input = '';

    const handleData = (data) => {
      if (data === '\r') {
        // Run the JavaScript code
        try {
          const result = eval(input); // Use eval to execute the code
          term.write(`\n\x1b[32m${result}\x1b[39m\n`);
        } catch (err) {
          term.write(`\n\x1b[31m[ERROR]: ${err.message}\x1b[39m\n`);
        }
        input = '';
        term.write('> ');
      } else if (data === '\u007F') {
        // Handle backspace
        input = input.slice(0, -1);
        term.write('\b \b');
      } else {
        // Append typed characters
        input += data;
        term.write(data);
      }
    };

    term.onData(handleData);

    // Override console.log to write to the terminal
    const originalLog = console.log;
    console.log = (...args) => {
      const logOutput = args.map(arg => String(arg)).join(' '); // Join arguments and convert to string
      term.write(`\n\x1b[32m${logOutput}\x1b[39m`); // Style the log output with green color
    };

    // Ensure console.log behaves like normal
    console.warn = (...args) => {
      const warnOutput = args.map(arg => String(arg)).join(' ');
      term.write(`\n\x1b[33m[WARN] ${warnOutput}\x1b[39m`); // Yellow for warnings
    };

    console.error = (...args) => {
      const errorOutput = args.map(arg => String(arg)).join(' ');
      term.write(`\n\x1b[31m[ERROR] ${errorOutput}\x1b[39m`); // Red for errors
    };

    return () => {
      term.dispose();
      // Restore original console methods
      console.log = originalLog;
      console.warn = console.warn;
      console.error = console.error;
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      className="terminal-container" // Apply the class for styling
    />
  );
};

export default App;
