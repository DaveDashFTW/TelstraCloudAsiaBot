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

                bot.send(new builder.Message()
                    .address(message.address)
                    .attachments([ 
                        new builder.HeroCard(session)
                        .title('Telstra Global')
                        .subtitle('')
                        .text("Hello!  I'm a Telstra Bot. To get started ask me some questions about Telstra Products and Services or click on some of the suggested actions below!")
                        .images([
                            builder.CardImage.create(session, 'http://cdn.downdetector.com/static/uploads/c/300/6e880/Telstra_logo.svg_1_1.png')
                        ])
                        .buttons([
                            builder.CardAction.openUrl(session, 'http://www.telstraglobal.com', 'View Website')
                        ])
                     ])
                     .suggestedActions(
                        builder.SuggestedActions.create(
                                session, [
                                    builder.CardAction.imBack(session, "productId=1", "Programmable Network"),
                                    builder.CardAction.imBack(session, "productId=2", "Connectivity"),
                                    builder.CardAction.imBack(session, "productId=3", "Managed Networks"),
                                    builder.CardAction.imBack(session, "productId=4", "Cloud"),
                                    builder.CardAction.imBack(session, "productId=5", "Collaboration"),
                                    builder.CardAction.imBack(session, "productId=6", "Consulting and Services")
                                ]
                            ))
                        );


					/*.addAttachment({ name: "Telstra Logo", contentType: 'ímage/png', contentUrl: "http://cdn.downdetector.com/static/uploads/c/300/6e880/Telstra_logo.svg_1_1.png"})
                    .text("Hello!  I'm a Telstra Bot. To get started ask me some questions about Telstra Products and Services - for example - ask me for a service description"));
                     */
                }
        });
    }
});

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: 'd64d542d-50ed-4705-91c4-d7d669a19235', 
	subscriptionKey: 'fbb1f7214c464e3f8bbb7bb65713b937',
	top: 3});
    
var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
                defaultMessage: 'No match! Try changing the query terms!',
                qnaThreshold: 0.7,
                feedbackLib: qnaMakerTools}
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
