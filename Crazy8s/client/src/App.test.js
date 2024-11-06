import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import App from './App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';

// Import webpages from the pages folder
import Home from "./pages/Home"

import CreateGame from "./pages/CreateGame"
import JoinGame from "./pages/JoinGame"
import Game from "./pages/Game"
import AccountSettings from "./pages/AccountSettings"
import CreateAccount from "./pages/CreateAccount"
import ViewAccount from "./pages/ViewAccount"
import EditAccount from "./pages/EditAccount"
import Login from "./pages/Login"

// Socket Mock
const mockSocket = {
  id: 'socket.io-client',
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn()
};

const mockNavigate = jest.fn();


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

  /**
   * Tests for the CREATE GAME page
   */
  describe('Create Game Page', () => {

    // Reset mocks
    beforeEach(() => {
      mockSocket.on.mockClear();
      mockSocket.emit.mockClear();
      mockSocket.off.mockClear();
    });
  

    // Render all components
    test('initial render', () => {
      render(
       <BrowserRouter>
         <CreateGame socket={mockSocket} />
       </BrowserRouter>
      );

      expect(screen.getByPlaceholderText('Enter Room Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Buy-In')).toBeInTheDocument();
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
      expect(screen.getByText('Start Lobby')).toBeInTheDocument();
    });

    // Test room name input
    test('change room name input', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );

      const roomInput = screen.getByPlaceholderText('Enter Room Name');
      fireEvent.change(roomInput, { target: { value: 'NewRoom' } });
      expect(roomInput.value).toBe('NewRoom');
    });

    // Test buy in input
    test('change buy in input', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );

      const buyInput = screen.getByPlaceholderText('Enter Buy-In');
      fireEvent.change(buyInput, { target: { value: '420' } });
      expect(buyInput.value).toBe('420');
    });

    // Test the checkbox
    test('toggles private checkbox', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );
  
      // Click click
      const checkbox = screen.getByRole('checkbox');
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(checkbox.checked).toBe(false);// public
      fireEvent.click(checkbox); 
      expect(checkbox.checked).toBe(true); // private
      fireEvent.click(checkbox); 
      expect(checkbox.checked).toBe(false);// public
    });

    // Test password input
    test('password input when private allowed', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );
  
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox); // Private
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      expect(passwordInput.value).toBe('password');
    });
  
    test('password input when public not allowed', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );
      
      const passwordInput = screen.getByPlaceholderText('Enter Password');
      expect(passwordInput).toBeDisabled();
    });

    // tests if Start Game is available after lobby made
    test('shows Start Game button after game is created', async () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );
  
      fireEvent.click(screen.getByText('Start Lobby'));
  
      await waitFor(() => {
        expect(screen.getByText('Start Game')).toBeInTheDocument();
      });
    });


  });

  /**
   * Tests for JOIN GAME page
   */
  describe('Join Game Page', () => {

    beforeEach(() => {
      jest.clearAllMocks(); 
    });

    test('page renders', () => {
      const gameList = [
        {
          room: 'Game 1',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: true,
          bet: '$10'
        },
        {
          room: 'Game 2',
          host: 'Host 2',
          players: ['Player 1', 'Player 2'],
          isPublic: false,
          bet: '$20',
          password: 'secret'
        }
      ];

      mockSocket.emit.mockImplementation((event, cb) => {
        if (event === 'listGames') {
          cb(gameList);
        }
      });

      render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      )
  
      // Check if games are rendered
      expect(screen.getByText('Game 1')).toBeInTheDocument();
      expect(screen.getByText('Game 2')).toBeInTheDocument();
  
      // Check if the Join button exists for each game
      expect(screen.getAllByText('Join')).toHaveLength(2);
    });

    // Join a public game
    test('clicking join on public game joins game without needing a password', async () => {
      const gameList = [
        {
          room: 'Public Game',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: true,
          bet: '$10'
        }
      ];
  
      mockSocket.emit.mockImplementation((event, cb) => {
        if (event === 'listGames') {
          cb(gameList);
        }
      });
  
      render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      )
  
      const joinButton = screen.getByText('Join');
      fireEvent.click(joinButton);
  
      await waitFor(() => expect(mockSocket.emit).toHaveBeenCalledWith('joinGame', 0, expect.any(Function)));
    });

    // Password prompt appears when joining private game
    test('clicking join on private game shows password prompt', async () => {
      const gameList = [
        {
          room: 'Private Game',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: false,
          bet: '$20',
          password: 'secret'
        }
      ];
  
      mockSocket.emit.mockImplementation((event, cb) => {
        if (event === 'listGames') {
          cb(gameList);
        }
      });
  
      render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      )
  
      const joinButton = screen.getByText('Join');
      fireEvent.click(joinButton);
  
      await screen.findByText('Enter Game Password');
    });

    // Password prompt can be closed
    test('close password popup', async () => {
      const gameList = [
        {
          room: 'Private Game',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: false,
          bet: '$20',
          password: 'secret'
        }
      ];
  
      mockSocket.emit.mockImplementation((event, cb) => {
        if (event === 'listGames') {
          cb(gameList);
        }
      });
  
      render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      )
  
      const joinButton = screen.getByText('Join');
      fireEvent.click(joinButton);
  
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
  
      await waitFor(() => expect(screen.queryByText('Enter Game Password')).not.toBeInTheDocument());
    });

  });
});
