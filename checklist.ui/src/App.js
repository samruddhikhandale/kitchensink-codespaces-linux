import React from 'react';

import { Route, BrowserRouter } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import MainOptions from './components/main-options/mainOptions';
import Create from './components/create/create';
import Header from './components/header/header';

import './App.css';
import View from './components/view/view';
import RecentChecklists from './components/recent/recent';
import About from './components/about/about';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Container>

          <Row className="mt-3">
            <Col>
              <Route path="/" component={MainOptions} />
            </Col>
          </Row>
          <Row >
            <Col className="m-1 content">
              <Route exact path="/" component={RecentChecklists} className="m-1 content" />
            </Col>
          </Row>
          <Row >
            <Col className="m-1 content">
              <Route path="/create" component={Create} className="m-1 content" />
            </Col>
          </Row>
          <Row>
            <Col className="m-1 content">
              <Route path="/view/:checklistId" component={View} />
            </Col>
          </Row>
          <Row >
            <Col className="m-1 content">
              <Route exact path="/about" component={About} className="m-1 content" />
            </Col>
          </Row>

        </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
