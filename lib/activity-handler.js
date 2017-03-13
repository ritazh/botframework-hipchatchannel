"use strict"

const uuid = require('uuid');

class ActivityHandler {
  static handle(activity) {
    let messages = [];

    if (!activity.replyToId) {
      return messages;
    }

    switch (activity.type.toLowerCase()) {
      case "message":
        break;
      default:
        // typing
        // endofconversation
        // contactrelation
        console.log(`Unhandled message activity: ${activity.type}`)
        return messages;
    }

    if (activity.text) {
      messages.push({
        message: activity.text,
        options: {
            format: "text"
        }
      })
    }

    if (activity.attachments) {
      for (let i = 0; i < activity.attachments.length; i++) {
        let attachment = activity.attachments[i]

        switch (attachment.contentType) {
            case "image/jpeg":
              messages.push({
                card: {
                  "style": "image",
                  "id": uuid.v4(),
                  "url": attachment.contentUrl,
                  "title": attachment.name || attachment.contentUrl,
                  "thumbnail": {
                    "url": attachment.thumbnailUrl || attachment.contentUrl,
                  }
                }
              })
              break;
            case "application/vnd.microsoft.card.hero":
            case "application/vnd.microsoft.card.thumbnail":
              messages.push({
                message: attachment.content.title || attachment.content.subtitle || attachment.content.text,
                  card: {
                    "style": "image",
                    "id": uuid.v4(),
                    "url": attachment.content.buttons[0].value,
                    "title": attachment.content.title,
                    "description": attachment.content.text,
                    "thumbnail": {
                      "url": attachment.content.images[0].url
                    }
                  }
              })
              break;
            case "application/vnd.microsoft.card.receipt":
              let attributes = []
              let description = ""
              
              // HipChat is not processing linebreaks properly. Will omit this for now.
              // let facts = attachment.content.facts
              // for (i = 0; i < facts.length; i++) {
              //   description = facts[i].key + ": " + facts[i].value + "\n"
              // }

              let items = attachment.content.items
              
              for (i = 0; i < items.length; i++) {
                attributes.push({
                  "label": items[i].title,
                  "value": {
                    "label": items[i].price + " x " + items[i].quantity
                  }
                })
              }

              description = "<b>Tax:</b>" + attachment.content.tax + "  |   <b>Total:</b>" + attachment.content.total
      
              messages.push({
                message: attachment.content.title || attachment.content.subtitle || attachment.content.text,
                  card: {
                    "style": "application",
                    "id": uuid.v4(),
                    "url": attachment.content.buttons[0].value,
                    "title": attachment.content.title,
                    "description": {
                      "format": "html",
                      "value": description
                    },
                    "attributes": attributes
                  }
              })
              break;
            default:
              console.log(`Unhandled activity contentType: ${attachment.contentType}`)
              break;
        }
      }
    }

    return messages
  }
}

module.exports = ActivityHandler