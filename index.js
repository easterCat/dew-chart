(function(win, dom) {
	var defaultOptions = {}

	function createDewChart(options) {
		defaultOptions = {
			content: null, // 容器id
			contentElement: null, // 容器元素
			data: [], // 所有的数据
			random: [], // 所有的字段
			range: [1, 5], // 最小行/最大行
			nodes: [], // 生成的节点
			positions: [], // 节点定位
			list: 1,
			baseWidth: 30,
			style: 'solid', // solid / hollow
			rule: function() {}
		}

		var ops = Object.assign({}, defaultOptions, options, {
			positions: [],
			nodes: [],
			list: 1
		})

		ops.contentElement = _renderContent(ops) // 渲染容器
		ops.random = _getRandom(ops.data) // 获取随机值列表
		ops.nodes = _createNode(ops) // 将data转化为node
		_renderColLine(ops) // 渲染列
		_renderRowLine(ops) // 渲染行
		_renderNode(ops) // 将nodes渲染程dom的真实node
	}

	function _getRandom(data) {
		var obj = {}
		var length = data.length
		for (var i = 0; i < length; i++) {
			if (!obj.hasOwnProperty(data[i])) {
				obj[data[i]] = 0
			}
			obj[data[i]]++
		}
		return Object.getOwnPropertyNames(obj)
	}

	function DewNode(name, pos, direction) {
		this.name = name
		this.row = pos[0] // 行
		this.col = pos[1] // 列
		this.position = [this.row, this.col]
		this.list = defaultOptions.list
		this.direction = direction // forward , right
	}

	DewNode.prototype.getCol = function(minus) {
		if (minus) {
			return this.col + minus
		}
		return this.col
	}

	DewNode.prototype.getRow = function(minus) {
		if (minus) {
			return this.row + minus
		}
		return this.row
	}

	DewNode.prototype.getPosition = function() {
		return this.row
	}

	DewNode.prototype.getName = function() {
		return this.name
	}

	DewNode.prototype.getDirection = function() {
		return this.direction
	}

	function _createNode(ops) {
		var nodes = []
		var data = ops.data
		var max = ops.range[1]
		var dataLength = data.length
		var i, current, nodeLength, prevNode

		for (i = 0; i < dataLength; i++) {
			current = data[i] // 大,小,小,大

			if (i === 0) {
				nodes.push(new DewNode(current, [1, 1], 'forward'))
				addPos([1, 1])
			} else {
				nodeLength = nodes.length
				prevNode = nodes[nodeLength - 1]

				if (prevNode.getName() === current) {
					if (prevNode.getRow() < max) {
						if (prevNode.getDirection() === 'right') {
							// 列递增
							nodes.push(
								new DewNode(
									current,
									[prevNode.getRow(), prevNode.getCol(1)],
									'right'
								)
							)
							addPos([prevNode.getRow(), prevNode.getCol(1)])
						} else {
							// 如果向前已经不可走
							if (isHasPos([prevNode.getRow(1), prevNode.getCol()])) {
								// 行递增
								nodes.push(
									new DewNode(
										current,
										[prevNode.getRow(), prevNode.getCol(1)],
										'right'
									)
								)
								addPos([prevNode.getRow(), prevNode.getCol(1)])
							} else {
								// 行递增
								nodes.push(
									new DewNode(
										current,
										[prevNode.getRow(1), prevNode.getCol()],
										'forward'
									)
								)
								addPos([prevNode.getRow(1), prevNode.getCol()])
							}
						}
					} else {
						// 列递增
						nodes.push(
							new DewNode(
								current,
								[prevNode.getRow(), prevNode.getCol(1)],
								'right'
							)
						)
						addPos([prevNode.getRow(), prevNode.getCol(1)])
					}
				} else {
					defaultOptions.list++

					nodes.push(new DewNode(current, [1, defaultOptions.list], 'forward'))
					addPos([1, defaultOptions.list])
				}
			}
		}

		return nodes
	}

	function addPos(arr) {
		defaultOptions.positions.push(arr.toString())
	}

	function isHasPos(arr) {
		return defaultOptions.positions.indexOf(arr.toString()) >= 0
	}

	function _renderContent(ops) {
		var contentElement = dom.getElementById(ops.content)
		_removeChildNode(contentElement)

		if (!contentElement) {
			throw new Error('dew的容器不是一个正确的元素')
		}

		_addCss(contentElement, {
			width: ops.contentWH[0] + 'px',
			height: ops.contentWH[1] + 'px',
			border: '1px solid #EADFFF',
			background: '#FCFBFF',
			position: 'relative'
		})

		return contentElement
	}

	function _removeChildNode(element) {
		while (element.hasChildNodes()) {
			element.removeChild(element.firstChild)
		}
	}

	// 生成节点
	function _renderNode(ops) {
		var nodes = ops.nodes
		var random = ops.random
		var length = nodes.length
		var i, child, bg

		// console.group()
		// console.log('生成的数据', nodes)
		// console.groupEnd()

		for (i = 0; i < length; i++) {
			var item = nodes[i]
			var name = item.getName()
			if (name === random[0]) bg = '#4F62EA'
			if (name === random[1]) bg = '#C30E0E'

			child = document.createElement('div')

			if (ops.style === 'solid') {
				_addCss(child, {
					left: item.getCol(-1) * ops.baseWidth + 3 + 'px',
					top: item.getRow(-1) * ops.baseWidth + 3 + 'px',
					position: 'absolute',
					width: ops.baseWidth - 6 + 'px',
					height: ops.baseWidth - 6 + 'px',
					background: bg,
					'border-radius': '90px',
					display: 'inline-block',
					color: '#fff',
					'line-height': ops.baseWidth - 6 + 'px',
					'text-align': 'center'
				})
			} else {
				_addCss(child, {
					left: item.getCol(-1) * ops.baseWidth + 3 + 'px',
					top: item.getRow(-1) * ops.baseWidth + 3 + 'px',
					position: 'absolute',
					width: ops.baseWidth - 6 + 'px',
					height: ops.baseWidth - 6 + 'px',
					border: '2px solid ' + bg,
					'border-radius': '90px',
					display: 'inline-block',
					color: '#fff',
					'line-height': ops.baseWidth - 6 + 'px',
					'text-align': 'center'
				})
			}

			// child.innerText = item.getName()
			ops.contentElement.appendChild(child)
		}
	}

	function _renderColLine(ops) {
		var index = 1
		var run = true

		while (run) {
			var div = document.createElement('div')
			_addCss(div, {
				left: index * ops.baseWidth + 'px',
				width: '1px',
				height: '100%',
				background: '#EADFFF',
				display: 'inline-block',
				position: 'absolute'
			})
			ops.contentElement.appendChild(div)
			index++
			if (index * ops.baseWidth >= ops.contentWH[0]) {
				run = false
			}
		}
	}

	function _renderRowLine(ops) {
		var index = 1
		var run = true

		while (run) {
			var div = document.createElement('div')
			_addCss(div, {
				top: index * ops.baseWidth + 'px',
				width: '100%',
				height: '1px',
				background: '#EADFFF',
				display: 'inline-block',
				position: 'absolute',
				left: '0'
			})
			ops.contentElement.appendChild(div)
			index++
			if (index * ops.baseWidth >= ops.contentWH[1]) {
				run = false
			}
		}
	}

	function _addCss(context, style) {
		style = style || {}
		var names = Object.getOwnPropertyNames(style)
		var length = names.length
		var text = ''
		var i

		for (i = 0; i < length; i++) {
			text += names[i] + ':' + style[names[i]] + ';'
		}
		context.setAttribute('style', text)
	}

	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = createDewChart
	} else if (
		typeof win.define === 'function' &&
		(win.define.amd || win.define.cmd)
	) {
		win.define('createDewChart', [], function() {
			return createDewChart
		})
	} else {
		win.createDewChart = createDewChart
	}
})(window, document)
