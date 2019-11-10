
const { ActivityHandler } = require('botbuilder');
const { MainDialog } = require('../dialogs/mainDialog')

/**
 * FlickerBot prompts a user to select a Flicker photo Card and then display 
 * that matches the user's selection.
 */
class FlickerBot extends ActivityHandler {

   /* @param {ConversationState} conversationState
    * @param {UserState} userState
    * @param {Dialog} dialog
    */

   constructor(conversationState, userState, dialog) {
       super();
       
       if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
       if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
       if (!dialog) dialog = new MainDialog();

       this.conversationState = conversationState;
       this.userState = userState;
       this.dialog = dialog;
       this.dialogState = this.conversationState.createProperty('DialogState');

       this.onMessage(async (context, next) => {
           console.log('Running dialog with Message Activity.');
          
           // Run the Dialog with the new message Activity.
           await this.dialog.run(context, this.dialogState);
           await next();
        });
   

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await this.dialog.run(context, this.dialogState);
                }
            }
            await next();
        });
    }
   
}
 
module.exports.FlickerBot = FlickerBot;
