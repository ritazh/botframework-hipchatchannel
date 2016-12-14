const request = require('request')
const WebSocket = require('ws')
const BOTFRAMEWORK_BASE = 'https://directline.botframework.com/v3/directline'

module.exports = {
  init: (app, addon, hipchat) => {
    function startConversation () {
      return new Promise((resolve, reject) => {
        request({
          url: `${BOTFRAMEWORK_BASE}/conversations`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env['DIRECT_LINE_SECRET']}`
          },
          json: true
        }, (err, resp, body) => {
          if (err) reject(err)
          resolve(body)
        })
      })
    }

    addon.settings.getAllClientInfos().then(resp => {
      console.log('getAllClientInfos resp')
      console.log(resp)
      resp.map(tenant => {
        startConversation().then((conversation) => {
          console.log(conversation)
          addon.settings.set('conversation', conversation, tenant.clientKey)
          const ws = new WebSocket(conversation.streamUrl)
          ws.on('message', (msg) => {
            console.log('ws message')
            if (msg) {
              console.log(msg)
              const msgJSON = JSON.parse(msg)
              const msgObj = msgJSON.activities[0]
              console.log(msgJSON.activities)
              if (msgObj.replyToId) hipchat.sendMessage(tenant, tenant.roomId, msgObj.text)
            } else {
              console.log('ws msg is null')
            }
          })
        })
      })
    })
  },

  postActivity: function postActivity (activity, conversationId) {
    return new Promise((resolve, reject) => {
      console.log(activity)
      request({
        url: `${BOTFRAMEWORK_BASE}/conversations/${conversationId}/activities`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env['DIRECT_LINE_SECRET']}`,
          'Content-Type': 'application/json'
        },
        json: activity
      }, (err, resp, body) => {
        if (err) reject(err)
        resolve(body)
      })
    })
  }
}

