import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './Navigation.css';

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="#home" className="brand">
          <i className="bi bi-wallet2"></i> Financial Manager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              href="#dashboard" 
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              className="nav-link"
            >
              <i className="bi bi-graph-up"></i> Dashboard
            </Nav.Link>
            <Nav.Link 
              href="#expenses" 
              active={activeTab === 'expenses'}
              onClick={() => setActiveTab('expenses')}
              className="nav-link"
            >
              <i className="bi bi-currency-dollar"></i> Expenses
            </Nav.Link>
            <Nav.Link 
              href="#income" 
              active={activeTab === 'income'}
              onClick={() => setActiveTab('income')}
              className="nav-link"
            >
              <i className="bi bi-cash"></i> Income
            </Nav.Link>
            <Nav.Link 
              href="#persons" 
              active={activeTab === 'persons'}
              onClick={() => setActiveTab('persons')}
              className="nav-link"
            >
              <i className="bi bi-people"></i> Persons
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 