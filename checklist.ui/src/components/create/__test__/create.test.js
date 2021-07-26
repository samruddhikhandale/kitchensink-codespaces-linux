import React from 'react';
import { render } from '@testing-library/react';
import Create from '../create';

it('renders input for title', () => {
    const { getByPlaceholderText } = render(<Create />);
    const titleInput = getByPlaceholderText(/Enter title/i);
    expect(titleInput).toBeInTheDocument();
});

it('renders create button', () => {
    const { getByTestId } = render(<Create />);
    const createButton = getByTestId(/create-button/i);
    expect(createButton).toBeInTheDocument();
});

