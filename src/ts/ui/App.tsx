import React, { useState } from 'react';
import '../../styles/App.css';
import NavBarComponent from './components/NavBar.component'
import FooterBarComponent from './components/FooterBar.component';
import HomePage from './pages/Home.page';
import AppCataloguePage from './pages/Catalogue.page'
import Box from '@material-ui/core/Box';

const pages = [
  'Home',
  'App Catalogue'
]

export default function App() {
  const [currPage, setCurrPage] = useState(pages[0])

  function handlePageChange(pageLabel: string) {
    setCurrPage(pageLabel);
  }

  function renderPage() {
    switch (currPage) {
      case pages[0]: return <HomePage />
      case pages[1]: return <AppCataloguePage />
    }
  }

  return (
    <div className="App">
      <NavBarComponent currMenuItem={currPage} menuItems={pages} onMenuItemClick={handlePageChange} />
      <Box display="flex" flexDirection="row" flexGrow={1}>
        {renderPage()}
      </Box>
      <FooterBarComponent />
    </div>
  );
}