const rect = `
paper 0
pen 100
line 0 50 100 50
line 100 50 100 150
line 100 150 100 100
`.trim();

/* 렉서 함수 */
function lexer(code) {
  return code
    .split(/\s+/)
    .filter(function (t) {
      return t.length > 0;
    })
    .map(function (t) {
      return isNaN(t)
        ? { type: "word", value: t }
        : { type: "number", value: Number(t) };
    });
}

/* 파서 함수 */
function parser(tokens) {
  let AST = {
    type: "Drawing",
    body: [],
  };

  while (tokens.length > 0) {
    const currentToken = tokens.shift();
    if (currentToken.type === "word") {
      switch (currentToken.value.toLowerCase()) {
        case "paper": {
          const expression = {
            type: "CallExpression",
            name: "Paper",
            arguments: [],
          };
          for (let i = 0; i < 3; i++) {
            const argument = tokens.shift();
            if (argument.type === "number") {
              expression.arguments.push({
                type: "NumberLiteral",
                value: argument.value,
              });
            } else {
              throw "Paper command must be followed by a number.";
            }
          }
          AST.body.push(expression);
          break;
        }
        case "pen": {
          const expression = {
            type: "CallExpression",
            name: "Pen",
            arguments: [],
          };
          const argument = tokens.shift();
          if (argument.type === "number") {
            expression.arguments.push({
              type: "NumberLiteral",
              value: argument.value,
            });
            AST.body.push(expression);
          } else {
            throw "Pen command must be followed by a number.";
          }
          break;
        }
        case "relative": {
          const expression = {
            type: "CallExpression",
            name: "Relative",
            arguments: [],
          };
          for (let i = 0; i < 2; i++) {
            const argument = tokens.shift();
            if (argument.type === "number") {
              expression.arguments.push({
                type: "NumberLiteral",
                value: argument.value,
              });
            } else {
              throw "Pen command must be followed by a number.";
            }
            AST.body.push(expression);
          }
          break;
        }
        case "line": {
          const expression = {
            type: "CallExpression",
            name: "Line",
            arguments: [],
          };
          for (let i = 0; i < 4; i++) {
            const argument = tokens.shift();
            if (argument.type === "number") {
              expression.arguments.push({
                type: "NumberLiteral",
                value: argument.value,
              });
            } else {
              throw "Line command must be followed by a number.";
            }
          }
          AST.body.push(expression);
          break;
        }
        case "circle": {
          const expression = {
            type: "CallExpression",
            name: "Circle",
            arguments: [],
          };
          for (let i = 0; i < 3; i++) {
            const argument = tokens.shift();
            if (argument.type === "number") {
              expression.arguments.push({
                type: "NumberLiteral",
                value: argument.value,
              });
            } else {
              throw "Circle command must be followed by a number.";
            }
          }
          AST.body.push(expression);
          break;
        }
      }
    }
  }
  return AST;
}

/* 변형 함수 */
function transformer(ast) {
  const svgAst = {
    tag: "svg",
    attr: {
      width: 100,
      height: 100,
      viewBox: "0 0 100 100",
      xmlns: "https://www.w3.org/2000/svg",
      version: "1.1",
    },
    body: [],
  };
  let penColor = 100;
  let paperColor;
  let relative = {
    x: 0,
    y: 0,
  };
  while (ast.body.length > 0) {
    const node = ast.body.shift();
    switch (node.name) {
      case "Paper": {
        paperColor = 100 - node.arguments[0].value;
        const width = node.arguments[1].value;
        const height = node.arguments[2].value;
        svgAst.attr.width = width;
        svgAst.attr.height = height;
        svgAst.attr.viewBox = `0 0 ${width} ${height}`;
        svgAst.body.push({
          tag: "rect",
          attr: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            fill: `rgb(${paperColor}%,${paperColor}%,${paperColor}%)`,
          },
        });
        break;
      }
      case "Pen": {
        penColor = 100 - node.arguments[0].value; // keep current pen color in `pen_color` variable

        break;
      }
      case "Relative": {
        relative.x = node.arguments[0].value;
        relative.y = node.arguments[1].value;
        break;
      }
      case "Line": {
        const l1 = node.arguments[0].value + relative.x;
        const l2 = node.arguments[1].value + relative.y;
        const l3 = node.arguments[2].value + relative.x;
        const l4 = node.arguments[3].value + relative.y;
        svgAst.body.push({
          tag: "path",
          attr: {
            d: `M ${l1} ${l2} L ${l3} ${l4} Z`,
            fill: `rgb(${paperColor}%,${paperColor}%,${paperColor}%)`,
            stroke: `rgb(${penColor}%,${penColor}%,${penColor}%)`,
          },
        });
        break;
      }
      case "Circle": {
        const x = node.arguments[0].value + relative.x;
        const y = node.arguments[1].value + relative.y;
        const r = node.arguments[2].value;
        svgAst.body.push({
          tag: "circle",
          attr: {
            cx: x,
            cy: y,
            r,
            fill: `rgb(${paperColor}%,${paperColor}%,${paperColor}%)`,
            stroke: `rgb(${penColor}%,${penColor}%,${penColor}%)`,
          },
        });
        break;
      }
    }
  }
  return svgAst;
}

/* 생성 함수 */
function generator(svg_ast) {
  // create attributes string out of attr object
  // { "width": 100, "height": 100 } becomes 'width="100" height="100"'
  function createAttrString(attr) {
    return Object.keys(attr)
      .map(function (key) {
        return key + '="' + attr[key] + '"';
      })
      .join(" ");
  }

  // top node is always <svg>. Create attributes string for svg tag
  const svg_attr = createAttrString(svg_ast.attr);

  // for each elements in the body of svg_ast, generate svg tag
  const elements = svg_ast.body
    .map(function (node) {
      return (
        "<" +
        node.tag +
        " " +
        createAttrString(node.attr) +
        "></" +
        node.tag +
        ">"
      );
    })
    .join("\n\t");

  // wrap with open and close svg tag to complete SVG code
  return "<svg " + svg_attr + ">\n" + elements + "\n</svg>";
}

// const result = lexer(rect);

// console.log(result);

// const result2 = parser(result);

// console.dir(result2, { depth: null, colors: true });

// const result3 = transformer(result2);

// console.dir(result3, { depth: null, colors: true });

// const result5 = generator(result3);

// console.log(result5);

const compile = function compiler(origin) {
  return generator(transformer(parser(lexer(origin))));
};

export default {
  lexer,
  parser,
  transformer,
  generator,
  compile,
};
