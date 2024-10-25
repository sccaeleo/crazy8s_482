import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  })
}));

// Mock axios
jest.mock('axios');

describe('App Component', () => {
  test('renders Home page', () => {
    render(<App />);
    const homeElement = screen.getByTestId('home-page');
    expect(homeElement).toBeInTheDocument();
  });

  test('renders Create Game link', () => {
    render(<App />);
    const createLink = screen.getByText(/create game/i);
    expect(createLink).toBeInTheDocument();
  });

  test('renders Join Game link', () => {
    render(<App />);
    const joinLink = screen.getByText(/join game/i);
    expect(joinLink).toBeInTheDocument();
  });
});