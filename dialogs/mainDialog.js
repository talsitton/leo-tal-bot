
const { AttachmentLayoutTypes, CardFactory, MessageFactory } = require('botbuilder');
const { DialogSet, Dialog } = require('botbuilder-dialogs');
const { PhotoCardData, PhotoCardsDataProvider} = require('../data_providers/PhotoCardsDataProvider.js');
const AdaptivePhotoCard = require('./adaptivePhotoCard.json');

const CARDS_NUM = 5;

class MainDialog extends Dialog {

    constructor() {
        super('MainDialog');
        this.selectedAuthor = null;
        this.cardsLayout = AttachmentLayoutTypes.List;
    }

    // perform the flow logic on each of the bot's activity
    async run(turnContext, accessor) {

        const dialogSet = new DialogSet(accessor);
        const dialogContext = await dialogSet.createContext(turnContext);
        
        if (turnContext.activity.type != 'message'){
            return await this.showWelcomeStep(dialogContext);
        }     

        if(turnContext.activity.value){
            this.selectedAuthor = turnContext.activity.value.auth || this.selectedAuthor;

            switch(turnContext.activity.value.action){
                case "showDescription":
                    await this.showPhotoDescriptionStep(dialogContext, turnContext.activity.value.desc);   
                    return await this.choiceWhatsNextStep(dialogContext);
                case "chooseLayout": 
                    this.cardsLayout = turnContext.activity.value.layout;
                    return await this.showPhotoCardsCollectionStep(dialogContext);
                case "reset": 
                    this.selectedAuthor = null;
                    return await this.showWelcomeStep(dialogContext);
                case "showAuthorPhotos":
                    return await this.showPhotoCardsCollectionStep(dialogContext);
                                                                
                default: console.log(turnContext.activity.value.action);              
            }
        }
    }

    async showWelcomeStep(stepContext){

        await stepContext.context.sendActivity('Welcome to the Flicker Photo Card Bot');
        var reply = MessageFactory.suggestedActions([
            { title:'List',       type:'postBack',  value:{action:'chooseLayout', layout:AttachmentLayoutTypes.List}},
            { title:'Carousel' ,  type:'postBack',  value:{action:'chooseLayout', layout:AttachmentLayoutTypes.Carousel}}
        ], "Choose your Photo Cards Layout:");

        return await stepContext.context.sendActivity(reply);
    }

    async showPhotoCardsCollectionStep (stepContext){

        var cardsData = await PhotoCardsDataProvider.getFlickerCardsData(CARDS_NUM, this.selectedAuthor);
       
        return await stepContext.context.sendActivity(
            {   attachments: (cardsData.map((card) => {return this.createPhotoCard(card) })),
                attachmentLayout: this.cardsLayout 
            });
    }

    async showPhotoDescriptionStep (stepContext, desc, auth) {

        return await stepContext.context.sendActivity({text:desc});
    }
    
    async choiceWhatsNextStep(stepContext){

        var reply = MessageFactory.suggestedActions([
                { title:'Show More', type:'postBack', value:{action:'showAuthorPhotos'}},
                { title:'Reset' ,    type:'postBack', value:{action:'reset'}}
            ], "What's Next?");

        return await stepContext.context.sendActivity(reply);
    }
     
    // ================================================
    // Helper functions used to create AdaptivePhotoCard.
    // @paremeter PhotoCardData cardData
    // @return  AdaptivePhotoCard
    // ================================================
    
    createPhotoCard(cardData) {

        //convert AdaptivePhotoCard template object to json string for populating data
        var apcStr =  JSON.stringify(AdaptivePhotoCard); 

        // populate data from the PhotoCardData input to the AdaptivePhotoCard template
        for(var k in cardData) apcStr = apcStr.replace(new RegExp('"{'+ k +'}"', "g"), JSON.stringify(cardData[k]));

        return CardFactory.adaptiveCard(JSON.parse(apcStr));
    }
}

module.exports.MainDialog = MainDialog;
