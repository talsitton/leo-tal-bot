# leo-tal-chatbot (Flicker chatbot)


This bot has been created using [Bot Framework](https://dev.botframework.com), it demonstraite the following flow:
1. The default behavior of the bot is to fetch 5 random photos from Flickr API and show them as cards,
  each card composed by:
   - The photo itself
   - Photo title,
   - Author name,
   - Date taken 
   - “Description” button. 
2. Clicking on the card will prompt another set of photo cards, this time with just the photos belong to   the author being clicked on.
3. Clicking on “Description” Button will prompt the description text of the photo clicked on.
4. Now, prompt the user for “what’s next” question and give choices for
   ○ show more photos for this author 
   ○ reset the state to the default behavior(1) 

## Prerequisites

- [Node.js](https://nodejs.org) version 10.14.1 or higher

    ```bash
    # determine node version
    node --version
    ```

## To run the bot

- Install modules

    ```bash
    npm install
    ```

- Start the bot

    ```bash
    npm start
    ```

## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.3.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`
