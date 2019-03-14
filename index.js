(function (win, dom) {
  var defaultOptions = {
    content: null, //容器id
    contentElement: null, //容器元素
    data: [], //所有的数据
    random: [], //所有的字段
    range: [1, 5], //最小行/最大行
    nodes: [], //生成的节点
    rule: function () {
    }
  };

  function createDewChart(options) {
    var ops = Object.assign({}, defaultOptions, options);

    ops.contentElement = _renderContent(ops); //渲染容器
    _renderColLine(ops); //渲染列
    _renderRowLine(ops); //渲染行
    ops.random = _getRandom(ops.data); //获取随机值列表
    ops.nodes = _createNode(ops); //将data转化为node
    _renderNode(ops); //将nodes渲染程dom的真实node
  }

  function _getRandom(data) {
    var obj = {};
    var length = data.length;
    for (var i = 0; i < length; i++) {
      if (!obj.hasOwnProperty(data[i])) {
        obj[data[i]] = 0;
      }
      obj[data[i]]++;
    }
    return Object.getOwnPropertyNames(obj);
  }

  function _createNode(ops) {
    var nodes = [];
    var data = ops.data;
    var range = ops.range;
    var min = range[0];
    var max = range[1];
    var obj = {direction: "down"};
    var length = data.length;
    var prev_index = 0;
    var curr_index = 0;
    var i, node, current;
    var bool = true;

    // obj : { direction: "down" , min:1 , max:5 , 龙:9}
    for (i = 0; i < length; i++) {
      if (i === 0) {
        current = data[i]; //大,小,小,大
        obj[data[i]] = 1;
      } else {
        //如果current不等于循环值,且obj中不存在循环值属性,需要设置新的obj
        if (current !== data[i] && !obj[data[i]]) {
          if (obj[current] > range[1]) {
            prev_index = nodes.length;
          }
          obj.min = min;
          obj.max = max;
          nodes.push(obj);
          obj = {direction: "down"};
          current = data[i];
          obj[data[i]] = 1;
          max = range[1];
          min = range[0];
          bool = true;
        } else {
          //在min和max的范围之内,当前属性值正常往下加
          if (obj[data[i]] >= min && obj[data[i]] < max) {
            obj[data[i]]++;
          } else {
            //当统计总数超多max的最大限制之后,需要将方向设置为右边,同时继续累积当前的统计数
            curr_index = nodes.length;
            obj[data[i]]++;
            obj["direction"] = "right";

            if (prev_index !== 0) {
              node = nodes.slice(prev_index, prev_index + 1)[0];
              if (node) {
                //当前累积值与最大值的差大于两个节点之间的index差的时候,继续累加会顶到之前的节点,需要减少当前节点的最大值
                var key = intersection(Object.getOwnPropertyNames(node), ops.random);
                if ((node[key] - node["max"]) > (curr_index - prev_index)) {
                  bool && max--;
                  bool = false;
                }
              }
            }
          }
        }
      }
    }

    // console.group();
    // console.log("传入的数据", data);
    // console.log("生成的数据", nodes);
    // console.groupEnd();

    return nodes;
  }

  function _renderContent(ops) {
    var contentElement = dom.getElementById(ops.content);

    if (!contentElement) {
      throw new Error("dew的容器不是一个正确的元素");
    }
    addCss(contentElement, {
      width: ops.contentWH[0] + "px",
      height: ops.contentWH[1] + "px",
      border: "1px solid #EADFFF",
      background: "#FCFBFF",
      position: "relative"
    });
    return contentElement;
  }

  function _renderNode(ops) {
    var nodes = ops.nodes;
    var random = ops.random;
    var length = nodes.length;
    var i, j, k, child, bg;
    for (i = 0; i < length; i++) {
      var item = nodes[i];
      var arr = intersection(Object.getOwnPropertyNames(item), random);

      if (arr.length === 0) {
        throw new Error("当前的节点属性有错误");
      }

      var num = item[arr[0]];
      if (arr[0] === random[0]) bg = "#4F62EA";
      if (arr[0] === random[1]) bg = "#C30E0E";

      //当num大于等于最小值的时候,或者小于等于最大值时候,正常渲染
      if (num >= item.min && num <= item.max) {
        for (j = 0; j < num; j++) {
          child = document.createElement("div");
          addCss(child, {
            left: i * 30 + 3 + "px",
            top: j * 30 + 3 + "px",
            position: "absolute",
            width: "24px",
            height: "24px",
            background: bg,
            "border-radius": "90px",
            display: "inline-block",
            color: "#fff",
            "line-height": "24px",
            "text-align": "center"
          });

          child.innerText = arr[0];
          ops.contentElement.appendChild(child);
        }
      } else {
        var minus = num - item.max;
        for (j = 0; j < item.max; j++) {
          child = document.createElement("div");
          addCss(child, {
            left: i * 30 + 3 + "px",
            top: j * 30 + 3 + "px",
            position: "absolute",
            width: "24px",
            height: "24px",
            background: bg,
            "border-radius": "90px",
            display: "inline-block",
            color: "#fff",
            "line-height": "24px",
            "text-align": "center"
          });

          child.innerText = arr[0];
          ops.contentElement.appendChild(child);
        }

        for (k = 0; k < minus; k++) {
          child = document.createElement("div");
          addCss(child, {
            left: i * 30 + k * 30 + 3 + "px",
            top: (j - 1) * 30 + 3 + "px",
            position: "absolute",
            width: "24px",
            height: "24px",
            background: bg,
            "border-radius": "90px",
            display: "inline-block",
            color: "#fff",
            "line-height": "24px",
            "text-align": "center"
          });

          child.innerText = arr[0];
          ops.contentElement.appendChild(child);
        }
      }
    }
  }

  function _renderColLine(ops) {
    var index = 1;
    var run = true;

    while (run) {
      var div = document.createElement("div");
      addCss(div, {
        left: index * 30 + "px",
        width: "1px",
        height: "100%",
        background: "#EADFFF",
        display: "inline-block",
        position: "absolute"
      });
      ops.contentElement.appendChild(div);
      index++;
      if (index * 30 >= ops.contentWH[0]) {
        run = false;
      }
    }
  }

  function _renderRowLine(ops) {
    var index = 1;
    var run = true;

    while (run) {
      var div = document.createElement("div");
      addCss(div, {
        top: index * 30 + "px",
        width: "100%",
        height: "1px",
        background: "#EADFFF",
        display: "inline-block",
        position: "absolute"
      });
      ops.contentElement.appendChild(div);
      index++;
      if (index * 30 >= ops.contentWH[1]) {
        run = false;
      }
    }
  }

  function addCss(context, style) {
    style = style || {};
    var names = Object.getOwnPropertyNames(style);
    var length = names.length;
    var text = "";
    var i;

    for (i = 0; i < length; i++) {
      text += names[i] + ":" + style[names[i]] + ";";
    }
    context.setAttribute("style", text);
  }

  function intersection(array) {
    var result = [];
    var argLength = arguments.length;
    var arrLength = array.length;
    var i;
    for (i = 0; i < arrLength; i++) {
      var item = array[i];
      if (result.indexOf(item) > -1) continue;
      var j;
      for (j = 1; j < argLength; j++) {
        if (arguments[j].indexOf(item) === -1) break;
      }
      if (j === argLength) result.push(item);
    }
    return result;
  }

  if (typeof module !== "undefined" && typeof exports === "object") {
    module.exports = createDewChart;
  } else if (
    typeof win.define === "function" &&
    (win.define.amd || win.define.cmd)
  ) {
    win.define("createDewChart", [], function () {
      return createDewChart;
    });
  } else {
    win.createDewChart = createDewChart;
  }
})(window, document);
