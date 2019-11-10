
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
        
        if (turnContext.activity.type != 'message') { 
            await dialogContext.beginDialog(this.id);
            return await this.showRandomPhotosStep(dialogContext);
        }
        else{  
            switch(turnContext.activity.text){
                case "Show More":
                    return await this.showAuthorPhotosStep(dialogContext, this.selectedAuthor);
                case "Reset":
                    return await this.showRandomPhotosStep(dialogContext);
            }
            
            if(turnContext.activity.value){
                switch(turnContext.activity.value.action){
                    case "showDescription":
                        await this.showPhotoDescriptionStep(dialogContext, turnContext.activity.value.desc);   
                        return await this.choiceWhatsNextStep(dialogContext, turnContext.activity.value.auth);

                    case "showAuthorPhotos":
                        return await this.showAuthorPhotosStep(dialogContext, turnContext.activity.value.auth);
                        
                    default: console.log(turnContext.activity.value.action);              
                }                
                //return await this.choiceWhatsNextStep(dialogContext, turnContext.activity.value.auth);
            }            
        }
    }

    async showRandomPhotosStep (stepContext){
        return await this.showPhotoCardsCollectionStep(stepContext);
    }

    async showAuthorPhotosStep (stepContext, author){
        return await this.showPhotoCardsCollectionStep(stepContext, author);
    }

    async showPhotoCardsCollectionStep (stepContext, author){
        this.selectedAuthor = author;
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
            choices:  [ { value: 'Show More', synonyms: ['more photos']},
                        { value: 'Reset',     synonyms: ['reset'] } ]
        };
       return await stepContext.prompt('whatsNextPrompt', options);
    }
  
   
    // ================================================
    // Helper functions used to create card collections.
    // ================================================
    
    createPhotoCard(cardData) {

        const photoCard = CardFactory.heroCard(
            cardData.title,
            CardFactory.images([cardData.imageUrl]),
            CardFactory.actions(
//                !cardData.description ?[]:        //   uncomment to remove button if no description available
                [
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
