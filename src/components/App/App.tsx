import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';
import Routes from '../../route/Routes';
import { observer } from 'mobx-react';
import { ThemeProvider, useTheme } from 'antd-theme';
import useStores from '../../hooks/useStores';
import { Layout } from 'antd';

import Tabs from './Tabs/Tabs';
import Me from './Me/me.component';
import Mode from './Mode/ModeSelector';

import { useRouter } from '../../hooks/useRouter';
import ReactGA from 'react-ga';

function App() {
  const { common } = useStores();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(common.useDark);
  const [stateTheme, setStateTheme] = useState('default');
  const initialTheme = {
    name: 'default',
    variables: {}
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ReactGA.pageview(router.location.pathname + router.location.search);
    }
  }, []);

  const [theme, setInitialTheme] = useState(initialTheme);
  const handleDarkmode = value => {
    //console.log('value: ', value);
    setInitialTheme(value);
  };
  return (
    <div className="container">
      <ThemeProvider theme={theme} onChange={value => handleDarkmode(value)}>
        <Layout
          style={{ height: '100%', transition: 'background 0.3s' }}
          className={`${isDarkMode ? 'dark' : 'light'} auth main-layout`}
        >
          <Layout.Content>
            <Me />
            <Mode setIsDarkMode={setIsDarkMode} />
          </Layout.Content>
          <Tabs />
        </Layout>
      </ThemeProvider>
    </div>
  );
}

export default App;
