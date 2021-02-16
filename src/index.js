import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Analytics from '@aws-amplify/analytics';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';


Amplify.configure(awsconfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

Analytics.autoTrack('session', {
  enable: true,
  attributes: {},
});

Analytics.autoTrack('pageView', {
  // REQUIRED, turn on/off the auto tracking
  enable: true,
  eventName: 'pageView',
  // OPTIONAL, by default is 'multiPageApp'
  // you need to change it to 'SPA' if your app is a single-page app like React
  type: 'SPA',
  getUrl: () => {
      return window.location.origin + window.location.pathname;
  }
});

Analytics.autoTrack('event', {
  // REQUIRED, turn on/off the auto tracking
  enable: true,
  // OPTIONAL, events you want to track, by default is 'click'
  events: ['click'],
  // OPTIONAL, the prefix of the selectors, by default is 'data-amplify-analytics-'
  // in order to avoid collision with the user agent, according to https://www.w3schools.com/tags/att_global_data.asp
  // always put 'data' as the first prefix
  selectorPrefix: 'data-amplify-analytics-'
});