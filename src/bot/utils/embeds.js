const { displayUsername } = require("./constants")

module.exports = {
  getEmbedFooter (user) {
    return {
      text: user.id === global.bot.user.id ? global.botUserUsername : displayUsername(user),
      icon_url: user.dynamicAvatarURL(null, 64)
    }
  },
  getAuthorField (user) {
    return {
      name: displayUsername(user),
      icon_url: user.avatarURL
    }
  }
}
