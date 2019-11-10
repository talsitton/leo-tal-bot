/** 
 * PhotoCardsDataProvider is a utility class for fetching relevant photo's data
 * from 3rd party photo APIs providers such as Flicker and normalize it for display in the Bot's dialogs
 */

const FlickerApiBaseUrl = 'https://api.flickr.com/services/rest?extras=description%2Cdate_taken%2Cowner_name%2Crealname%2Curl_s&viewerNSID=&csrf=&api_key=a85c4df7177d836e50ed46b111bc72c2&format=json&hermes=1&hermesClient=1&reqId=c798cd67&nojsoncallback=1';

const pTypes = {FLICKER:'flicker'};

let nextAuthorPage = 0;

class PhotoCardsDataProvider {

    static async getPhotoCardsData(num = 5, author = null, random = true, providerType = pTypes.FLICKER){
      
        switch(providerType){
            case pTypes.FLICKER:
            default:  return await this.getFlickerCardsData(num, author);
        }
     }

    static async getFlickerCardsData(num = 5, author = null){  

        var url = FlickerApiBaseUrl;

        if(!author){
            nextAuthorPage=0;
            url +=  '&method=flickr.photos.getRecent&per_page='+ num +'&page='+ (Math.floor(Math.random() * (1000/num)) + 1);
        }
        else{
            nextAuthorPage++;
            url +=  '&method=flickr.photos.search&per_page='+ num +'&page='+ nextAuthorPage +'&user_id='+author;
        }
        var rawData = await fetch(url).then(res => res.json());
        var fPhotos = rawData.photos.photo;
     
        var cardsData = fPhotos.map((c, i)=>{
            return new PhotoCardData(c.title, c.url_s, c.description._content, c.ownername, c.datetaken, c.owner, c.id);   });       
      
        return cardsData;
    }
   
}
class PhotoCardData{

    constructor(title="", imageUrl="", description="", author="",  dateTaken="", authorId="", id=""){

        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description
        this.author = author;
        this.dateTaken = dateTaken;
        this.id = id;
        this.authorId = authorId;
    }
}
 
module.exports.PhotoCardsDataProvider = PhotoCardsDataProvider;
module.exports.PhotoCardData = PhotoCardData;
