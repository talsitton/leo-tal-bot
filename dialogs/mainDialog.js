
const { AttachmentLayoutTypes, CardFactory, CardAction ,MessageFactory } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, AttachmentPrompt } = require('botbuilder-dialogs');
const { PhotoCardData, PhotoCardsDataProvider} = require('../data_providers/PhotoCardsDataProvider.js');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const CARDS_NUM = 5;

class MainDialog extends ComponentDialog {

    constructor(cardsData) {

        super('MainDialog');
        this.whatsNextPrompt = new ChoicePrompt('whatsNextPrompt');
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, []));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
        this.selectedAuthor = null;
    }

    async run(turnContext, accessor) {

        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        dialogSet.add(this.whatsNextPrompt);
        
        const dialogContext = await dialogSet.createContext(turnContext);
        
        if (turnContext.activity.type != 'message'  || turnContext.activity.text == "Reset") { 
            await dialogContext.beginDialog(this.id);
            await this.showRandomPhotosStep(dialogContext);
        }
        else{                     
            if(turnContext.activity.text == "Show More")
                turnContext.activity.value = {action:'showAuthorPhotos', auth:this.selectedAuthor};
            if(turnContext.activity.value){
                switch(turnContext.activity.value.action){
                    case "showDescription":
                        await this.showPhotoDescriptionStep(dialogContext, turnContext.activity.value.desc);                        
                        break;
                    case "showAuthorPhotos":
                        await this.showAuthorPhotosStep(dialogContext, turnContext.activity.value.auth);
                        break;
                    default: console.log(turnContext.activity.value.action);              
                }                
                await this.choiceWhatsNextStep(dialogContext, turnContext.activity.value.auth);
            }            
        }
    }

    async showRandomPhotosStep (stepContext){

        var cardsData = await PhotoCardsDataProvider.getPhotoCardsData(CARDS_NUM);
        var cardsCollection = this.createCardsCollection(cardsData, AttachmentLayoutTypes.List);
        return await stepContext.context.sendActivity(cardsCollection);
    }

   async showAuthorPhotosStep (stepContext, author){

        var cardsData = await PhotoCardsDataProvider.getPhotoCardsData(CARDS_NUM, author);
        var cardsCollection = this.createCardsCollection(cardsData, AttachmentLayoutTypes.List);
        return await stepContext.context.sendActivity(cardsCollection);
   }

    async showPhotoDescriptionStep (stepContext, desc, auth){
        return await stepContext.context.sendActivity({text:desc});
    }
    
    async choiceWhatsNextStep(stepContext, author) {

        console.log('MainDialog.choiceCardStep');
        this.selectedAuthor = author;
        const options = {
            prompt: "What's next?",
            retryPrompt: 'That was not a valid choice, please select a card or number from 1 to 2.',
            choices:  [ { value: 'Show more photos for this author', synonyms: ['more photos']},
                        { value: 'Reset',     synonyms: ['reset'] } ]
        };
       return await stepContext.prompt('whatsNextPrompt', options);
    }
  
   
    // ======================================
    // Helper functions used to create cards.
    // ======================================
    
    createPhotoCard(cardData) {

        const photoCard = CardFactory.heroCard(
            cardData.title,
            CardFactory.images([cardData.imageUrl]),
            CardFactory.actions(!cardData.description ?[]: [
                {
                    type: 'postBack',
                    title: 'Description',
                    value: {action:'showDescription', desc:cardData.description, auth:cardData.authorId}
                }
            ])
            ,
            {
                text: 'Author: ' + cardData.author,
                subtitle: 'Taken On: ' + cardData.dateTaken,
                tap:{
                    type: 'postBack',
                    value: {action:'showAuthorPhotos', desc:cardData.description, auth:cardData.authorId}
                }
            }
        );
        return photoCard;
    }

    createCardsCollection(cardsData, layout){
        var msg =  
            {   attachments: (cardsData.map((card) => {return this.createPhotoCard(card) })),
                attachmentLayout: layout
            }        
        return  msg;
    }    
}


module.exports.MainDialog = MainDialog;
