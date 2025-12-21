const path = require('path')
const prod = require('./webpack.config.prod.js')

module.exports = () => {
	let dev = prod()
	dev.mode = 'development'
	dev.devServer = {
	  static: {
		directory: path.join(__dirname, 'public'),
	  },
	  hot: true,
	  open: false,
	  port: 8080
	}
	dev.resolve.alias['dnsmasq-api'] = path.join(__dirname, 'src/model/dnsmasq-api-mock.js')
	return dev
}
