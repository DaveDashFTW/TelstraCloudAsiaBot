// For more information about this template visit http://aka.ms/azurebots-node-qnamaker

"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");
var path = require('path');
var fs = require("fs");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.localePath(path.join(__dirname, './locale'));

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {            
                bot.beginDialog(message.address, 'greetingDialog');                
            }
        });
    }
});

bot.on('routing', function(session) {
    if (session.message.text === "Business Solutions") {
        session.send("DEBUG: Intercepted Business Solutions message");
        session.message.text = "";
        session.send(new builder.Message().attachmentLayout(builder.AttachmentLayout.carousel).attachments(buildHeroCards(session)).suggestedActions(returnDefaultSuggestedActions(session)));
    }
});

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: 'd64d542d-50ed-4705-91c4-d7d669a19235', 
	subscriptionKey: 'fbb1f7214c464e3f8bbb7bb65713b937',
	top: 4});
    
var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
                defaultMessage: 'No match! Try changing the query terms!',
                qnaThreshold: 0.1,
                feedbackLib: qnaMakerTools}
);

basicQnAMakerDialog.respondFromQnAMakerResult = function(session, qnaMakerResult){
    
        var result = qnaMakerResult;
        session.send("DEBUG: " + result.answers[0].answer);
        if(result.answers[0].answer === "Business Solutions")
        {
            var response = new builder.Message().attachmentLayout(builder.AttachmentLayout.carousel).attachments(buildHeroCards(session)); 
        }
        else {
            var response = new builder.Message().text(result.answers[0].answer);
        }

        response = response.suggestedActions(returnDefaultSuggestedActions(session));

        session.send(response);
    
};


bot.dialog('/', basicQnAMakerDialog);
bot.dialog('greetingDialog',  [ 
    function(session, args, next) {
    session.send(new builder.Message()
        .attachments([ 
            new builder.HeroCard(session)
            .title('Telstra Global')
            .subtitle('Hello!')
            .text("I'm a Telstra Bot. To get started please tell me your name, and we'll go from there! At any time if you want to ask me a question about Telstra products and services, then feel free to just type your question in the chat window.")
            .images([
                builder.CardImage.create(session, 'http://cdn.downdetector.com/static/uploads/c/300/6e880/Telstra_logo.svg_1_1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://www.telstraglobal.com', 'View Website')
            ])
        ]));
        next();
    },
    function(session, args) {
        builder.Prompts.text(session, "What is your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.choice(session, 'Hello ${results.response}! What would you like to know about?', 'Business Solutions|Contact|Help|Restart Me', { listStyle: 3} );
        session.endDialog();   
    }
]);


/////////////////////////////////////
//HELPER FUNCTIONS
/////////////////////////////////////
function greetingMessage(session) {
    return [
        new builder.Message()
        .attachments([ 
            new builder.ThumbnailCard(session)
            .title('Telstra Global')
            .subtitle('')
            .text("Hello!  I'm a Telstra Bot. To get started ask me some questions about Telstra Products and Services or click on some of the suggested actions below!")
            .images([
                builder.CardImage.create(session, 'http://cdn.downdetector.com/static/uploads/c/300/6e880/Telstra_logo.svg_1_1.png')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'http://www.telstraglobal.com', 'View Website')
            ])
         ]),
         new builder.Message()
         .attachmentLayout(builder.AttachmentLayout.carousel)
         .attachments(buildHeroCards(session)),
          
        ]
}

function returnDefaultSuggestedActions(session) {
    return new builder.SuggestedActions.create(
        session, [
            builder.CardAction.postBack(session, "Business Solutions", "Business Solutions"),
            builder.CardAction.postBack(session, "Contact Us", "Contacts Us"),
            builder.CardAction.postBack(session, "Help", "Help"),
            builder.CardAction.postBack(session, "Restart Me", "Restart Me"),
        ]
    );
}

function buildHeroCards(session) {
    return [
        new builder.ThumbnailCard(session)
            .title("Liberate your workforce")
            .text("Time or location shouldn’t stop your staff from living the life they want whilst achieving great things for your business. Agility and flexibility are imperative for a productive workforce of the future. And, it is connection that fosters collaboration. \n\r By removing the barriers that inhibit real-time, secure communication we can help to liberate your team. This means your staff can be out there, wherever and whenever, working in the moment. Capitalising on opportunities and getting the balance they need.")
            .images([
                builder.CardImage.create(session, "data:image/png;base64,"+ new Buffer(fs.readFileSync("./icons/accessibility.png").toString("base64")))
            ])
            .buttons([
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Cloud Collaboration" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "SIP Connect" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Global VoIP" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Collaboraton Consulting" ),
        ]),
        new builder.ThumbnailCard(session)
            .title("Reach Global Markets")
            .text("Our network and solutions help you to seamlessly grow your business into new markets. Ensuring you can reliably connect with a new customer when and where you need to. Or securely share information with a supplier to protect your IP. \n\r Cost-efficient, flexible solutions means you have the agility to scale when the time strikes, whenever that might be. The most important thing, is making sure you are ready when it does and that’s what we’re here to help with.")
            .images([
                builder.CardImage.create(session, "data:image/png;base64,"+ new Buffer(fs.readFileSync("./icons/growth.png").toString("base64")))
            ])
            .buttons([
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Virtual Private Networks" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Colocation" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Ethernet VPN" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "IP Transit" ),
                builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Network Consulting" ),
        ]),
        new builder.ThumbnailCard(session)
        .title("Optimise Your IT")
        .text("New technologies are being created every second of every day. It’s not just about adding new layers of technology. We work with you to maximise the efficiency of your systems so you can move as fast as you need, adapt to change whenever it is called for, and drive solutions for your customers at the core of your own businesses. \n\r We work with you to develop solutions that will refine and integrate new technologies into your business. Promoting flexibility to scale, grow and innovate when you need.")
        .images([
            builder.CardImage.create(session, "data:image/png;base64,"+ new Buffer(fs.readFileSync("./icons/optimise.png").toString("base64")))
        ])
        .buttons([
            builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Cloud Infrastructure" ),
            builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Public Cloud" ),
            builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Managed SD-WAN" ),
            builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "vBlock System" ),
            builder.CardAction.openUrl(session, "https://www.telstraglobal.com/#", "Cloud Consulting" ),
    ])
    ]   
}

function buildProductCards(session, text) {
    var cardData = text.split(";");

return [
    new builder.HeroCard(session)
        .title(cardData[1])
        .subtitle('')
        .text(cardData[2])
        .images([
            builder.CardImage.create(session, 'https://www.telstraglobal.com/images/assets/programmable/our-vision-image2.png')
        ])    
        .buttons([
            builder.CardAction.openUrl(session, cardData[7], "Learn More")
        ]),

    new builder.HeroCard(session)
    .title(cardData[3])
    .subtitle('')
    .text(cardData[4])    .buttons([
        builder.CardAction.openUrl(session, cardData[7], "Learn More")
    ]),

    new builder.HeroCard(session)
    .title(cardData[5])
    .subtitle('')
    .text(cardData[6])
    .buttons([
        builder.CardAction.openUrl(session, cardData[7], "Learn More")
    ])
    ]
}

// Other wrapper functions
function beginDialog(address, dialogId, dialogArgs) {
    bot.beginDialog(address, dialogId, dialogArgs);
}

function sendMessage(message) {
    bot.send(message);
}

module.exports = {
    beginDialog: beginDialog,
    sendMessage: sendMessage
};

/////////////////////////////////////
//FOR DEBUGGING
/////////////////////////////////////

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
