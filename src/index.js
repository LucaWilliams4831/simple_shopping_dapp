import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@material-tailwind/react';
const root = ReactDOM.createRoot(document.getElementById('root'));
const theme = {
  popover: {
    defaultProps: {
      placement: "top",
      offset: 5,
      dismiss: {},
      animate: {
        unmount: {},
        mount: {},
      },
      className: "",
    },
    styles: {
      base: {
        bg: "bg-white",
        p: "p-4",
        border: "border-4 border-black",
        borderRadius: "rounded-lg",
        boxShadow: "shadow-lg shadow-blue-gray-500/10",
        fontFamily: "font-sans",
        fontSize: "text-sm",
        fontWeight: "font-normal",
        color: "text-blue-gray-500",
        outline: "focus:outline-none",
        overflowWrap: "break-words",
        whiteSpace: "whitespace-normal",
      },
    },
  },
};

root.render(
  <React.StrictMode>
    <ThemeProvider value={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
