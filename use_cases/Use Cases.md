* List of Actors  
  * User  
  * Admin  
  * Database

* Use Case: Make Account  
  * Primary Actor  
    * User  
  * Purpose  
    * make account to keep track of progress   
  * Stakeholders  
    * User: wants to make an account quickly and with no errors  
    * Database: wants an accurate record of players with unique usernames, passwords  
  * Pre-Conditions  
    * Username is not taken  
    * Email does not have an account associated with it already  
  * Post-Conditions  
    * Account is created  
    * Users stats are now tracked  
  * Triggers  
    * User clicks create account button  
  * Basic Flow  
    * User accesses website and clicks create account  
    * User enters username  
    * Enters email  
    * Enters password  
    * Confirms password  
    * System checks for username and email  
    * System checks both passwords are the same  
    * Account is created  
  * Alternate Flow  
    * User accesses website and clicks create account  
    * User enters username  
    * Enters email  
    * Enters password  
    * Confirms password  
    * System checks for username and email  
      * If username is taken system prompts for different username  
      * If email is taken system prompts for different email  
    * System checks both passwords are the same  
      * If password is wrong, system prompts to try again  
    * Account is created

* Use Case: Change Password  
  * Primary Actor  
    * Admin  
  * Purpose  
    *  To change password of a user if they forgot it  
  * Stakeholders  
    * User \- wants password changed  
    * Admin \- wants efficient and easy changing of password  
    * Database \- wants valid passwords  
  * Pre-Conditions  
    * User has an account that has a password  
  * Post-Conditions  
    * Users password is changed to what they requested  
    * Database is updated to include change  
  * Triggers  
    * Admin clicks change user password button  
  * Basic Flow  
    * Admin clicks change user password  
    * Admin enters username  
    * Admin enters new password  
    * System checks if username exists  
    * System changes the password  
  * Alternate Flow  
    * Admin clicks change user password  
    * Admin enters username  
    * Admin enters new password  
    * System checks if username exists  
      * If username does not exist system prompts that user does not exist  
    * System changes the password  
* Use Case: Create Game  
  * Primary Actor  
    * User  
  * Purpose  
    *  To create a game for people to play  
  * Stakeholders  
    * Host wants to create a game  
    * Database wants to keep track of the stats  
    * User wants to join the game?  
  * Post-Conditions  
    * Game is created  
    * Players can join  
    * User is now a host  
  * Triggers  
    * User clicks create game button  
  * Basic Flow  
    * Host clicks create game  
    * Host chooses whether or not to set a password for the game  
    * Host allows or rejects joining players  
    * Host starts the game


* Use Case: Play Game  
  * Primary Actor  
    * User  
  * Purpose  
    *  to play the game  
  * Stakeholders  
    * Player: wants to play the game with no errors and no lag  
    * Game: wants the player to play cards when the rules allow and for the game to end  
  * Pre-Conditions  
    * Player is in a game that the host has started  
  * Post-Conditions  
    * Game is ended  
    * Player wins or loses  
    * Stats are recorded  
  * Triggers  
    * Host started the game  
  * Basic Flow  
    * User waits for their turn  
    * Game gives user their turn  
    * User plays or draws a card  
    * Game updates pile  
    * Game changes turn  
    * Continues until Player has zero cards  
    * Game is ended  
    * Player is told they won  
    * User Stats are updated  
  * Alternate Flow  
    * User waits for their turn  
    * Game gives user their turn  
    * User plays or draws a card  
    * Game updates pile  
    * Game changes turn  
    * Continues until Player has zero cards  
      * Game finds out another player has zero cards  
    * Game is ended  
    * Player is told they won  
      * Player is told they lost  
    * User Stats are updated


* Use Case:  Join Game  
  * Primary Actor  
    * User  
  * Purpose  
    *  Allows user to join a game  
  * Stakeholders  
    * User \- Wants to join a lobby  
    * User who is host- Wants to see users join their game  
  * Pre-Conditions  
    * User is signed in to an account  
  * Post-Conditions  
    * User successfully connects to the lobby  
    * Host can see the user connected to their lobby  
  * Triggers  
    * User clicks on join game button and provides lobby password  
  * Basic Flow  
    * User sees list of available games  
    * User clicks on a game they want and presses join game  
    * User inputs the password to the lobby  
    * System checks if password is correct  
    * System checks if there is room in the lobby  
    * User is accepted into the lobby  
  * Alternate Flow  
    * User sees list of available games  
    * User clicks on a game they want and presses join game  
    * User inputs the password to the lobby  
    * System checks if password is correct  
      * If it is incorrect it prompts that the password was wrong  
    * System checks if there is room in the lobby  
      * If the lobby is full the system denies the user from entering  
* Use Case: Send Message  
  * Primary Actor  
    * User  
  * Purpose  
    *  To send a message to a recipient  
  * Stakeholders  
    * User (sender) wants to send a message  
    * User (recipient) needs to be able to see the message  
    * Database logs the message  
  * Pre-Conditions  
    * User has an account  
    * Recipient is a friend  
  * Post-Conditions  
    * Sender sees that the message is sent  
    * Recipient receives the message  
  * Triggers  
    * Sender writes a message and hits send button  
  * Basic Flow  
    * User enters their account page  
    * User looks through their friends list, selects a friend, and hits message button  
    * User writes a message  
    * User hits send  
    * Recipient receives the message


* Use Case:  Add Friend  
  * Primary Actor  
    * User  
  * Purpose  
    *  To add friends so that you can message them  
  * Stakeholders  
    * User \- wants to add friends to friend list  
    * User who is being friended \- wants to see notification to accept friend  
    * Database \- wants to keep track of users friends  
  * Pre-Conditions  
    * User has an account and is signed in  
    * Friend also has an account  
  * Post-Conditions  
    * User can now message their friend  
    * Database reflects the User to User relationship and knows they are friends  
  * Triggers  
    * Add Friend button  
  * Basic Flow  
    * User clicks add friend   
    * Inputs username of friend they want to add  
    * System checks that the username exists   
    * On next login user who is being friended is notified that someone requested to friend them  
    * Is given option to accept or decline  
    * On accept both users are friends and can message each other  
  * Alternate Flow  
    * User clicks add friend   
    * Inputs username of friend they want to add  
    * System checks that the username exists   
    * On next login user who is being friended is notified that someone requested to friend them  
    * Is given option to accept or decline  
    * On decline game does not make these users friends

* Use Case: Kick Player  
  * Primary Actor  
    * User  
  * Purpose  
    *  to get rid of a troublesome player  
  * Stakeholders  
    * User: wants to play the game smoothly and get rid of a player  
    * Game: Wants to continue to run with no pauses  
  * Pre-Conditions  
    * User is a host  
    * Other User is in game  
  * Post-Conditions  
    * Other User is kicked  
    * Game has one less player  
  * Basic Flow  
    * User clicks on a kick next to player name  
    * System removes other user from game  
    * Other User has been kicked


  Use Cases:

* Make Account  
* Change Password  
* Play Game  
* Create Game  
* Join Game  
* Send Message  
* Add Friend  
* Kick Player