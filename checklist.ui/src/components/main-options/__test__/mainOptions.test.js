import React from 'react';
import { render } from '@testing-library/react';
import { unmountComponentAtNode } from "react-dom";
import MainOptions from '../mainOptions';
import { Route, BrowserRouter } from 'react-router-dom';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

it('renders input for checklist id', () => {
    const { getByPlaceholderText } = render(<BrowserRouter><Route component={MainOptions} className="m-1 content" /></BrowserRouter>, container);
    const checklistIdInput = getByPlaceholderText(/Checklist ID/i);
    expect(checklistIdInput).toBeInTheDocument();
});

it('renders access button', () => {
    const { getByText } = render(<BrowserRouter><Route component={MainOptions} className="m-1 content" /></BrowserRouter>, container);
    const createButton = getByText(/access/i);
    expect(createButton).toBeInTheDocument();
});


it('renders create button', () => {
    const { getByText } = render(<BrowserRouter><Route component={MainOptions} className="m-1 content" /></BrowserRouter>, container);
    const createButton = getByText(/create/i);
    expect(createButton).toBeInTheDocument();
});
