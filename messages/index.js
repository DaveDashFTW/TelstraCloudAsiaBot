// For more information about this template visit http://aka.ms/azurebots-node-qnamaker

"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");
var path = require('path');

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
           
                var session = bot.loadSession(message.address, function(err,session) {} );
                var card = createTelstraThumbCard(session);
                bot.send(new builder.Message()
                    .address(message.address)
                    .addAttachment({ card }));
					/*.addAttachment({ name: "Telstra Logo", contentType: 'ímage/png', contentUrl: "http://cdn.downdetector.com/static/uploads/c/300/6e880/Telstra_logo.svg_1_1.png"})
                    .text("Hello!  I'm a Telstra Bot. To get started ask me some questions about Telstra Products and Services - for example - ask me for a service description"));
                     */
                }
        });
    }
});

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
                knowledgeBaseId: process.env.QnAKnowledgebaseId, 
    subscriptionKey: process.env.QnASubscriptionKey});
    
var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
                defaultMessage: 'No match! Try changing the query terms!',
                qnaThreshold: 0.3}
);


bot.dialog('/', basicQnAMakerDialog);

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

//
//Helper Functions
//

function createTelstraThumbCard(session) {
    return new builder.ThumbnailCard(session)
        .title('Telstra Global')
        .text("Hello!  I'm a Telstra Bot. To get started ask me some questions about Telstra Products and Services - for example - ask me for a service description")
        .images([
            builder.CardImage.create(session, 'http://cdn.downdetector.com/static/uploads/c/300/6e880/Telstra_logo.svg_1_1.png')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'http://www.telstraglobal.com', 'View More')
        ]);
}