import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


jest.mock('socket.io-client', () => ({
  io: () => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  })
}));


jest.mock('axios');


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('App Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  
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

  test('renders the CreateAccount page and submits form successfully', async () => {
    const mockNavigate = jest.fn(); 
    useNavigate.mockReturnValue(mockNavigate); 
    render(<App />); 

    fireEvent.click(screen.getByText(/create account/i)); 
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@user.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpassword' } });

  
    axios.post.mockResolvedValueOnce({ data: { success: "user added successfully" } });

    fireEvent.click(screen.getByText(/save/i)); 

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/add_user', {
        name: 'New User',
        email: 'new@user.com',
        password: 'newpassword',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    render(<App />);
    
  });

  test('navigates to AccountSettings page and submits form successfully', async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(<App />);

    
    fireEvent.click(screen.getByText(/account settings/i));

 
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'updated@user.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'updatedpassword' } });

 
    axios.post.mockResolvedValueOnce({ data: { success: "user updated successfully" } });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/edit_account', {
        name: 'Updated User',
        email: 'updated@user.com',
        password: 'updatedpassword',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/'); 
    });
  });
  
});
