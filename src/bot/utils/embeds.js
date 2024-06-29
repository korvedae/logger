const { displayUsername } = require("./constants")

module.exports = {
  buildEmbedAuthorField (user) {
    return {
      name: user.id === global.bot.user.id ? global.botUserUsername : displayUsername(user),
      icon_url: user.avatarURL
    }
  },
  buildEmbedFooterField (user) {
    return {
      text: user.id === global.bot.user.id ? global.botUserUsername : displayUsername(user),
      icon_url: user.dynamicAvatarURL(null, 64)
    }
  },
}
