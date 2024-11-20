import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, getByTestId } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import App from './App.js';
import Home from './pages/Home.jsx';
import CreateGame from './pages/CreateGame.jsx';
import JoinGame from './pages/JoinGame.jsx';

// Mock dependencies
const mockSocket = {
  id: 'socket.io-client',
  on: jest.fn(),
  emit: jest.fn(),
  off: jest.fn(),
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

  describe('Create Account Page', () => {
    test('renders CreateAccount page and submits form', async () => {
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
      });
    });

  });

  describe('Account Settings Page', () => {
    test('navigates to AccountSettings page and submits form', async () => {
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

      });
    });
  });
  describe('Home', () => {

    beforeEach(() => {
      mockSocket.on.mockClear();
      mockSocket.emit.mockClear();
      mockSocket.off.mockClear();
    });
    
    test('initial render', () => {
      render(
        <BrowserRouter>
          <Home socket={mockSocket} />
        </BrowserRouter>
      );

      expect(screen.getByText('Create Game')).toBeInTheDocument();
      expect(screen.getByText('Join Game')).toBeInTheDocument();
      expect(screen.getByText('How To Play')).toBeInTheDocument();
    });
  });
  describe('Create Game Page', () => {

    beforeEach(() => {
      mockSocket.on.mockClear();
      mockSocket.emit.mockClear();
      mockSocket.off.mockClear();
    });

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

    test('change buy-in input', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );

      const buyInput = screen.getByPlaceholderText('Enter Buy-In');
      fireEvent.change(buyInput, { target: { value: '420' } });
      expect(buyInput.value).toBe('420');
    });

    test('toggles private checkbox', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    test('password input when private allowed', () => {
      render(
        <BrowserRouter>
          <CreateGame socket={mockSocket} />
        </BrowserRouter>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
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
  describe('Join Game Page', () => {

    beforeEach(() => {
      jest.clearAllMocks();
      mockSocket.on.mockClear();
      mockSocket.emit.mockClear();
      mockSocket.off.mockClear();
    });
    

    const gameList = [
      {
        room: 'Game 1',
        host: 'Host 1',
        players: ['Player 1'],
        isPublic: true,
        bet: '$10',
      },
      {
        room: 'Game 2',
        host: 'Host 2',
        players: ['Player 1', 'Player 2'],
        isPublic: false,
        bet: '$20',
        password: 'secret',
      },
    ];

    it('updates the game list every 5 seconds', async () => {
      const { getByTestId } = render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      );
      const gameList = getByTestId('game-list');

      expect(gameList).toBeInTheDocument();

      await waitFor(() => expect(mockSocket.emit).toHaveBeenCalledTimes(1));
      expect(mockSocket.emit).toHaveBeenNthCalledWith(1, 'listGames', expect.any(Function));
    }); 

    test('clicking join on public game joins game without needing a password', async () => {
      const gameList = [
        {
          room: 'Public Game',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: true,
          bet: '$10',
        },
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
      );

      const joinButton = screen.getByText('Join');
      fireEvent.click(joinButton);

      await waitFor(() => expect(mockSocket.emit).toHaveBeenCalledWith('joinGame', 0, expect.any(Function)));
    });

    test('clicking join on private game shows password prompt', async () => {
      const gameList = [
        {
          room: 'Private Game',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: false,
          bet: '$20',
          password: 'secret',
        },
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
      );

      const joinButton = screen.getByText('Join');
      fireEvent.click(joinButton);

      await screen.findByText('Enter Game Password');
    });

    test('close password popup', async () => {
      const gameList = [
        {
          room: 'Private Game',
          host: 'Host 1',
          players: ['Player 1'],
          isPublic: false,
          bet: '$20',
          password: 'secret',
        },
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
      );

      const joinButton = screen.getByText('Join');
      fireEvent.click(joinButton);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      await waitFor(() => expect(screen.queryByText('Enter Game Password')).not.toBeInTheDocument());
    });

    it('shows the password popup when joining a private game', async () => {
      const game = { isPublic: false, password: 'secret' };
      const { getByText } = render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      );
      const joinButton = getByText('Join');

      fireEvent.click(joinButton);

      await waitFor(() => expect(getByText('Enter Game Password')).toBeInTheDocument());
    });

    it('closes the password popup when the cancel button is clicked', async () => {
      const game = { isPublic: false, password: 'secret' };
      const { getByText, getByTestId } = render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      );
      const joinButton = getByText('Join');
      fireEvent.click(joinButton);

      await waitFor(() => expect(getByTestId('password-enter')).toBeInTheDocument());
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });

    it('joins the game successfully when the correct password is entered', async () => {
      const game = { isPublic: false, password: 'secret' };
      const { getByText, getByTestId } = render(
        <MemoryRouter>
          <JoinGame socket={mockSocket} />
        </MemoryRouter>
      );

      mockSocket.emit.mockImplementation((event, cb) => {
        if (event === 'joinGame') {
          if (typeof cb === 'function') {
            cb(1, expect.any(Function));
          } else {
            console.error('cb is not a function');
          }
        } else if (event === 'listGames') {
          cb(gameList);
        }
      });

      const joinButton = getByText('Join');

      fireEvent.click(joinButton);

      await waitFor(() => expect(getByTestId('password-enter')).toBeInTheDocument());

      const passwordInput = getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'secret' } });

      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockSocket.emit).toHaveBeenCalledTimes(7));
    });

  });
});

